function g(t,e){if(typeof t!="string"||!t)throw new Error(`${e}格式无效`);return t}function L(t){if(!t||typeof t!="object"||Array.isArray(t))throw new Error("项目文件条目格式无效");let e=t;if(typeof e.is_dir!="boolean"||typeof e.size!="number"||!Number.isFinite(e.size))throw new Error("项目文件元数据格式无效");return{name:g(e.name,"文件名"),path:g(e.path,"文件路径"),isDirectory:e.is_dir,size:e.size}}function y(t){if(!t||typeof t!="object"||Array.isArray(t)||!Array.isArray(t.files))throw new Error("项目文件列表结果无效");return t.files.map(L)}function w(t){if(!t||typeof t!="object"||Array.isArray(t)||typeof t.content!="string")throw new Error("文件读取结果无有效文本内容");return t.content}function E(t){return t<1024?`${t} B`:t<1048576?`${(t/1024).toFixed(t<1024*10?1:0)} KB`:`${(t/1048576).toFixed(1)} MB`}function b(t){let e=t?.workspace;return typeof e?.projectId=="string"?e.projectId:""}function v(t){return t?.workspace?.canAddComposerReference===!0}function j(t){let e=g(t,"评论").trim();if(!e||e.length>32768)throw new Error("评论内容无效");return e}var R="http://www.w3.org/2000/svg";var S={at:["circle:12:12:4","path:M16 8v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 8 0Z","path:M16 8v4a2 2 0 0 0 4 0v-1a8 8 0 1 0-3 6"],chevronDown:["path:M6 9l6 6 6-6"],chevronRight:["path:M9 6l6 6-6 6"],file:["path:M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z","path:M14 2v6h6","path:M8 13h8","path:M8 17h8"],folder:["path:M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z","path:M3 9h18"],message:["path:M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.9L3 21l1.8-4.6a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 8.7 7.5Z"]};function C(t){return document.createElementNS(R,t)}function T(t,e){let[r,...i]=e.split(":"),o=C(r);r==="circle"&&["cx","cy","r"].forEach((s,a)=>o.setAttribute(s,i[a])),r==="path"&&o.setAttribute("d",i.join(":")),t.append(o)}function d(t){let e=C("svg");e.setAttribute("aria-hidden","true"),e.setAttribute("fill","none"),e.setAttribute("height","16"),e.setAttribute("stroke","currentColor"),e.setAttribute("stroke-linecap","round"),e.setAttribute("stroke-linejoin","round"),e.setAttribute("stroke-width","2"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("width","16");for(let r of S[t]??[])T(e,r);return e}function n(t,e,r){let i=document.createElement(t);return e&&(i.className=e),r!==void 0&&(i.textContent=r),i}function p(t,e,r){let i=n("button",t);return i.type="button",i.setAttribute("aria-label",e),i.addEventListener("click",r),i}function f(t,e){let r=n("section","project-files-error",t);if(e){let i=p("project-files-retry","重试",e);i.textContent="重试",r.append(i)}return r}function A(t){return n("section","project-files-empty",t)}function u(t){let e=n("div","project-files-notice",t);return e.setAttribute("aria-live","polite"),e.setAttribute("role","status"),e}function m(t=8){let e=n("section","project-files-loading");for(let r=0;r<t;r+=1)e.append(n("span","project-files-loading-row"));return e}function D(t){queueMicrotask(()=>document.querySelector(t)?.focus())}function $(t,e){let r=p("project-file-header-action",`添加 ${e.name} 到会话`,()=>{t.addPath(e)}),i=t.state.addingPaths.has(e.path);return r.disabled=!t.composerWritable||i,r.title=t.composerWritable?"添加到会话":"当前会话不可编辑",i&&r.setAttribute("aria-busy","true"),r.append(d("at")),r}function I(t,e,r){let i=n("form","file-line-comment-editor"),o=n("div","file-line-comment-heading");o.append(d("message"),n("strong","","本地评论"),n("small","",`对第 ${e} 行发表评论`));let s=document.createElement("textarea");s.dataset.commentInput="",s.placeholder="输入给 Agent 的评论…",s.value=t.state.comment;let a;s.addEventListener("input",()=>{t.state.comment=s.value,a&&(a.disabled=!s.value.trim())}),s.addEventListener("keydown",l=>{(l.metaKey||l.ctrlKey)&&l.key==="Enter"&&(l.preventDefault(),t.submitComment(e,r))});let c=n("footer","file-line-comment-footer"),h=p("","取消评论",()=>t.cancelComment());return h.textContent="取消",a=p("project-files-primary","添加到对话框",()=>{t.submitComment(e,r)}),a.disabled=t.state.submittingComment||!s.value.trim(),t.state.submittingComment&&a.setAttribute("aria-busy","true"),a.textContent="添加到对话框",i.addEventListener("submit",l=>{l.preventDefault(),t.submitComment(e,r)}),c.append(h,a),i.append(o,s,c),D("[data-comment-input]"),i}function K(t){let e=n("div","project-file-code");return e.setAttribute("aria-label",`${t.state.selected.name} 文件内容`),e.setAttribute("role","table"),t.state.content.split(/\r?\n/).forEach((r,i)=>{let o=i+1,s=n("div",`project-file-line${t.state.commentLine===o?" is-commenting":""}`);s.setAttribute("role","row");let a=p("file-line-comment-trigger",`评论第 ${o} 行`,()=>t.startComment(o));a.disabled=!t.composerWritable,a.append(d("message")),s.append(a,n("span","file-line-number",String(o)),n("code","",r||" ")),t.state.commentLine===o&&s.append(I(t,o,r)),e.append(s)}),e}function k(t){let e=t.state.selected,r=n("section","project-files-view has-preview"),i=n("section","project-file-preview"),o=n("header",""),s=p("project-file-header-action","返回项目文件树",()=>t.closeFile());return s.append(d("folder")),o.append(s,n("strong","",e.name),n("small","",e.path),$(t,e)),i.append(o),t.state.actionError&&i.append(f(t.state.actionError)),t.state.actionNotice&&i.append(u(t.state.actionNotice)),t.state.previewError?i.append(f(t.state.previewError,()=>{t.openFile(e)})):t.state.fileLoading?i.append(m()):i.append(K(t)),r.append(i),r}var M=`
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
`;function N(t,e){return e.isDirectory?()=>{t.toggleDirectory(e)}:()=>{t.openFile(e)}}function W(t,e){let r=`添加 ${e.name} 到会话`,i=p("file-tree-add-action",r,()=>{t.addPath(e)}),o=t.state.addingPaths.has(e.path);return i.disabled=!t.composerWritable||o,i.title=t.composerWritable?"添加到会话":"当前会话不可编辑",o&&i.setAttribute("aria-busy","true"),i.append(d("at")),i}function P(t,e,r){let i=n("div","file-tree-branch"),o=n("div","file-tree-row");o.style.setProperty("--file-tree-depth",String(r));let s=p("file-tree-main-action",e.isDirectory?`展开 ${e.name}`:`打开 ${e.name}`,N(t,e));s.setAttribute("role","treeitem");let a=t.state.expanded.has(e.path);e.isDirectory&&s.setAttribute("aria-expanded",String(a));let c=n("span","file-tree-chevron");e.isDirectory&&c.append(d(a?"chevronDown":"chevronRight"));let h=n("span","file-tree-name",e.name),l=n("small","file-tree-metadata",e.isDirectory&&t.state.loadingDirectories.has(e.path)?"加载中…":e.isDirectory?"":E(e.size));return s.append(c,d(e.isDirectory?"folder":"file"),h,l),o.append(s,W(t,e)),i.append(o),e.isDirectory&&a&&F(i,t,e.path,r+1),i}function F(t,e,r,i){let o=e.state.filesByDirectory.get(r),s=e.state.directoryErrors.get(r);if(s){t.append(f(s,()=>{e.loadDirectory(r)}));return}if(!o){t.append(m(3));return}for(let a of o)t.append(P(e,a,i))}function q(t){let e=t.state.filesByDirectory.get(""),r=t.state.directoryErrors.get("");if(r&&!e)return f(r,()=>{t.loadDirectory("")});if(!e&&t.state.loadingDirectories.has(""))return m();if(!e?.length)return A("项目目录为空或尚未绑定工作区");let i=n("section","project-files-view");t.state.actionError&&i.append(f(t.state.actionError)),t.state.actionNotice&&i.append(u(t.state.actionNotice));let o=n("div","file-tree");o.setAttribute("aria-label","项目文件"),o.setAttribute("role","tree");for(let s of e)o.append(P(t,s,0));return i.append(o),i}function B(){return{actionError:"",actionNotice:"",addingPaths:new Set,comment:"",commentLine:null,content:"",directoryErrors:new Map,expanded:new Set,fileLoading:!1,filesByDirectory:new Map,loadingDirectories:new Set,previewError:"",selected:null,submittingComment:!1}}function _(t){return{path:t.path,expectedIsDirectory:t.isDirectory}}var x=class{constructor(e){this.host=e,this.state=B(),this.contextKey="",this.composerWritable=!1,this.directoryRequests=new Map,this.fileRequest=0,this.revision=0,this.root=null}async mount(e,r){this.root=e,console.info("project-files.mount",{composerWritable:v(r),workspaceBound:!!b(r)}),this.applyContext(r,!0)}update(e){this.applyContext(e,!1)}dispose(){console.debug("project-files.dispose"),this.revision+=1,this.root=null}applyContext(e,r){let i=b(e);if(this.composerWritable=v(e),!r&&i===this.contextKey){this.render();return}this.contextKey=i,this.reset(),this.loadDirectory("")}reset(){this.revision+=1,this.directoryRequests.clear(),this.fileRequest=0,this.state=B(),this.render()}render(){if(!this.root)return;let e=n("style","",M),r=this.state.selected?k(this):q(this);this.root.replaceChildren(e,r)}directoryCurrent(e,r,i){return this.revision===i&&this.directoryRequests.get(e)===r}fileCurrent(e,r,i){return this.revision===e&&this.fileRequest===r&&this.state.selected===i}async loadDirectory(e){let r=this.revision,i=(this.directoryRequests.get(e)??0)+1;this.directoryRequests.set(e,i),this.state.loadingDirectories.add(e),this.state.directoryErrors.delete(e),this.render(),console.info("project-files.directory-list.started",{scope:e?"nested":"root"});try{let o=await this.host.request("xsec.files.list",{directory:e||void 0});if(!this.directoryCurrent(e,i,r))return;let s=y(o);this.state.filesByDirectory.set(e,s),console.info("project-files.directory-list.completed",{entryCount:s.length,scope:e?"nested":"root"})}catch(o){if(!this.directoryCurrent(e,i,r))return;console.error("project-files.directory-list.failed",{errorType:o instanceof Error?o.name:typeof o,scope:e?"nested":"root"}),this.state.directoryErrors.set(e,`列出项目文件失败：${String(o)}`)}finally{if(!this.directoryCurrent(e,i,r))return;this.state.loadingDirectories.delete(e),this.render()}}async toggleDirectory(e){if(this.state.expanded.has(e.path)){this.state.expanded.delete(e.path),this.render();return}this.state.expanded.add(e.path),this.render(),this.state.filesByDirectory.has(e.path)||await this.loadDirectory(e.path)}async openFile(e){let r=this.revision,i=this.fileRequest+1;this.fileRequest=i,this.state.comment="",this.state.commentLine=null,this.state.content="",this.state.fileLoading=!0,this.state.previewError="",this.state.selected=e,this.render(),console.info("project-files.file-read.started",{targetType:"file"});try{let o=await this.host.request("xsec.files.read",{path:e.path});if(this.revision!==r||this.fileRequest!==i)return;this.state.content=w(o),console.info("project-files.file-read.completed",{characterCount:this.state.content.length})}catch(o){if(this.revision!==r||this.fileRequest!==i)return;console.error("project-files.file-read.failed",{errorType:o instanceof Error?o.name:typeof o}),this.state.previewError=`读取文件失败：${String(o)}`}finally{if(this.revision!==r||this.fileRequest!==i)return;this.state.fileLoading=!1,this.render()}}closeFile(){this.fileRequest+=1,this.state.comment="",this.state.commentLine=null,this.state.selected=null,this.render()}startComment(e){this.composerWritable&&(this.state.comment="",this.state.commentLine=e,this.render())}cancelComment(){this.state.comment="",this.state.commentLine=null,this.render()}async addPath(e){if(!this.composerWritable||this.state.addingPaths.has(e.path))return;let r=this.revision,i=this.state.addingPaths;i.add(e.path),this.state.actionError="",this.state.actionNotice="",this.render(),console.info("project-files.composer-path-add.started",{targetType:e.isDirectory?"directory":"file"});try{if(await this.host.request("xsec.workspace.composer.path.add",_(e)),this.revision!==r)return;console.info("project-files.composer-path-add.completed",{targetType:e.isDirectory?"directory":"file"}),this.state.actionNotice=`已将“${e.name}”添加到会话`}catch(o){if(this.revision!==r)return;console.error("project-files.composer-path-add.failed",{errorType:o instanceof Error?o.name:typeof o,targetType:e.isDirectory?"directory":"file"}),this.state.actionError=`添加“${e.name}”失败：${String(o)}`}finally{if(this.state.addingPaths!==i)return;i.delete(e.path),this.render()}}async submitComment(e,r){if(!this.composerWritable||!this.state.selected||this.state.submittingComment)return;let i=this.revision,o=this.fileRequest,s=this.state.selected,a;try{a=j(this.state.comment)}catch(c){this.state.actionError=String(c),this.render();return}try{if(this.state.actionError="",this.state.submittingComment=!0,this.render(),console.info("project-files.line-comment-add.started",{line:e}),await this.host.request("xsec.workspace.composer.line-comment.add",{comment:a,expectedLine:r,line:e,path:this.state.selected.path}),!this.fileCurrent(i,o,s))return;console.info("project-files.line-comment-add.completed",{line:e}),this.cancelComment()}catch(c){if(!this.fileCurrent(i,o,s))return;console.error("project-files.line-comment-add.failed",{errorType:c instanceof Error?c.name:typeof c,line:e}),this.state.actionError=`添加第 ${e} 行评论失败：${String(c)}`}finally{if(!this.fileCurrent(i,o,s))return;this.state.submittingComment=!1,this.render()}}};function ae(t){return console.debug("project-files.activate",{apiVersion:t.apiVersion}),new x(t)}export{ae as activate};
