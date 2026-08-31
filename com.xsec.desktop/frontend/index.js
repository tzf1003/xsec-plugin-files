// frontend-src/model.js
var MAX_COMMENT_CHARACTERS = 32768;
var MAX_PREVIEW_LINES = 2e3;
var PREVIEW_OVERFLOW_ALLOWANCE = 1;
var KILOBYTE = 1024;
var MEGABYTE = KILOBYTE * KILOBYTE;
function text(value, label) {
  if (typeof value !== "string" || !value) throw new Error(`${label}格式无效`);
  return value;
}
function fileEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("项目文件条目格式无效");
  const entry = value;
  if (typeof entry.is_dir !== "boolean" || typeof entry.size !== "number" || !Number.isFinite(entry.size)) {
    throw new Error("项目文件元数据格式无效");
  }
  return { name: text(entry.name, "文件名"), path: text(entry.path, "文件路径"), isDirectory: entry.is_dir, size: entry.size };
}
function fileEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.files)) {
    throw new Error("项目文件列表结果无效");
  }
  return value.files.map(fileEntry);
}
function fileContent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.content !== "string") {
    throw new Error("文件读取结果无有效文本内容");
  }
  return value.content;
}
function previewLines(content) {
  const lines = content.split(/\r?\n/, MAX_PREVIEW_LINES + PREVIEW_OVERFLOW_ALLOWANCE);
  return { lines: lines.slice(0, MAX_PREVIEW_LINES), truncated: lines.length > MAX_PREVIEW_LINES };
}
function formatFileSize(size) {
  if (size < KILOBYTE) return `${size} B`;
  if (size < MEGABYTE) return `${(size / KILOBYTE).toFixed(size < KILOBYTE * 10 ? 1 : 0)} KB`;
  return `${(size / MEGABYTE).toFixed(1)} MB`;
}
function workspaceKey(context) {
  const workspace = context?.workspace;
  return typeof workspace?.projectId === "string" ? workspace.projectId : "";
}
function composerWritable(context) {
  return context?.workspace?.canAddComposerReference === true;
}
function commentText(value) {
  const comment = text(value, "评论").trim();
  if (!comment || comment.length > MAX_COMMENT_CHARACTERS) throw new Error("评论内容无效");
  return comment;
}

// frontend-src/icons.js
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var ICON_SIZE = "16";
var iconPaths = {
  at: ["circle:12:12:4", "path:M16 8v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 8 0Z", "path:M16 8v4a2 2 0 0 0 4 0v-1a8 8 0 1 0-3 6"],
  chevronDown: ["path:M6 9l6 6 6-6"],
  chevronRight: ["path:M9 6l6 6-6 6"],
  file: ["path:M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z", "path:M14 2v6h6", "path:M8 13h8", "path:M8 17h8"],
  folder: ["path:M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z", "path:M3 9h18"],
  message: ["path:M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.9L3 21l1.8-4.6a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 8.7 7.5Z"]
};
function svgElement(name) {
  return document.createElementNS(SVG_NAMESPACE, name);
}
function appendShape(svg, descriptor) {
  const [kind, ...values] = descriptor.split(":");
  const node = svgElement(kind);
  if (kind === "circle") ["cx", "cy", "r"].forEach((name, index) => node.setAttribute(name, values[index]));
  if (kind === "path") node.setAttribute("d", values.join(":"));
  svg.append(node);
}
function icon(name) {
  const svg = svgElement("svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("height", ICON_SIZE);
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", ICON_SIZE);
  for (const descriptor of iconPaths[name] ?? []) appendShape(svg, descriptor);
  return svg;
}

// frontend-src/view-utils.js
function element(name, className, content) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (content !== void 0) node.textContent = content;
  return node;
}
function actionButton(className, label, onClick) {
  const button = element("button", className);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.addEventListener("click", onClick);
  return button;
}
function errorPanel(message, retry) {
  const panel = element("section", "project-files-error", message);
  if (retry) {
    const button = actionButton("project-files-retry", "重试", retry);
    button.textContent = "重试";
    panel.append(button);
  }
  return panel;
}
function emptyPanel(message) {
  return element("section", "project-files-empty", message);
}
function noticePanel(message) {
  const notice = element("div", "project-files-notice", message);
  notice.setAttribute("aria-live", "polite");
  notice.setAttribute("role", "status");
  return notice;
}
function loadingPanel(rows = 8) {
  const panel = element("section", "project-files-loading");
  for (let index = 0; index < rows; index += 1) panel.append(element("span", "project-files-loading-row"));
  return panel;
}
function focusLater(selector) {
  queueMicrotask(() => document.querySelector(selector)?.focus());
}

