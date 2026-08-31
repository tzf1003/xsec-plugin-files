import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const pluginRoot = new URL("../", import.meta.url);
const factoryRoot = new URL("../plugins/com.xsec.workspace.files/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("plugin.json", pluginRoot), "utf8"));
const extension = manifest.extensions?.["com.xsec.desktop"];
const expectedMethods = [
  "xsec.files.list",
  "xsec.files.read",
  "xsec.workspace.composer.line-comment.add",
  "xsec.workspace.composer.path.add",
];

if (manifest.version !== "1.3.1") throw new Error("项目文件插件版本必须为 1.3.1");
if (extension?.engines?.pluginApi !== "^1.4.0") throw new Error("项目文件插件需要 Plugin API 1.4");
if (Object.keys(extension?.frontendApi?.methods ?? {}).sort().join("|") !== expectedMethods.join("|")) {
  throw new Error("项目文件插件 RPC 声明不完整");
}
await access(fileURLToPath(new URL(extension.entrypoints.frontend.replace(/^\.\//, ""), pluginRoot)));

for (const relativePath of [".codex-plugin/plugin.json", "OFFICIAL_PLUGIN_BRIDGE.md", "plugin.json", "com.xsec.desktop/frontend/index.js"]) {
  const source = await readFile(new URL(relativePath, pluginRoot));
  const factory = await readFile(new URL(relativePath, factoryRoot));
  if (!source.equals(factory)) throw new Error(`Factory 发布镜像不同步：${relativePath}`);
}
