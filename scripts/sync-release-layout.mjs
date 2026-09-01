import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = new URL("../", import.meta.url);
const factoryRoot = new URL("../plugins/com.xsec.workspace.files/", import.meta.url);
const RELEASE_FILES = [
  ".codex-plugin/plugin.json",
  "OFFICIAL_PLUGIN_BRIDGE.md",
  "plugin.json",
  "com.xsec.desktop/frontend/index.js",
];

function destination(relativePath) {
  return fileURLToPath(new URL(relativePath, factoryRoot));
}

function source(relativePath) {
  return fileURLToPath(new URL(relativePath, pluginRoot));
}

export async function syncReleaseLayout() {
  for (const relativePath of RELEASE_FILES) {
    const target = destination(relativePath);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source(relativePath), target);
  }
}