// frontend-src/preview-view.js
function composerButton(controller, file) {
  const button = actionButton("project-file-header-action", `添加 ${file.name} 到会话`, () => {
    void controller.addPath(file);
  });
  const busy = controller.state.addingPaths.has(file.path);
  button.disabled = !controller.composerWritable || busy;
  button.title = controller.composerWritable ? "添加到会话" : "当前会话不可编辑";
  if (busy) button.setAttribute("aria-busy", "true");
  button.append(icon("at"));
  return button;
}
function commentEditor(controller, lineNumber, code) {
  const editor = element("form", "file-line-comment-editor");
  const heading = element("div", "file-line-comment-heading");
  heading.append(icon("message"), element("strong", "", "本地评论"), element("small", "", `对第 ${lineNumber} 行发表评论`));
  const input = document.createElement("textarea");
  input.dataset.commentInput = "";
  input.placeholder = "输入给 Agent 的评论…";
  input.value = controller.state.comment;
  let submit;
  input.addEventListener("input", () => {
    controller.state.comment = input.value;
    if (submit) submit.disabled = !controller.composerWritable || !input.value.trim();
  });
  input.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void controller.submitComment(lineNumber, code);
    }
  });
  const footer = element("footer", "file-line-comment-footer");
  const cancel = actionButton("", "取消评论", () => controller.cancelComment());
  cancel.textContent = "取消";
  submit = actionButton("project-files-primary", "添加到对话框", () => {
    void controller.submitComment(lineNumber, code);
  });
  submit.disabled = !controller.composerWritable || controller.state.submittingComment || !input.value.trim();
  if (controller.state.submittingComment) submit.setAttribute("aria-busy", "true");
  submit.textContent = "添加到对话框";
  editor.addEventListener("submit", (event) => {
    event.preventDefault();
    void controller.submitComment(lineNumber, code);
  });
  footer.append(cancel, submit);
  editor.append(heading, input, footer);
  focusLater("[data-comment-input]");
  return editor;
}
function codeRows(controller) {
  const table = element("div", "project-file-code");
  table.setAttribute("aria-label", `${controller.state.selected.name} 文件内容`);
  table.setAttribute("role", "table");
  const preview = previewLines(controller.state.content);
  preview.lines.forEach((code, index) => {
    const lineNumber = index + 1;
    const line = element("div", `project-file-line${controller.state.commentLine === lineNumber ? " is-commenting" : ""}`);
    line.setAttribute("role", "row");
    const trigger = actionButton("file-line-comment-trigger", `评论第 ${lineNumber} 行`, () => controller.startComment(lineNumber));
    trigger.disabled = !controller.composerWritable;
    trigger.append(icon("message"));
    line.append(trigger, element("span", "file-line-number", String(lineNumber)), element("code", "", code || " "));
    if (controller.state.commentLine === lineNumber) line.append(commentEditor(controller, lineNumber, code));
    table.append(line);
  });
  return { table, truncated: preview.truncated };
}
function renderPreview(controller) {
  const file = controller.state.selected;
  const view = element("section", "project-files-view has-preview");
  const preview = element("section", "project-file-preview");
  const header = element("header", "");
  const back = actionButton("project-file-header-action", "返回项目文件树", () => controller.closeFile());
  back.append(icon("folder"));
  header.append(back, element("strong", "", file.name), element("small", "", file.path), composerButton(controller, file));
  preview.append(header);
  if (controller.state.actionError) preview.append(errorPanel(controller.state.actionError));
  if (controller.state.actionNotice) preview.append(noticePanel(controller.state.actionNotice));
  if (controller.state.previewError) preview.append(errorPanel(controller.state.previewError, () => {
    void controller.openFile(file);
  }));
  else if (controller.state.fileLoading) preview.append(loadingPanel());
  else {
    const code = codeRows(controller);
    preview.append(code.table);
    if (code.truncated) preview.append(noticePanel(`文件行数较多，仅显示前 ${MAX_PREVIEW_LINES.toLocaleString()} 行`));
  }
  view.append(preview);
  return view;
}

