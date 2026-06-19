import { Connection, PublicKey } from "@solana/web3.js";

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export type AnvlTier = "free" | "smith" | "legend";

export interface TierResult {
  wallet: string;
  balance: number;
  tier: AnvlTier;
  rpc: string;
}

export function balanceToTier(balance: number): AnvlTier {
  if (balance >= 250_000) return "legend";
  if (balance >= 50_000)  return "smith";
  return "free";
}

export async function checkAnvlBalance(
  walletAddress: string,
  rpcUrl: string,
  mintAddress: string
): Promise<TierResult> {
  const connection  = new Connection(rpcUrl, "confirmed");
  const walletKey   = new PublicKey(walletAddress);
  const mintKey     = new PublicKey(mintAddress);

  const accounts = await connection.getParsedTokenAccountsByOwner(walletKey, {
    mint: mintKey,
    programId: TOKEN_PROGRAM,
  });

  const balance = accounts.value.length > 0
    ? (accounts.value[0].account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0)
    : 0;

  return { wallet: walletAddress, balance, tier: balanceToTier(balance), rpc: rpcUrl };
}
