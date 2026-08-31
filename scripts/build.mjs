import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { syncReleaseLayout } from "./sync-release-layout.mjs";

const pluginRoot = new URL("../", import.meta.url);
const root = fileURLToPath(pluginRoot);

await build({
  bundle: true,
  charset: "utf8",
  entryPoints: [new URL("frontend-src/index.js", pluginRoot).pathname],
  format: "esm",
  legalComments: "none",
  minify: true,
  outfile: new URL("com.xsec.desktop/frontend/index.js", pluginRoot).pathname,
  target: "es2022",
  absWorkingDir: root,
});

await syncReleaseLayout();