// frontend-src/styles.js
var styles = `
:root {
  background: var(--xsec-surface-base);
  color: var(--xsec-text-primary);
  font-family: var(--xsec-font-family, system-ui, sans-serif);
}
* { box-sizing: border-box; }
html, body, [data-xsec-plugin-root] { min-width: 0; min-height: 100%; margin: 0; }
button, textarea { font: inherit; }
button:focus-visible, textarea:focus-visible { outline: 2px solid var(--xsec-accent); outline-offset: 2px; }
.project-files-view { min-height: 100%; background: var(--xsec-surface-base); }
.project-files-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 42px; padding: 0 12px; border-bottom: 1px solid var(--xsec-border-subtle); }
.project-files-toolbar strong { font-size: 13px; }
.project-files-refresh { padding: 4px 8px; border: 1px solid var(--xsec-border); border-radius: var(--xsec-radius-md); background: var(--xsec-surface-container); color: var(--xsec-text-secondary); cursor: pointer; }
.project-files-refresh:disabled { cursor: not-allowed; opacity: .45; }
.file-tree { display: grid; padding: 8px 0; }
.file-tree-branch { display: contents; }
.file-tree-row {
  display: grid;
  min-width: 0;
  height: 36px;
  grid-template-columns: minmax(0, 1fr) 34px;
  padding-left: calc(var(--file-tree-depth) * 18px);
}
.file-tree-row:hover { background: var(--xsec-surface-hover); }
.file-tree-main-action {
  display: grid;
  min-width: 0;
  grid-template-columns: 14px 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  padding: 0 4px 0 12px;
  border: 0;
  background: transparent;
  color: var(--xsec-text-secondary);
  cursor: pointer;
  text-align: left;
}
.file-tree-main-action:active { background: var(--xsec-accent-soft); }
.file-tree-main-action svg, .file-tree-add-action svg { flex: 0 0 auto; }
.file-tree-add-action {
  display: grid;
  width: 28px;
  height: 28px;
  place-self: center;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--xsec-radius-md);
  background: transparent;
  color: var(--xsec-text-tertiary);
  cursor: pointer;
  opacity: 0;
}
.file-tree-row:hover .file-tree-add-action,
.file-tree-add-action:focus-visible,
.file-tree-add-action[aria-busy="true"] { opacity: 1; }
.file-tree-add-action:hover:not(:disabled) { background: var(--xsec-accent-soft); color: var(--xsec-accent); }
.file-tree-add-action:disabled { cursor: not-allowed; opacity: .35; }
.file-tree-chevron { color: var(--xsec-text-tertiary); font-size: 10px; }
.file-tree-name { overflow: hidden; color: var(--xsec-text-primary); text-overflow: ellipsis; white-space: nowrap; }
.file-tree-metadata { color: var(--xsec-text-tertiary); font-size: 11px; }
.project-file-preview { min-width: 0; }
.project-file-preview > header {
  display: grid;
  height: 48px;
  grid-template-columns: 30px minmax(0, auto) minmax(0, 1fr) 30px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-bottom: 1px solid var(--xsec-border-subtle);
}
.project-file-header-action {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--xsec-radius-md);
  background: transparent;
  color: var(--xsec-text-secondary);
  cursor: pointer;
}
.project-file-header-action:hover:not(:disabled) { background: var(--xsec-surface-hover); color: var(--xsec-text-primary); }
.project-file-header-action:disabled { cursor: not-allowed; color: var(--xsec-text-tertiary); }
.project-file-preview > header strong, .project-file-preview > header small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-file-preview > header small { color: var(--xsec-text-tertiary); }
.project-file-code { overflow: auto; padding: 6px 0 24px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 24px; }
.project-file-line { position: relative; display: grid; min-width: max-content; grid-template-columns: 28px 42px minmax(240px, 1fr); }
.project-file-line:hover, .project-file-line.is-commenting { background: var(--xsec-accent-soft); }
.file-line-comment-trigger {
  visibility: hidden;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--xsec-radius-sm);
  background: var(--xsec-surface-subtle);
  color: var(--xsec-text-primary);
  cursor: pointer;
}
.project-file-line:hover .file-line-comment-trigger, .file-line-comment-trigger:focus-visible { visibility: visible; }
.file-line-comment-trigger:disabled { cursor: not-allowed; opacity: .35; }
.file-line-number { padding-right: 12px; color: var(--xsec-text-tertiary); text-align: right; user-select: none; }
.project-file-line code { padding-right: 16px; color: var(--xsec-text-primary); white-space: pre; }
.file-line-comment-editor {
  grid-column: 2 / 4;
  width: min(460px, calc(100vw - 72px));
  margin: 6px 12px 12px 0;
  padding: 12px;
  border: 1px solid var(--xsec-border);
  border-radius: 12px;
  background: var(--xsec-surface-container);
  box-shadow: 0 10px 26px rgb(0 0 0 / 18%);
  font-family: var(--xsec-font-family, system-ui, sans-serif);
}
.file-line-comment-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.file-line-comment-heading small { margin-left: auto; color: var(--xsec-text-tertiary); }
.file-line-comment-editor textarea {
  width: 100%;
  min-height: 76px;
  resize: vertical;
  padding: 9px 10px;
  border: 1px solid var(--xsec-border);
  border-radius: var(--xsec-radius-lg);
  background: var(--xsec-surface-subtle);
  color: var(--xsec-text-primary);
  line-height: 1.5;
}
.file-line-comment-editor textarea:focus { border-color: var(--xsec-accent); outline: 0; }
.file-line-comment-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.file-line-comment-footer button, .project-files-retry {
  padding: 5px 10px;
  border: 1px solid var(--xsec-border);
  border-radius: var(--xsec-radius-md);
  background: var(--xsec-surface-container);
  color: var(--xsec-text-secondary);
  cursor: pointer;
}
.file-line-comment-footer button:disabled { cursor: not-allowed; opacity: .45; }
.project-files-primary { border-color: var(--xsec-accent) !important; background: var(--xsec-accent) !important; color: #fff !important; }
.project-files-notice { margin: 8px 12px; color: var(--xsec-status-success, var(--xsec-accent)); font-size: 13px; }
.project-files-error, .project-files-empty { display: grid; min-height: 160px; place-content: center; gap: 12px; padding: 24px; color: var(--xsec-text-secondary); text-align: center; }
.project-files-error { color: var(--xsec-status-error); }
.project-files-loading { display: grid; gap: 9px; padding: 14px 12px; }
.project-files-loading-row { display: block; height: 18px; border-radius: var(--xsec-radius-sm); background: var(--xsec-surface-subtle); }
@media (max-width: 520px) {
  .project-file-preview > header { grid-template-columns: 30px minmax(0, 1fr) 30px; }
  .project-file-preview > header small { display: none; }
  .file-line-comment-editor { width: calc(100vw - 54px); }
}
`;

