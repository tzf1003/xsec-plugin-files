function g(t,e){if(typeof t!="string"||!t)throw new Error(`${e}格式无效`);return t}function S(t){if(!t||typeof t!="object"||Array.isArray(t))throw new Error("项目文件条目格式无效");let e=t;if(typeof e.is_dir!="boolean"||typeof e.size!="number"||!Number.isFinite(e.size))throw new Error("项目文件元数据格式无效");return{name:g(e.name,"文件名"),path:g(e.path,"文件路径"),isDirectory:e.is_dir,size:e.size}}function y(t){if(!t||typeof t!="object"||Array.isArray(t)||!Array.isArray(t.files))throw new Error("项目文件列表结果无效");return t.files.map(S)}function w(t){if(!t||typeof t!="object"||Array.isArray(t)||typeof t.content!="string")throw new Error("文件读取结果无有效文本内容");return t.content}function E(t){return t<1024?`${t} B`:t<1048576?`${(t/1024).toFixed(t<1024*10?1:0)} KB`:`${(t/1048576).toFixed(1)} MB`}function b(t){let e=t?.workspace;return typeof e?.projectId=="string"?e.projectId:""}function v(t){return t?.workspace?.canAddComposerReference===!0}function j(t){let e=g(t,"评论").trim();if(!e||e.length>32768)throw new Error("评论内容无效");return e}var T="http://www.w3.org/2000/svg";var R={at:["circle:12:12:4","path:M16 8v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 8 0Z","path:M16 8v4a2 2 0 0 0 4 0v-1a8 8 0 1 0-3 6"],chevronDown:["path:M6 9l6 6 6-6"],chevronRight:["path:M9 6l6 6-6 6"],file:["path:M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z","path:M14 2v6h6","path:M8 13h8","path:M8 17h8"],folder:["path:M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z","path:M3 9h18"],message:["path:M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.9L3 21l1.8-4.6a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 8.7 7.5Z"]};function A(t){return document.createElementNS(T,t)}function q(t,e){let[i,...r]=e.split(":"),o=A(i);i==="circle"&&["cx","cy","r"].forEach((s,n)=>o.setAttribute(s,r[n])),i==="path"&&o.setAttribute("d",r.join(":")),t.append(o)}function p(t){let e=A("svg");e.setAttribute("aria-hidden","true"),e.setAttribute("fill","none"),e.setAttribute("height","16"),e.setAttribute("stroke","currentColor"),e.setAttribute("stroke-linecap","round"),e.setAttribute("stroke-linejoin","round"),e.setAttribute("stroke-width","2"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("width","16");for(let i of R[t]??[])q(e,i);return e}function a(t,e,i){let r=document.createElement(t);return e&&(r.className=e),i!==void 0&&(r.textContent=i),r}function c(t,e,i){let r=a("button",t);return r.type="button",r.setAttribute("aria-label",e),r.addEventListener("click",i),r}function l(t,e){let i=a("section","project-files-error",t);if(e){let r=c("project-files-retry","重试",e);r.textContent="重试",i.append(r)}return i}function C(t){return a("section","project-files-empty",t)}function u(t){let e=a("div","project-files-notice",t);return e.setAttribute("aria-live","polite"),e.setAttribute("role","status"),e}function m(t=8){let e=a("section","project-files-loading");for(let i=0;i<t;i+=1)e.append(a("span","project-files-loading-row"));return e}function D(t){queueMicrotask(()=>document.querySelector(t)?.focus())}function $(t,e){let i=c("project-file-header-action",`添加 ${e.name} 到会话`,()=>{t.addPath(e)}),r=t.state.addingPaths.has(e.path);return i.disabled=!t.composerWritable||r,i.title=t.composerWritable?"添加到会话":"当前会话不可编辑",r&&i.setAttribute("aria-busy","true"),i.append(p("at")),i}function I(t,e,i){let r=a("form","file-line-comment-editor"),o=a("div","file-line-comment-heading");o.append(p("message"),a("strong","","本地评论"),a("small","",`对第 ${e} 行发表评论`));let s=document.createElement("textarea");s.dataset.commentInput="",s.placeholder="输入给 Agent 的评论…",s.value=t.state.comment;let n;s.addEventListener("input",()=>{t.state.comment=s.value,n&&(n.disabled=!s.value.trim())}),s.addEventListener("keydown",d=>{(d.metaKey||d.ctrlKey)&&d.key==="Enter"&&(d.preventDefault(),t.submitComment(e,i))});let f=a("footer","file-line-comment-footer"),h=c("","取消评论",()=>t.cancelComment());return h.textContent="取消",n=c("project-files-primary","添加到对话框",()=>{t.submitComment(e,i)}),n.disabled=t.state.submittingComment||!s.value.trim(),t.state.submittingComment&&n.setAttribute("aria-busy","true"),n.textContent="添加到对话框",r.addEventListener("submit",d=>{d.preventDefault(),t.submitComment(e,i)}),f.append(h,n),r.append(o,s,f),D("[data-comment-input]"),r}function K(t){let e=a("div","project-file-code");return e.setAttribute("aria-label",`${t.state.selected.name} 文件内容`),e.setAttribute("role","table"),t.state.content.split(`
`).forEach((i,r)=>{let o=r+1,s=a("div",`project-file-line${t.state.commentLine===o?" is-commenting":""}`);s.setAttribute("role","row");let n=c("file-line-comment-trigger",`评论第 ${o} 行`,()=>t.startComment(o));n.disabled=!t.composerWritable,n.append(p("message")),s.append(n,a("span","file-line-number",String(o)),a("code","",i||" ")),t.state.commentLine===o&&s.append(I(t,o,i)),e.append(s)}),e}function k(t){let e=t.state.selected,i=a("section","project-files-view has-preview"),r=a("section","project-file-preview"),o=a("header",""),s=c("project-file-header-action","返回项目文件树",()=>t.closeFile());return s.append(p("folder")),o.append(s,a("strong","",e.name),a("small","",e.path),$(t,e)),r.append(o),t.state.actionError&&r.append(l(t.state.actionError)),t.state.actionNotice&&r.append(u(t.state.actionNotice)),t.state.previewError?r.append(l(t.state.previewError,()=>{t.openFile(e)})):t.state.fileLoading?r.append(m()):r.append(K(t)),i.append(r),i}var M=`
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
`;function N(t,e){return e.isDirectory?()=>{t.toggleDirectory(e)}:()=>{t.openFile(e)}}function W(t,e){let i=`添加 ${e.name} 到会话`,r=c("file-tree-add-action",i,()=>{t.addPath(e)}),o=t.state.addingPaths.has(e.path);return r.disabled=!t.composerWritable||o,r.title=t.composerWritable?"添加到会话":"当前会话不可编辑",o&&r.setAttribute("aria-busy","true"),r.append(p("at")),r}function B(t,e,i){let r=a("div","file-tree-branch"),o=a("div","file-tree-row");o.style.setProperty("--file-tree-depth",String(i));let s=c("file-tree-main-action",e.isDirectory?`展开 ${e.name}`:`打开 ${e.name}`,N(t,e));s.setAttribute("role","treeitem");let n=t.state.expanded.has(e.path);e.isDirectory&&s.setAttribute("aria-expanded",String(n));let f=a("span","file-tree-chevron");e.isDirectory&&f.append(p(n?"chevronDown":"chevronRight"));let h=a("span","file-tree-name",e.name),d=a("small","file-tree-metadata",e.isDirectory&&t.state.loadingDirectories.has(e.path)?"加载中…":e.isDirectory?"":E(e.size));return s.append(f,p(e.isDirectory?"folder":"file"),h,d),o.append(s,W(t,e)),r.append(o),e.isDirectory&&n&&F(r,t,e.path,i+1),r}function F(t,e,i,r){let o=e.state.filesByDirectory.get(i),s=e.state.directoryErrors.get(i);if(s){t.append(l(s,()=>{e.loadDirectory(i)}));return}if(!o){t.append(m(3));return}for(let n of o)t.append(B(e,n,r))}function L(t){let e=t.state.filesByDirectory.get(""),i=t.state.directoryErrors.get("");if(i&&!e)return l(i,()=>{t.loadDirectory("")});if(!e&&t.state.loadingDirectories.has(""))return m();if(!e?.length)return C("项目目录为空或尚未绑定工作区");let r=a("section","project-files-view");t.state.actionError&&r.append(l(t.state.actionError)),t.state.actionNotice&&r.append(u(t.state.actionNotice));let o=a("div","file-tree");o.setAttribute("aria-label","项目文件"),o.setAttribute("role","tree");for(let s of e)o.append(B(t,s,0));return r.append(o),r}function P(){return{actionError:"",actionNotice:"",addingPaths:new Set,comment:"",commentLine:null,content:"",directoryErrors:new Map,expanded:new Set,fileLoading:!1,filesByDirectory:new Map,loadingDirectories:new Set,previewError:"",selected:null,submittingComment:!1}}function _(t){return{path:t.path,expectedIsDirectory:t.isDirectory}}var x=class{constructor(e){this.host=e,this.state=P(),this.contextKey="",this.composerWritable=!1,this.directoryRequests=new Map,this.fileRequest=0,this.revision=0,this.root=null}async mount(e,i){this.root=e,console.info("project-files.mount",{composerWritable:v(i),workspaceBound:!!b(i)}),this.applyContext(i,!0)}update(e){this.applyContext(e,!1)}dispose(){console.debug("project-files.dispose"),this.revision+=1,this.root=null}applyContext(e,i){let r=b(e);if(this.composerWritable=v(e),!i&&r===this.contextKey){this.render();return}this.contextKey=r,this.reset(),this.loadDirectory("")}reset(){this.revision+=1,this.directoryRequests.clear(),this.fileRequest=0,this.state=P(),this.render()}render(){if(!this.root)return;let e=a("style","",M),i=this.state.selected?k(this):L(this);this.root.replaceChildren(e,i)}directoryCurrent(e,i,r){return this.revision===r&&this.directoryRequests.get(e)===i}async loadDirectory(e){let i=this.revision,r=(this.directoryRequests.get(e)??0)+1;this.directoryRequests.set(e,r),this.state.loadingDirectories.add(e),this.state.directoryErrors.delete(e),this.render(),console.info("project-files.directory-list.started",{scope:e?"nested":"root"});try{let o=await this.host.request("xsec.files.list",{directory:e||void 0});if(!this.directoryCurrent(e,r,i))return;let s=y(o);this.state.filesByDirectory.set(e,s),console.info("project-files.directory-list.completed",{entryCount:s.length,scope:e?"nested":"root"})}catch(o){if(!this.directoryCurrent(e,r,i))return;console.error("project-files.directory-list.failed",{errorType:o instanceof Error?o.name:typeof o,scope:e?"nested":"root"}),this.state.directoryErrors.set(e,`列出项目文件失败：${String(o)}`)}finally{if(!this.directoryCurrent(e,r,i))return;this.state.loadingDirectories.delete(e),this.render()}}async toggleDirectory(e){if(this.state.expanded.has(e.path)){this.state.expanded.delete(e.path),this.render();return}this.state.expanded.add(e.path),this.render(),this.state.filesByDirectory.has(e.path)||await this.loadDirectory(e.path)}async openFile(e){let i=this.revision,r=this.fileRequest+1;this.fileRequest=r,this.state.comment="",this.state.commentLine=null,this.state.content="",this.state.fileLoading=!0,this.state.previewError="",this.state.selected=e,this.render(),console.info("project-files.file-read.started",{targetType:"file"});try{let o=await this.host.request("xsec.files.read",{path:e.path});if(this.revision!==i||this.fileRequest!==r)return;this.state.content=w(o),console.info("project-files.file-read.completed",{characterCount:this.state.content.length})}catch(o){if(this.revision!==i||this.fileRequest!==r)return;console.error("project-files.file-read.failed",{errorType:o instanceof Error?o.name:typeof o}),this.state.previewError=`读取文件失败：${String(o)}`}finally{if(this.revision!==i||this.fileRequest!==r)return;this.state.fileLoading=!1,this.render()}}closeFile(){this.fileRequest+=1,this.state.comment="",this.state.commentLine=null,this.state.selected=null,this.render()}startComment(e){this.composerWritable&&(this.state.comment="",this.state.commentLine=e,this.render())}cancelComment(){this.state.comment="",this.state.commentLine=null,this.render()}async addPath(e){if(!(!this.composerWritable||this.state.addingPaths.has(e.path))){this.state.addingPaths.add(e.path),this.state.actionError="",this.state.actionNotice="",this.render(),console.info("project-files.composer-path-add.started",{targetType:e.isDirectory?"directory":"file"});try{await this.host.request("xsec.workspace.composer.path.add",_(e)),console.info("project-files.composer-path-add.completed",{targetType:e.isDirectory?"directory":"file"}),this.state.actionNotice=`已将“${e.name}”添加到会话`}catch(i){console.error("project-files.composer-path-add.failed",{errorType:i instanceof Error?i.name:typeof i,targetType:e.isDirectory?"directory":"file"}),this.state.actionError=`添加“${e.name}”失败：${String(i)}`}finally{this.state.addingPaths.delete(e.path),this.render()}}}async submitComment(e,i){if(!this.composerWritable||!this.state.selected||this.state.submittingComment)return;let r;try{r=j(this.state.comment)}catch(o){this.state.previewError=String(o),this.render();return}try{this.state.actionError="",this.state.submittingComment=!0,this.render(),console.info("project-files.line-comment-add.started",{line:e}),await this.host.request("xsec.workspace.composer.line-comment.add",{comment:r,expectedLine:i,line:e,path:this.state.selected.path}),console.info("project-files.line-comment-add.completed",{line:e}),this.cancelComment()}catch(o){console.error("project-files.line-comment-add.failed",{errorType:o instanceof Error?o.name:typeof o,line:e}),this.state.previewError=`添加第 ${e} 行评论失败：${String(o)}`}finally{this.state.submittingComment=!1,this.render()}}};function ne(t){return console.debug("project-files.activate",{apiVersion:t.apiVersion}),new x(t)}export{ne as activate};
