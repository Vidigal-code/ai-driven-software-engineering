param(
    [string]$ServerUrl = $env:SONAR_HOST_URL
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($env:SONAR_TOKEN)) {
    throw 'Set SONAR_TOKEN in the process environment before running the scanner.'
}
if ([string]::IsNullOrWhiteSpace($ServerUrl)) {
    $ServerUrl = 'http://localhost:9000'
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$keyLine = Get-Content (Join-Path $projectRoot 'sonar-project.properties') | Where-Object { $_ -match '^sonar.projectKey=' }
$projectKey = $keyLine.Substring('sonar.projectKey='.Length)
if (-not (Test-Path (Join-Path $projectRoot 'backend/target/classes'))) {
    throw 'Run backend Maven verify before scanning so Java bytecode and reports are available.'
}

$env:SONAR_HOST_URL = $ServerUrl
$env:SONAR_USER_HOME = Join-Path $projectRoot '.tmp/sonar'
Push-Location (Join-Path $projectRoot 'backend')
try {
    & .\mvnw.cmd --batch-mode --no-transfer-progress `
        'org.sonarsource.scanner.maven:sonar-maven-plugin:5.9.0.7382:sonar' `
        "-Dsonar.projectKey=$projectKey" `
        '-Dsonar.qualitygate.wait=true' `
        '-Dsonar.qualitygate.timeout=300'
    if ($LASTEXITCODE -ne 0) {
        throw "SonarScanner failed with exit code $LASTEXITCODE. Inspect its output and the project dashboard."
    }
} finally {
    Pop-Location
}