// frontend-src/tree-view.js
function entryAction(controller, entry) {
  return entry.isDirectory ? () => {
    void controller.toggleDirectory(entry);
  } : () => {
    void controller.openFile(entry);
  };
}
function addButton(controller, entry) {
  const label = `添加 ${entry.name} 到会话`;
  const button = actionButton("file-tree-add-action", label, () => {
    void controller.addPath(entry);
  });
  const busy = controller.state.addingPaths.has(entry.path);
  button.disabled = !controller.composerWritable || busy;
  button.title = controller.composerWritable ? "添加到会话" : "当前会话不可编辑";
  if (busy) button.setAttribute("aria-busy", "true");
  button.append(icon("at"));
  return button;
}
function row(controller, entry, depth) {
  const branch = element("div", "file-tree-branch");
  const item = element("div", "file-tree-row");
  item.style.setProperty("--file-tree-depth", String(depth));
  const main = actionButton("file-tree-main-action", entry.isDirectory ? `展开 ${entry.name}` : `打开 ${entry.name}`, entryAction(controller, entry));
  main.setAttribute("role", "treeitem");
  const expanded = controller.state.expanded.has(entry.path);
  if (entry.isDirectory) main.setAttribute("aria-expanded", String(expanded));
  const chevron = element("span", "file-tree-chevron");
  if (entry.isDirectory) chevron.append(icon(expanded ? "chevronDown" : "chevronRight"));
  const name = element("span", "file-tree-name", entry.name);
  const metadata = element("small", "file-tree-metadata", entry.isDirectory && controller.state.loadingDirectories.has(entry.path) ? "加载中…" : entry.isDirectory ? "" : formatFileSize(entry.size));
  main.append(chevron, icon(entry.isDirectory ? "folder" : "file"), name, metadata);
  item.append(main, addButton(controller, entry));
  branch.append(item);
  if (entry.isDirectory && expanded) appendDirectory(branch, controller, entry.path, depth + 1);
  return branch;
}
function appendDirectory(parent, controller, directory, depth) {
  const files = controller.state.filesByDirectory.get(directory);
  const error = controller.state.directoryErrors.get(directory);
  if (error) {
    parent.append(errorPanel(error, () => {
      void controller.loadDirectory(directory);
    }));
    return;
  }
  if (!files) {
    parent.append(loadingPanel(3));
    return;
  }
  for (const entry of files) parent.append(row(controller, entry, depth));
}
function toolbar(controller) {
  const header = element("header", "project-files-toolbar");
  header.append(element("strong", "", "项目文件"));
  const refresh = actionButton("project-files-refresh", "刷新项目文件", () => controller.refresh());
  refresh.disabled = controller.state.loadingDirectories.has("");
  refresh.textContent = "刷新";
  header.append(refresh);
  return header;
}
function renderTree(controller) {
  const rootFiles = controller.state.filesByDirectory.get("");
  const rootError = controller.state.directoryErrors.get("");
  if (rootError && !rootFiles) return errorPanel(rootError, () => {
    void controller.loadDirectory("");
  });
  if (!rootFiles && controller.state.loadingDirectories.has("")) return loadingPanel();
  if (!rootFiles?.length) return emptyPanel("项目目录为空或尚未绑定工作区");
  const view = element("section", "project-files-view");
  if (controller.state.actionError) view.append(errorPanel(controller.state.actionError));
  if (controller.state.actionNotice) view.append(noticePanel(controller.state.actionNotice));
  view.append(toolbar(controller));
  const tree = element("div", "file-tree");
  tree.setAttribute("aria-label", "项目文件");
  tree.setAttribute("role", "tree");
  for (const entry of rootFiles) tree.append(row(controller, entry, 0));
  view.append(tree);
  return view;
}

