import { createPublicClient, formatEther, http, isAddress } from "viem";
import { bsc } from "viem/chains";

/** Read-only BNB Chain client — no signing, no transactions */
export const bscClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed.binance.org"),
});

export function validateBnbAddress(address: string): `0x${string}` {
  const trimmed = address.trim();
  if (!isAddress(trimmed)) {
    throw new Error("Invalid BNB wallet address");
  }
  return trimmed as `0x${string}`;
}

/** Prove read-only chain access — fetches native BNB balance only */
export async function fetchWalletSnapshot(address: string) {
  const validated = validateBnbAddress(address);
  const balanceWei = await bscClient.getBalance({ address: validated });

  return {
    address: validated,
    bnbBalance: formatEther(balanceWei),
    chainId: bsc.id,
    chainName: "BNB Smart Chain",
  };
}