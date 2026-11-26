import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import test from 'node:test';
import { collectEvidence } from './collect-evidence.mjs';

async function workspace(context) {
  const directory = await mkdtemp(join(tmpdir(), 'library-evidence-test-'));
  context.after(async () => {
    assert.ok(resolve(directory).startsWith(`${resolve(tmpdir())}${sep}library-evidence-test-`));
    await rm(directory, { recursive: true, force: true });
  });
  return directory;
}

test('missing reports remain unavailable without invented metrics', async (context) => {
  const result = await collectEvidence(await workspace(context));
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.entries.length, 5);
  assert.ok(result.entries.every((entry) => entry.status === 'unavailable'));
  assert.ok(result.entries.every((entry) => Object.keys(entry.metrics).length === 0));
});

test('JUnit evidence totals failures and skipped cases from actual suite reports', async (context) => {
  const directory = await workspace(context);
  const reports = join(directory, 'backend/target/surefire-reports');
  await mkdir(reports, { recursive: true });
  await writeFile(join(reports, 'TEST-first.xml'), '<testsuite tests="7" failures="1" errors="0" skipped="2"></testsuite>');
  await writeFile(join(reports, 'TEST-second.xml'), '<testsuite tests="3" failures="0" errors="1" skipped="0"></testsuite>');
  const result = await collectEvidence(directory);
  const entry = result.entries.find((item) => item.id === 'backend-unit');
  assert.equal(entry.status, 'failed');
  assert.deepEqual(entry.metrics, { total: 10, failed: 2, skipped: 2 });
  assert.equal(entry.sources.length, 2);
  assert.ok(Number.isFinite(Date.parse(entry.recordedAt)));
});

test('coverage uses JaCoCo report totals rather than nested class counters', async (context) => {
  const directory = await workspace(context);
  const reports = join(directory, 'backend/target/site/jacoco');
  await mkdir(reports, { recursive: true });
  await writeFile(join(reports, 'jacoco.xml'), '<report><package><counter type="LINE" missed="0" covered="100"/></package><counter type="LINE" missed="20" covered="80"/><counter type="BRANCH" missed="1" covered="3"/></report>');
  const result = await collectEvidence(directory);
  const entry = result.entries.find((item) => item.id === 'backend-coverage');
  assert.equal(entry.status, 'passed');
  assert.deepEqual(entry.metrics, { lines: 80, branches: 75 });
});

test('frontend records Vitest failures and coverage below the configured gate', async (context) => {
  const directory = await workspace(context);
  await mkdir(join(directory, 'frontend/artifacts'), { recursive: true });
  await mkdir(join(directory, 'frontend/coverage'), { recursive: true });
  await writeFile(join(directory, 'frontend/artifacts/vitest.json'), JSON.stringify({ numTotalTests: 9, numFailedTests: 1, numPendingTests: 2 }));
  await writeFile(join(directory, 'frontend/coverage/coverage-summary.json'), JSON.stringify({ total: { lines: { pct: 79.5 }, branches: { pct: 90 } } }));
  const result = await collectEvidence(directory);
  const tests = result.entries.find((item) => item.id === 'frontend-tests');
  const coverage = result.entries.find((item) => item.id === 'frontend-coverage');
  assert.equal(tests.status, 'failed');
  assert.deepEqual(tests.metrics, { total: 9, failed: 1, skipped: 2 });
  assert.equal(coverage.status, 'failed');
  assert.deepEqual(coverage.metrics, { lines: 79.5, branches: 90 });
});

test('invalid report metrics cannot produce a published approval', async (context) => {
  const directory = await workspace(context);
  await mkdir(join(directory, 'frontend/artifacts'), { recursive: true });
  await writeFile(join(directory, 'frontend/artifacts/vitest.json'), '{"numTotalTests":0}');
  await assert.rejects(collectEvidence(directory), /Invalid report metrics/);
});

test('skipped suites are recorded without claiming a complete pass', async (context) => {
  const directory = await workspace(context);
  const reports = join(directory, 'backend/target/failsafe-reports');
  await mkdir(reports, { recursive: true });
  await writeFile(join(reports, 'TEST-skipped.xml'), '<testsuite tests="2" failures="0" errors="0" skipped="2"></testsuite>');
  const result = await collectEvidence(directory);
  assert.equal(result.entries.find((item) => item.id === 'backend-integration').status, 'recorded');
});
