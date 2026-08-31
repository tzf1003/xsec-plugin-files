import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { syncReleaseLayout } from "./sync-release-layout.mjs";

const pluginRoot = new URL("../", import.meta.url);
const root = fileURLToPath(pluginRoot);
const frontendOutput = fileURLToPath(new URL("com.xsec.desktop/frontend/index.js", pluginRoot));

function replaceExactlyOnce(source, target, replacement) {
  const parts = source.split(target);
  if (parts.length !== 2) throw new Error(`Expected exactly one generated ${target}`);
  return parts.join(replacement);
}

await build({
  bundle: true,
  charset: "utf8",
  entryPoints: [fileURLToPath(new URL("frontend-src/index.js", pluginRoot))],
  format: "esm",
  legalComments: "none",
  minify: false,
  outfile: frontendOutput,
  target: "es2022",
  absWorkingDir: root,
});

const bundle = await readFile(frontendOutput, "utf8");
const frontend = replaceExactlyOnce(
  replaceExactlyOnce(bundle, "function activate(host) {", "export function activate(host) {"),
  "export {\n  activate\n};",
  "",
);
await writeFile(frontendOutput, `${frontend.trimEnd()}\n`, "utf8");

await syncReleaseLayout();
