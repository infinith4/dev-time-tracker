import type { Command } from "commander";
import {
  getAllProjects,
  findOrCreateProject,
  deleteProject,
  renameProject,
} from "../db/repositories/project.js";
import { success, error as errorColor, dim, bold } from "../ui/colors.js";

export function registerProject(program: Command): void {
  const cmd = program.command("project").description("Manage projects");

  cmd
    .command("list")
    .description("List all projects")
    .action(() => {
      const projects = getAllProjects();
      if (projects.length === 0) {
        console.log(dim("\nNo projects yet.\n"));
        return;
      }
      console.log(`\n${bold("Projects:")}`);
      for (const p of projects) {
        console.log(`  - ${p.name}`);
      }
      console.log("");
    });

  cmd
    .command("add <name>")
    .description("Add a new project")
    .action((name: string) => {
      findOrCreateProject(name);
      console.log(success(`\nProject "${name}" created.\n`));
    });

  cmd
    .command("remove <name>")
    .description("Remove a project")
    .action((name: string) => {
      const removed = deleteProject(name);
      if (!removed) {
        console.log(errorColor(`\nProject "${name}" not found.\n`));
        return;
      }
      console.log(success(`\nProject "${name}" removed.\n`));
    });

  cmd
    .command("rename <old> <new>")
    .description("Rename a project")
    .action((oldName: string, newName: string) => {
      const renamed = renameProject(oldName, newName);
      if (!renamed) {
        console.log(errorColor(`\nProject "${oldName}" not found.\n`));
        return;
      }
      console.log(success(`\nRenamed "${oldName}" to "${newName}".\n`));
    });
}
