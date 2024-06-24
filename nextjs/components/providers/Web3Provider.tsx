"use client";

import {
    RainbowKitProvider,
    darkTheme,
    lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
import Header from "../header/Header";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

const MyNftMarketplace = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="p-2">
                <Header />
                <main className="p-2">{children}</main>
            </div>
        </>
    );
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === "dark";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={
                        mounted
                            ? isDarkMode
                                ? darkTheme()
                                : lightTheme()
                            : lightTheme()
                    }
                >
                    <MyNftMarketplace>{children}</MyNftMarketplace>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
