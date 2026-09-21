import {spawnSync} from "node:child_process";

const project = "smartmenu-e2e";
const composeArgs = [
    "compose", "--project-name", project,
    "-f", "docker-compose.yml",
    "-f", "docker-compose.e2e.yml",
];
const command = process.platform === "win32" ? "docker.exe" : "docker";

function runDocker(args) {
    const result = spawnSync(command, [...composeArgs, ...args], {stdio: "inherit"});
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status ?? 1;
    return result.status === 0;
}

// A clean disposable database makes tests repeatable. It is a different
// Compose project from the personal stack, so these removals cannot touch the
// user's db_data, uploads_data, or keycloak_data volumes.
if (!runDocker(["down", "--volumes", "--remove-orphans"])) process.exit(process.exitCode);
if (!runDocker(["up", "--build", "--detach", "--wait"])) {
    runDocker(["down", "--volumes", "--remove-orphans"]);
    process.exit(process.exitCode);
}

try {
    const playwright = process.platform === "win32" ? "npx.cmd" : "npx";
    const result = spawnSync(playwright, ["playwright", "test"], {
        stdio: "inherit",
        env: {...process.env, PLAYWRIGHT_BASE_URL: "http://127.0.0.1:9100"},
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
} finally {
    runDocker(["down", "--volumes", "--remove-orphans"]);
}
