import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { hardhat, sepolia } from "viem/chains";

export const wagmiConfig = getDefaultConfig({
    appName: "RainbowKit demo",
    projectId: process.env.CONNECT_WALLET_ID!,
    wallets: [
        {
            groupName: "Metamask",
            wallets: [metaMaskWallet],
        },
    ],
    chains: [hardhat, sepolia],
    ssr: true,
});
