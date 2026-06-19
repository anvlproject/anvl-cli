import chalk from "chalk";
import ora from "ora";
import { checkAnvlBalance } from "../utils/solana";

const DEFAULT_RPC  = "https://api.mainnet-beta.solana.com";
const DEFAULT_MINT = process.env.ANVL_MINT ?? "ANVLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx11111";

const TIER_COLORS: Record<string, (s: string) => string> = {
  free:   chalk.gray,
  smith:  chalk.yellow,
  legend: (s: string) => chalk.bold(chalk.hex("#F5A623")(s)),
};

const TIER_LABELS: Record<string, string> = {
  free:   "APPRENTICE (Free)",
  smith:  "SMITH",
  legend: "FORGE LEGEND",
};

export async function balanceCommand(wallet: string, opts: { rpc?: string; mint?: string }): Promise<void> {
  const rpc  = opts.rpc  ?? DEFAULT_RPC;
  const mint = opts.mint ?? DEFAULT_MINT;

  const spinner = ora(`Checking $ANVL balance for ${wallet.slice(0, 8)}…`).start();

  try {
    const result = await checkAnvlBalance(wallet, rpc, mint);
    spinner.succeed("Done");

    const tierFn = TIER_COLORS[result.tier] ?? chalk.white;
    const tierLabel = TIER_LABELS[result.tier] ?? result.tier.toUpperCase();

    console.log();
    console.log(chalk.dim("  Wallet  "), chalk.white(result.wallet));
    console.log(chalk.dim("  Balance "), chalk.white(result.balance.toLocaleString() + " $ANVL"));
    console.log(chalk.dim("  Tier    "), tierFn(tierLabel));
    console.log(chalk.dim("  RPC     "), chalk.dim(result.rpc));

    if (result.tier === "free") {
      console.log();
      console.log(chalk.dim("  Need 50,000 $ANVL for Smith · 250,000 for Forge Legend"));
    }
    console.log();
  } catch (err) {
    spinner.fail("Failed to fetch balance");
    console.error(chalk.red("  Error:"), err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
