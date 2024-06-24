import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { Web3Provider } from "../components/providers/Web3Provider";
import "../styles/globals.css";

export const metadata: Metadata = {
    title: "NFT Marketplace",
    description: "My own NFT marketplace",
};

function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <Web3Provider>{children}</Web3Provider>
            </body>
        </html>
    );
}

export default RootLayout;
