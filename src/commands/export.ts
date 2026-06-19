import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";

interface CoinData {
  name?: string;
  ticker?: string;
  [key: string]: unknown;
}

interface Project {
  id: string;
  status: string;
  coinData: CoinData;
  createdAt: string;
  updatedAt: string;
}

interface AnvlStore {
  projects: Record<string, Project>;
}

/**
 * Export all projects from an anvl_projects_v1 JSON dump to individual files.
 * To get the JSON dump from your browser:
 *   1. Open DevTools → Application → Local Storage → your ANVL site
 *   2. Copy the value of `anvl_projects_v1`
 *   3. Paste into a file: echo 'PASTE_HERE' > anvl-store.json
 *   4. Run: anvl export ./anvl-store.json --out ./exported
 */
export async function exportCommand(storePath: string, opts: { out?: string; id?: string }): Promise<void> {
  const spinner = ora("Reading ANVL store…").start();

  if (!fs.existsSync(storePath)) {
    spinner.fail(`File not found: ${storePath}`);
    process.exit(1);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(storePath, "utf8");
  } catch {
    spinner.fail("Could not read file");
    process.exit(1);
  }

  let store: AnvlStore;
  try {
    // Handle both the raw localStorage value (may be JSON-in-string) and plain JSON
    const parsed = JSON.parse(raw);
    store = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    spinner.fail("File is not valid JSON");
    process.exit(1);
  }

  const projects = store.projects ?? {};
  const ids = opts.id ? [opts.id] : Object.keys(projects);

  if (ids.length === 0) {
    spinner.warn("No projects found in store");
    return;
  }

  const outDir = path.resolve(opts.out ?? "./anvl-export");
  fs.mkdirSync(outDir, { recursive: true });

  let exported = 0;
  for (const id of ids) {
    const project = projects[id];
    if (!project) {
      console.warn(chalk.yellow(`  ⚠ Project "${id}" not found, skipping`));
      continue;
    }

    const filename = `${project.coinData?.ticker?.toLowerCase() ?? id}.json`;
    const outPath  = path.join(outDir, filename);
    fs.writeFileSync(outPath, JSON.stringify(project, null, 2));
    exported++;
    console.log(chalk.green(`  ✔`), chalk.white(project.coinData?.name ?? id), chalk.dim(`→ ${outPath}`));
  }

  spinner.succeed(`Exported ${exported} project(s) to ${outDir}`);
  console.log();
  console.log(chalk.dim("  Next: use `anvl generate-site <file.json>` to build static HTML"));
  console.log();
}
