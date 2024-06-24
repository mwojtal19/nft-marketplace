import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header: React.FC = () => {
    return (
        <div className="grid grid-cols-5 justify-between border-b-2">
            <div className="">
                <p className="text-4xl font-bold">NFT Marketplace</p>
            </div>
            <div className="col-start-4">
                <Link className="text-xl font-semibold" href="/">
                    Home
                </Link>
            </div>
            <div className="">
                <Link className="text-xl font-semibold" href="/sell-nft">
                    Sell NFT
                </Link>
            </div>
            <div className="col-end-8 col-span-2">
                <ConnectButton />
            </div>
        </div>
    );
};

export default Header;
