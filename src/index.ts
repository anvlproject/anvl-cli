import { Command } from "commander";
import { balanceCommand }      from "./commands/balance";
import { exportCommand }       from "./commands/export";
import { generateSiteCommand } from "./commands/generate-site";

const program = new Command();

program
  .name("anvl")
  .description("CLI toolkit for the ANVL memecoin launch platform")
  .version("1.0.0");

// ── balance ───────────────────────────────────────────────────────────────────
program
  .command("balance <wallet>")
  .description("Check $ANVL balance and tier for a Solana wallet")
  .option("--rpc <url>",  "Solana RPC URL", "https://api.mainnet-beta.solana.com")
  .option("--mint <addr>", "ANVL mint address (defaults to ANVL_MINT env var)")
  .action(balanceCommand);

// ── export ────────────────────────────────────────────────────────────────────
program
  .command("export <store-json>")
  .description("Export projects from an anvl_projects_v1 localStorage JSON dump")
  .option("--out <dir>",  "Output directory", "./anvl-export")
  .option("--id <id>",    "Export only a specific project ID")
  .action(exportCommand);

// ── generate-site ─────────────────────────────────────────────────────────────
program
  .command("generate-site <project-json>")
  .description("Generate a standalone static HTML coin site from an exported project JSON")
  .option("--out <file>",       "Output HTML file path")
  .option("--template <name>",  "Template name (default: minimal)")
  .action(generateSiteCommand);

program.parse(process.argv);
