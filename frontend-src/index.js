import { ProjectFilesController } from "./controller.js";

export function activate(host) {
  console.debug("project-files.activate", { apiVersion: host.apiVersion });
  return new ProjectFilesController(host);
}
