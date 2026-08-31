function g(t,e){if(typeof t!="string"||!t)throw new Error(`${e}格式无效`);return t}function q(t){if(!t||typeof t!="object"||Array.isArray(t))throw new Error("项目文件条目格式无效");let e=t;if(typeof e.is_dir!="boolean"||typeof e.size!="number"||!Number.isFinite(e.size))throw new Error("项目文件元数据格式无效");return{name:g(e.name,"文件名"),path:g(e.path,"文件路径"),isDirectory:e.is_dir,size:e.size}}function y(t){if(!t||typeof t!="object"||Array.isArray(t)||!Array.isArray(t.files))throw new Error("项目文件列表结果无效");return t.files.map(q)}function w(t){if(!t||typeof t!="object"||Array.isArray(t)||typeof t.content!="string")throw new Error("文件读取结果无有效文本内容");return t.content}function E(t){let e=t.split(/\r?\n/);return{lines:e.slice(0,2e3),truncated:e.length>2e3}}function j(t){return t<1024?`${t} B`:t<1048576?`${(t/1024).toFixed(t<1024*10?1:0)} KB`:`${(t/1048576).toFixed(1)} MB`}function b(t){let e=t?.workspace;return typeof e?.projectId=="string"?e.projectId:""}function v(t){return t?.workspace?.canAddComposerReference===!0}function A(t){let e=g(t,"评论").trim();if(!e||e.length>32768)throw new Error("评论内容无效");return e}var B="http://www.w3.org/2000/svg";var T={at:["circle:12:12:4","path:M16 8v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 8 0Z","path:M16 8v4a2 2 0 0 0 4 0v-1a8 8 0 1 0-3 6"],chevronDown:["path:M6 9l6 6 6-6"],chevronRight:["path:M9 6l6 6-6 6"],file:["path:M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z","path:M14 2v6h6","path:M8 13h8","path:M8 17h8"],folder:["path:M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z","path:M3 9h18"],message:["path:M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.9L3 21l1.8-4.6a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 8.7 7.5Z"]};function C(t){return document.createElementNS(B,t)}function I(t,e){let[i,...r]=e.split(":"),o=C(i);i==="circle"&&["cx","cy","r"].forEach((s,a)=>o.setAttribute(s,r[a])),i==="path"&&o.setAttribute("d",r.join(":")),t.append(o)}function d(t){let e=C("svg");e.setAttribute("aria-hidden","true"),e.setAttribute("fill","none"),e.setAttribute("height","16"),e.setAttribute("stroke","currentColor"),e.setAttribute("stroke-linecap","round"),e.setAttribute("stroke-linejoin","round"),e.setAttribute("stroke-width","2"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("width","16");for(let i of T[t]??[])I(e,i);return e}function n(t,e,i){let r=document.createElement(t);return e&&(r.className=e),i!==void 0&&(r.textContent=i),r}function p(t,e,i){let r=n("button",t);return r.type="button",r.setAttribute("aria-label",e),r.addEventListener("click",i),r}function f(t,e){let i=n("section","project-files-error",t);if(e){let r=p("project-files-retry","重试",e);r.textContent="重试",i.append(r)}return i}function D(t){return n("section","project-files-empty",t)}function m(t){let e=n("div","project-files-notice",t);return e.setAttribute("aria-live","polite"),e.setAttribute("role","status"),e}function h(t=8){let e=n("section","project-files-loading");for(let i=0;i<t;i+=1)e.append(n("span","project-files-loading-row"));return e}function k(t){queueMicrotask(()=>document.querySelector(t)?.focus())}function $(t,e){let i=p("project-file-header-action",`添加 ${e.name} 到会话`,()=>{t.addPath(e)}),r=t.state.addingPaths.has(e.path);return i.disabled=!t.composerWritable||r,i.title=t.composerWritable?"添加到会话":"当前会话不可编辑",r&&i.setAttribute("aria-busy","true"),i.append(d("at")),i}function W(t,e,i){let r=n("form","file-line-comment-editor"),o=n("div","file-line-comment-heading");o.append(d("message"),n("strong","","本地评论"),n("small","",`对第 ${e} 行发表评论`));let s=document.createElement("textarea");s.dataset.commentInput="",s.placeholder="输入给 Agent 的评论…",s.value=t.state.comment;let a;s.addEventListener("input",()=>{t.state.comment=s.value,a&&(a.disabled=!s.value.trim())}),s.addEventListener("keydown",l=>{(l.metaKey||l.ctrlKey)&&l.key==="Enter"&&(l.preventDefault(),t.submitComment(e,i))});let c=n("footer","file-line-comment-footer"),u=p("","取消评论",()=>t.cancelComment());return u.textContent="取消",a=p("project-files-primary","添加到对话框",()=>{t.submitComment(e,i)}),a.disabled=!t.composerWritable||t.state.submittingComment||!s.value.trim(),t.state.submittingComment&&a.setAttribute("aria-busy","true"),a.textContent="添加到对话框",r.addEventListener("submit",l=>{l.preventDefault(),t.submitComment(e,i)}),c.append(u,a),r.append(o,s,c),k("[data-comment-input]"),r}function N(t){let e=n("div","project-file-code");e.setAttribute("aria-label",`${t.state.selected.name} 文件内容`),e.setAttribute("role","table");let i=E(t.state.content);return i.lines.forEach((r,o)=>{let s=o+1,a=n("div",`project-file-line${t.state.commentLine===s?" is-commenting":""}`);a.setAttribute("role","row");let c=p("file-line-comment-trigger",`评论第 ${s} 行`,()=>t.startComment(s));c.disabled=!t.composerWritable,c.append(d("message")),a.append(c,n("span","file-line-number",String(s)),n("code","",r||" ")),t.state.commentLine===s&&a.append(W(t,s,r)),e.append(a)}),{table:e,truncated:i.truncated}}function L(t){let e=t.state.selected,i=n("section","project-files-view has-preview"),r=n("section","project-file-preview"),o=n("header",""),s=p("project-file-header-action","返回项目文件树",()=>t.closeFile());if(s.append(d("folder")),o.append(s,n("strong","",e.name),n("small","",e.path),$(t,e)),r.append(o),t.state.actionError&&r.append(f(t.state.actionError)),t.state.actionNotice&&r.append(m(t.state.actionNotice)),t.state.previewError)r.append(f(t.state.previewError,()=>{t.openFile(e)}));else if(t.state.fileLoading)r.append(h());else{let a=N(t);r.append(a.table),a.truncated&&r.append(m(`文件行数较多，仅显示前 ${2e3.toLocaleString()} 行`))}return i.append(r),i}var M=`
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
`;function K(t,e){return e.isDirectory?()=>{t.toggleDirectory(e)}:()=>{t.openFile(e)}}function F(t,e){let i=`添加 ${e.name} 到会话`,r=p("file-tree-add-action",i,()=>{t.addPath(e)}),o=t.state.addingPaths.has(e.path);return r.disabled=!t.composerWritable||o,r.title=t.composerWritable?"添加到会话":"当前会话不可编辑",o&&r.setAttribute("aria-busy","true"),r.append(d("at")),r}function P(t,e,i){let r=n("div","file-tree-branch"),o=n("div","file-tree-row");o.style.setProperty("--file-tree-depth",String(i));let s=p("file-tree-main-action",e.isDirectory?`展开 ${e.name}`:`打开 ${e.name}`,K(t,e));s.setAttribute("role","treeitem");let a=t.state.expanded.has(e.path);e.isDirectory&&s.setAttribute("aria-expanded",String(a));let c=n("span","file-tree-chevron");e.isDirectory&&c.append(d(a?"chevronDown":"chevronRight"));let u=n("span","file-tree-name",e.name),l=n("small","file-tree-metadata",e.isDirectory&&t.state.loadingDirectories.has(e.path)?"加载中…":e.isDirectory?"":j(e.size));return s.append(c,d(e.isDirectory?"folder":"file"),u,l),o.append(s,F(t,e)),r.append(o),e.isDirectory&&a&&O(r,t,e.path,i+1),r}function O(t,e,i,r){let o=e.state.filesByDirectory.get(i),s=e.state.directoryErrors.get(i);if(s){t.append(f(s,()=>{e.loadDirectory(i)}));return}if(!o){t.append(h(3));return}for(let a of o)t.append(P(e,a,r))}function z(t){let e=n("header","project-files-toolbar");e.append(n("strong","","项目文件"));let i=p("project-files-refresh","刷新项目文件",()=>t.refresh());return i.disabled=t.state.loadingDirectories.has(""),i.textContent="刷新",e.append(i),e}function S(t){let e=t.state.filesByDirectory.get(""),i=t.state.directoryErrors.get("");if(i&&!e)return f(i,()=>{t.loadDirectory("")});if(!e&&t.state.loadingDirectories.has(""))return h();if(!e?.length)return D("项目目录为空或尚未绑定工作区");let r=n("section","project-files-view");t.state.actionError&&r.append(f(t.state.actionError)),t.state.actionNotice&&r.append(m(t.state.actionNotice)),r.append(z(t));let o=n("div","file-tree");o.setAttribute("aria-label","项目文件"),o.setAttribute("role","tree");for(let s of e)o.append(P(t,s,0));return r.append(o),r}function R(){return{actionError:"",actionNotice:"",addingPaths:new Set,comment:"",commentLine:null,content:"",directoryErrors:new Map,expanded:new Set,fileLoading:!1,filesByDirectory:new Map,loadingDirectories:new Set,previewError:"",selected:null,submittingComment:!1}}function Y(t){return{path:t.path,expectedIsDirectory:t.isDirectory}}var x=class{constructor(e){this.host=e,this.state=R(),this.contextKey="",this.composerWritable=!1,this.directoryRequests=new Map,this.fileRequest=0,this.revision=0,this.root=null}async mount(e,i){this.root=e,console.info("project-files.mount",{composerWritable:v(i),workspaceBound:!!b(i)}),this.applyContext(i,!0)}update(e){this.applyContext(e,!1)}dispose(){console.debug("project-files.dispose"),this.revision+=1,this.root=null}applyContext(e,i){let r=b(e);if(this.composerWritable=v(e),!i&&r===this.contextKey){this.render();return}this.contextKey=r,this.reset(),this.loadDirectory("")}reset(){this.revision+=1,this.directoryRequests.clear(),this.fileRequest=0,this.state=R(),this.render()}refresh(){this.reset(),this.loadDirectory("")}render(){if(!this.root)return;let e=n("style","",M),i=this.state.selected?L(this):S(this);this.root.replaceChildren(e,i)}directoryCurrent(e,i,r){return this.revision===r&&this.directoryRequests.get(e)===i}fileCurrent(e,i,r){return this.revision===e&&this.fileRequest===i&&this.state.selected===r}async loadDirectory(e){let i=this.revision,r=(this.directoryRequests.get(e)??0)+1;this.directoryRequests.set(e,r),this.state.loadingDirectories.add(e),this.state.directoryErrors.delete(e),this.render(),console.info("project-files.directory-list.started",{scope:e?"nested":"root"});try{let o=await this.host.request("xsec.files.list",{directory:e||void 0});if(!this.directoryCurrent(e,r,i))return;let s=y(o);this.state.filesByDirectory.set(e,s),console.info("project-files.directory-list.completed",{entryCount:s.length,scope:e?"nested":"root"})}catch(o){if(!this.directoryCurrent(e,r,i))return;console.error("project-files.directory-list.failed",{errorType:o instanceof Error?o.name:typeof o,scope:e?"nested":"root"}),this.state.directoryErrors.set(e,`列出项目文件失败：${String(o)}`)}finally{if(!this.directoryCurrent(e,r,i))return;this.state.loadingDirectories.delete(e),this.render()}}async toggleDirectory(e){if(this.state.expanded.has(e.path)){this.state.expanded.delete(e.path),this.render();return}this.state.expanded.add(e.path),this.render(),this.state.filesByDirectory.has(e.path)||await this.loadDirectory(e.path)}async openFile(e){let i=this.revision,r=this.fileRequest+1;this.fileRequest=r,this.state.comment="",this.state.commentLine=null,this.state.content="",this.state.fileLoading=!0,this.state.previewError="",this.state.selected=e,this.render(),console.info("project-files.file-read.started",{targetType:"file"});try{let o=await this.host.request("xsec.files.read",{path:e.path});if(this.revision!==i||this.fileRequest!==r)return;this.state.content=w(o),console.info("project-files.file-read.completed",{characterCount:this.state.content.length})}catch(o){if(this.revision!==i||this.fileRequest!==r)return;console.error("project-files.file-read.failed",{errorType:o instanceof Error?o.name:typeof o}),this.state.previewError=`读取文件失败：${String(o)}`}finally{if(this.revision!==i||this.fileRequest!==r)return;this.state.fileLoading=!1,this.render()}}closeFile(){this.fileRequest+=1,this.state.comment="",this.state.commentLine=null,this.state.selected=null,this.render()}startComment(e){this.composerWritable&&(this.state.comment="",this.state.commentLine=e,this.render())}cancelComment(){this.state.comment="",this.state.commentLine=null,this.render()}async addPath(e){if(!this.composerWritable||this.state.addingPaths.has(e.path))return;let i=this.revision,r=this.state.addingPaths;r.add(e.path),this.state.actionError="",this.state.actionNotice="",this.render(),console.info("project-files.composer-path-add.started",{targetType:e.isDirectory?"directory":"file"});try{if(await this.host.request("xsec.workspace.composer.path.add",Y(e)),this.revision!==i)return;console.info("project-files.composer-path-add.completed",{targetType:e.isDirectory?"directory":"file"}),this.state.actionNotice=`已将“${e.name}”添加到会话`}catch(o){if(this.revision!==i)return;console.error("project-files.composer-path-add.failed",{errorType:o instanceof Error?o.name:typeof o,targetType:e.isDirectory?"directory":"file"}),this.state.actionError=`添加“${e.name}”失败：${String(o)}`}finally{if(this.state.addingPaths!==r)return;r.delete(e.path),this.render()}}async submitComment(e,i){if(!this.composerWritable||!this.state.selected||this.state.submittingComment)return;let r=this.revision,o=this.fileRequest,s=this.state.selected,a;try{a=A(this.state.comment)}catch(c){this.state.actionError=String(c),this.render();return}try{if(this.state.actionError="",this.state.submittingComment=!0,this.render(),console.info("project-files.line-comment-add.started",{line:e}),await this.host.request("xsec.workspace.composer.line-comment.add",{comment:a,expectedLine:i,line:e,path:this.state.selected.path}),!this.fileCurrent(r,o,s))return;console.info("project-files.line-comment-add.completed",{line:e}),this.cancelComment()}catch(c){if(!this.fileCurrent(r,o,s))return;console.error("project-files.line-comment-add.failed",{errorType:c instanceof Error?c.name:typeof c,line:e}),this.state.actionError=`添加第 ${e} 行评论失败：${String(c)}`}finally{if(!this.fileCurrent(r,o,s))return;this.state.submittingComment=!1,this.render()}}};function le(t){return console.debug("project-files.activate",{apiVersion:t.apiVersion}),new x(t)}export{le as activate};
