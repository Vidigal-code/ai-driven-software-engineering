"""Validate documentation, delivery configuration and the official Postman schema."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import yaml
from jsonschema.validators import validator_for

ROOT = Path(__file__).resolve().parents[1]
POSTMAN_SCHEMA_ID = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
POSTMAN_SCHEMA_PATH = ROOT / "scripts/schemas/postman-collection-v2.1.0.json"
IGNORED_DIRECTORIES = {
    ".git", ".idea", ".tmp", "node_modules", "target", "dist", "coverage",
    "artifacts", "test-results", "playwright-report", "__pycache__",
}
SPEC_FILES = {"spec.md", "plan.md", "tasks.md", "acceptance.md"}
OPERATIONAL_DIRECTORIES = {".ai", ".specify", "specs"}
GENERAL_MARKERS = (
    "### 🇧🇷 Descrição em Português",
    "<summary><strong>Ver Detalhes</strong></summary>",
    "### 🇺🇸 English Description",
    "<summary><strong>View Details</strong></summary>",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def markdown_files() -> list[Path]:
    files = []
    for directory, children, filenames in os.walk(ROOT):
        children[:] = [name for name in children if name not in IGNORED_DIRECTORIES and not name.startswith("target-")]
        files.extend(Path(directory) / name for name in filenames if name.endswith(".md"))
    return files


def validate_documentation() -> int:
    documents = markdown_files()
    for document in documents:
        relative = document.relative_to(ROOT)
        content = document.read_text(encoding="utf-8-sig")
        require(bool(content.strip()), f"Empty document: {relative}")
        operational = relative.name == "AGENTS.md" or relative.parts[0] in OPERATIONAL_DIRECTORIES
        if operational:
            require(GENERAL_MARKERS[2] not in content.splitlines(), f"Operational document must use Portuguese only: {relative}")
        else:
            require(all(marker in content for marker in GENERAL_MARKERS), f"Missing bilingual structure: {relative}")
            require(content.count("<details>") == content.count("</details>") == 2, f"Invalid details blocks: {relative}")
        if relative.name == "SKILL.md":
            require(content.startswith("---\n"), f"Missing skill frontmatter: {relative}")
            frontmatter = yaml.safe_load(content.split("---", 2)[1])
            require(isinstance(frontmatter, dict), f"Invalid skill frontmatter: {relative}")
            require(all(isinstance(frontmatter.get(key), str) for key in ("name", "description")), f"Missing skill metadata: {relative}")
    for feature in (ROOT / "specs").iterdir():
        if feature.is_dir():
            require(SPEC_FILES.issubset({path.name for path in feature.iterdir()}), f"Incomplete SDD artifacts: {feature.name}")
    return len(documents)


def validate_postman() -> int:
    collection = json.loads((ROOT / "postman/library-api.postman_collection.json").read_text(encoding="utf-8"))
    schema = json.loads(POSTMAN_SCHEMA_PATH.read_text(encoding="utf-8"))
    validator_type = validator_for(schema)
    validator_type.check_schema(schema)
    validator_type(schema).validate(collection)
    require(collection["info"]["schema"] == POSTMAN_SCHEMA_ID, "Postman schema version must be 2.1.0")
    folders = {folder["name"]: folder["item"] for folder in collection["item"]}
    required_folders = {"Authentication", "Books", "Users", "Dashboard", "Validation", "Security", "Health"}
    require(required_folders.issubset(folders), "Missing required Postman folder")
    requests = [request for folder in folders.values() for request in folder]
    for request in requests:
        require(any(event["listen"] == "test" for event in request.get("event", [])), f"Missing Postman assertion: {request['name']}")
    environment = json.loads((ROOT / "postman/local.postman_environment.json").read_text(encoding="utf-8"))
    for variable in environment["values"]:
        if "password" in variable["key"].lower() or "token" in variable["key"].lower():
            require(variable["value"] == "", f"Versioned Postman credentials must be empty: {variable['key']}")
    return len(requests)


def validate_delivery() -> int:
    paths = [ROOT / "compose.yaml", ROOT / ".github/workflows/ci.yml", ROOT / ".github/dependabot.yml"]
    parsed = {path.name: yaml.safe_load(path.read_text(encoding="utf-8")) for path in paths}
    services = parsed["compose.yaml"]["services"]
    require(set(services) == {"backend", "frontend", "postgres"}, "Unexpected Compose services")
    for name in ("backend", "frontend", "postgres"):
        require(any(port.startswith("0.0.0.0:") for port in services[name].get("ports", [])), f"Service must bind all IPv4 host interfaces: {name}")
        require(all(port.startswith(("0.0.0.0:", "[::1]:")) for port in services[name].get("ports", [])), f"Unexpected host binding: {name}")
        require(bool(services[name].get("ports")), f"Service must publish its host port: {name}")
    require(not any(service.get("privileged") for service in services.values()), "Privileged containers are prohibited")
    bootstrap = services["backend"]["environment"]["BOOTSTRAP_ADMIN_ENABLED"]
    require(bootstrap == "${BOOTSTRAP_ADMIN_ENABLED:-false}", "Administrator bootstrap must default to disabled")
    jobs = parsed["ci.yml"]["jobs"]
    require({"backend", "frontend", "dependencies", "integration"}.issubset(jobs), "Missing CI quality gate")
    return len(paths)


def main() -> None:
    report = {
        "recordedAt": datetime.now(timezone.utc).isoformat(),
        "markdownDocuments": validate_documentation(),
        "postmanRequests": validate_postman(),
        "deliveryConfigurations": validate_delivery(),
        "status": "passed",
    }
    destination = ROOT / "artifacts/structure.json"
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
