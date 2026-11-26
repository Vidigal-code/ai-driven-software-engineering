import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPORTS = [
  { id: 'backend-unit', label: 'Backend · testes unitários', path: 'backend/target/surefire-reports' },
  { id: 'backend-integration', label: 'Backend · testes de integração', path: 'backend/target/failsafe-reports' },
  { id: 'backend-coverage', label: 'Backend · cobertura de negócio', path: 'backend/target/site/jacoco/jacoco.xml' },
  { id: 'frontend-tests', label: 'Frontend · testes unitários e componentes', path: 'frontend/artifacts/vitest.json' },
  { id: 'frontend-coverage', label: 'Frontend · cobertura de negócio', path: 'frontend/coverage/coverage-summary.json' },
];
const COVERAGE_LIMITS = { lines: 80, branches: 75 };

function testStatus(metrics) {
  if (metrics.failed > 0) return 'failed';
  return metrics.total === 0 || metrics.skipped > 0 ? 'recorded' : 'passed';
}

async function frontendEntry(root, report) {
  const path = join(root, report.path);
  const content = await optionalRead(() => readFile(path, 'utf8'));
  if (content === null) return null;
  const data = JSON.parse(content);
  const metrics = report.id === 'frontend-tests'
    ? { total: data.numTotalTests, failed: data.numFailedTests, skipped: data.numPendingTests }
    : { lines: data.total.lines.pct, branches: data.total.branches.pct };
  if (Object.values(metrics).some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error(`Invalid report metrics: ${report.path}`);
  }
  const status = report.id === 'frontend-tests' ? testStatus(metrics) : coverageStatus(metrics);
  return { status, metrics, sources: [report.path], recordedAt: (await stat(path)).mtime.toISOString() };
}

function coverageStatus(metrics) {
  return metrics.lines >= COVERAGE_LIMITS.lines && metrics.branches >= COVERAGE_LIMITS.branches ? 'passed' : 'failed';
}

async function jacocoEntry(root, report) {
  const path = join(root, report.path);
  const xml = await optionalRead(() => readFile(path, 'utf8'));
  if (xml === null) return null;
  const counters = [...xml.matchAll(/<counter\b[^>]*\/>/g)].map((match) => match[0]);
  const metrics = {};
  for (const [name, type] of [['lines', 'LINE'], ['branches', 'BRANCH']]) {
    const counter = counters.findLast((tag) => tag.includes(`type="${type}"`));
    if (!counter) throw new Error(`Missing JaCoCo ${type} total`);
    const covered = integerAttribute(counter, 'covered');
    const total = covered + integerAttribute(counter, 'missed');
    metrics[name] = total === 0 ? 100 : Math.round(covered / total * 10_000) / 100;
  }
  return { status: coverageStatus(metrics), metrics, sources: [report.path], recordedAt: (await stat(path)).mtime.toISOString() };
}

async function optionalRead(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function integerAttribute(tag, name) {
  const match = new RegExp(String.raw`\b${name}="(\d+)"`).exec(tag);
  if (!match) throw new Error(`Invalid report attribute: ${name}`);
  return Number(match[1]);
}

async function junitEntry(root, report) {
  const directory = join(root, report.path);
  const names = await optionalRead(() => readdir(directory));
  const files = names?.filter((name) => /^TEST-.*\.xml$/.test(name)).sort() ?? [];
  if (files.length === 0) return null;
  const metrics = { total: 0, failed: 0, skipped: 0 };
  let recordedAt = 0;
  for (const file of files) {
    const path = join(directory, file);
    const xml = await readFile(path, 'utf8');
    const suite = /<testsuite\b[^>]*>/.exec(xml)?.[0];
    if (!suite) throw new Error(`Invalid JUnit report: ${file}`);
    metrics.total += integerAttribute(suite, 'tests');
    metrics.failed += integerAttribute(suite, 'failures') + integerAttribute(suite, 'errors');
    metrics.skipped += integerAttribute(suite, 'skipped');
    recordedAt = Math.max(recordedAt, (await stat(path)).mtimeMs);
  }
  return { status: testStatus(metrics), metrics,
    sources: files.map((file) => `${report.path}/${file}`), recordedAt: new Date(recordedAt).toISOString() };
}

/** @param {string} root @returns {Promise<object>} */
export async function collectEvidence(root) {
  const entries = [];
  for (const report of REPORTS) {
    let entry = null;
    if (report.id.startsWith('frontend-')) entry = await frontendEntry(root, report);
    else if (report.id === 'backend-coverage') entry = await jacocoEntry(root, report);
    else if (report.path) entry = await junitEntry(root, report);
    entries.push({ id: report.id, label: report.label, status: 'unavailable', recordedAt: null, sources: [], metrics: {}, ...entry });
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    entries,
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const evidence = await collectEvidence(root);
  const directory = join(root, 'frontend/public');
  await mkdir(directory, { recursive: true });
  const destination = join(directory, 'evidence.json');
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await rename(temporary, destination);
  console.log('Recorded report snapshot in frontend/public/evidence.json. Missing reports remain unavailable.');
}