// frontend-src/controller.js
function initialState() {
  return {
    actionError: "",
    actionNotice: "",
    addingPaths: /* @__PURE__ */ new Set(),
    comment: "",
    commentLine: null,
    content: "",
    directoryErrors: /* @__PURE__ */ new Map(),
    expanded: /* @__PURE__ */ new Set(),
    fileLoading: false,
    filesByDirectory: /* @__PURE__ */ new Map(),
    loadingDirectories: /* @__PURE__ */ new Set(),
    previewError: "",
    selected: null,
    submittingComment: false
  };
}
function pathRequest(entry) {
  return { path: entry.path, expectedIsDirectory: entry.isDirectory };
}
var ProjectFilesController = class {
  constructor(host) {
    this.host = host;
    this.state = initialState();
    this.contextKey = "";
    this.composerWritable = false;
    this.directoryRequests = /* @__PURE__ */ new Map();
    this.fileRequest = 0;
    this.revision = 0;
    this.root = null;
  }
  async mount(root, context) {
    this.root = root;
    console.info("project-files.mount", { composerWritable: composerWritable(context), workspaceBound: Boolean(workspaceKey(context)) });
    this.applyContext(context, true);
  }
  update(context) {
    this.applyContext(context, false);
  }
  dispose() {
    console.debug("project-files.dispose");
    this.revision += 1;
    this.root = null;
  }
  applyContext(context, initial) {
    const nextKey = workspaceKey(context);
    this.composerWritable = composerWritable(context);
    if (!initial && nextKey === this.contextKey) {
      this.render();
      return;
    }
    this.contextKey = nextKey;
    this.reset();
    void this.loadDirectory("");
  }
  reset() {
    this.revision += 1;
    this.directoryRequests.clear();
    this.fileRequest = 0;
    this.state = initialState();
    this.render();
  }
  refresh() {
    this.reset();
    void this.loadDirectory("");
  }
  render() {
    if (!this.root) return;
    const style = element("style", "", styles);
    const content = this.state.selected ? renderPreview(this) : renderTree(this);
    this.root.replaceChildren(style, content);
  }
  directoryCurrent(directory, request, revision) {
    return this.revision === revision && this.directoryRequests.get(directory) === request;
  }
  fileCurrent(revision, request, selected) {
    return this.revision === revision && this.fileRequest === request && this.state.selected === selected;
  }
  async loadDirectory(directory) {
    const revision = this.revision;
    const request = (this.directoryRequests.get(directory) ?? 0) + 1;
    this.directoryRequests.set(directory, request);
    this.state.loadingDirectories.add(directory);
    this.state.directoryErrors.delete(directory);
    this.render();
    console.info("project-files.directory-list.started", { scope: directory ? "nested" : "root" });
    try {
      const result = await this.host.request("xsec.files.list", { directory: directory || void 0 });
      if (!this.directoryCurrent(directory, request, revision)) return;
      const entries = fileEntries(result);
      this.state.filesByDirectory.set(directory, entries);
      console.info("project-files.directory-list.completed", { entryCount: entries.length, scope: directory ? "nested" : "root" });
    } catch (error) {
      if (!this.directoryCurrent(directory, request, revision)) return;
      console.error("project-files.directory-list.failed", { errorType: error instanceof Error ? error.name : typeof error, scope: directory ? "nested" : "root" });
      this.state.directoryErrors.set(directory, `列出项目文件失败：${String(error)}`);
    } finally {
      if (!this.directoryCurrent(directory, request, revision)) return;
      this.state.loadingDirectories.delete(directory);
      this.render();
    }
  }
  async toggleDirectory(entry) {
    if (this.state.expanded.has(entry.path)) {
      this.state.expanded.delete(entry.path);
      this.render();
      return;
    }
    this.state.expanded.add(entry.path);
    this.render();
    if (!this.state.filesByDirectory.has(entry.path)) await this.loadDirectory(entry.path);
  }
  async openFile(entry) {
    const revision = this.revision;
    const request = this.fileRequest + 1;
    this.fileRequest = request;
    this.state.comment = "";
    this.state.commentLine = null;
    this.state.content = "";
    this.state.fileLoading = true;
    this.state.previewError = "";
    this.state.selected = entry;
    this.render();
    console.info("project-files.file-read.started", { targetType: "file" });
    try {
      const result = await this.host.request("xsec.files.read", { path: entry.path });
      if (this.revision !== revision || this.fileRequest !== request) return;
      this.state.content = fileContent(result);
      console.info("project-files.file-read.completed", { characterCount: this.state.content.length });
    } catch (error) {
      if (this.revision !== revision || this.fileRequest !== request) return;
      console.error("project-files.file-read.failed", { errorType: error instanceof Error ? error.name : typeof error });
      this.state.previewError = `读取文件失败：${String(error)}`;
    } finally {
      if (this.revision !== revision || this.fileRequest !== request) return;
      this.state.fileLoading = false;
      this.render();
    }
  }
  closeFile() {
    this.fileRequest += 1;
    this.state.comment = "";
    this.state.commentLine = null;
    this.state.selected = null;
    this.render();
  }
  startComment(line) {
    if (!this.composerWritable) return;
    this.state.comment = "";
    this.state.commentLine = line;
    this.render();
  }
  cancelComment() {
    this.state.comment = "";
    this.state.commentLine = null;
    this.render();
  }
  async addPath(entry) {
    if (!this.composerWritable || this.state.addingPaths.has(entry.path)) return;
    const revision = this.revision;
    const addingPaths = this.state.addingPaths;
    addingPaths.add(entry.path);
    this.state.actionError = "";
    this.state.actionNotice = "";
    this.render();
    console.info("project-files.composer-path-add.started", { targetType: entry.isDirectory ? "directory" : "file" });
    try {
      await this.host.request("xsec.workspace.composer.path.add", pathRequest(entry));
      if (this.revision !== revision) return;
      console.info("project-files.composer-path-add.completed", { targetType: entry.isDirectory ? "directory" : "file" });
      this.state.actionNotice = `已将“${entry.name}”添加到会话`;
    } catch (error) {
      if (this.revision !== revision) return;
      console.error("project-files.composer-path-add.failed", { errorType: error instanceof Error ? error.name : typeof error, targetType: entry.isDirectory ? "directory" : "file" });
      this.state.actionError = `添加“${entry.name}”失败：${String(error)}`;
    } finally {
      if (this.state.addingPaths !== addingPaths) return;
      addingPaths.delete(entry.path);
      this.render();
    }
  }
  async submitComment(line, code) {
    if (!this.composerWritable || !this.state.selected || this.state.submittingComment) return;
    const revision = this.revision;
    const request = this.fileRequest;
    const selected = this.state.selected;
    let comment;
    try {
      comment = commentText(this.state.comment);
    } catch (error) {
      this.state.actionError = String(error);
      this.render();
      return;
    }
    try {
      this.state.actionError = "";
      this.state.submittingComment = true;
      this.render();
      console.info("project-files.line-comment-add.started", { line });
      await this.host.request("xsec.workspace.composer.line-comment.add", {
        comment,
        expectedLine: code,
        line,
        path: this.state.selected.path
      });
      if (!this.fileCurrent(revision, request, selected)) return;
      console.info("project-files.line-comment-add.completed", { line });
      this.cancelComment();
    } catch (error) {
      if (!this.fileCurrent(revision, request, selected)) return;
      console.error("project-files.line-comment-add.failed", { errorType: error instanceof Error ? error.name : typeof error, line });
      this.state.actionError = `添加第 ${line} 行评论失败：${String(error)}`;
    } finally {
      if (!this.fileCurrent(revision, request, selected)) return;
      this.state.submittingComment = false;
      this.render();
    }
  }
};

// frontend-src/index.js
export function activate(host) {
  console.debug("project-files.activate", { apiVersion: host.apiVersion });
  return new ProjectFilesController(host);
}
