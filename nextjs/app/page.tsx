"use client";
import { Grid } from "@mui/material";
import { watchContractEvent } from "@wagmi/core";
import { useState } from "react";
import { useAccount } from "wagmi";
import { NFTCard } from "../components/nft-card/NFTCard";
import { contracts } from "../contracts/contract";
import { wagmiConfig } from "../services/web3/wagmiConfig";

export type ListedNFT = {
    seller: string;
    nftAddress: string;
    price: bigint;
    tokenId: bigint;
};

export type BoughtNFT = {
    buyer: string;
    nftAddressbuyer: string;
    tokenId: bigint;
    price: bigint;
};

function Page() {
    const [listedNFTs, setListedNFTs] = useState<ListedNFT[]>([]);
    const { chainId } = useAccount();

    const marketplaceAddress =
        contracts?.[chainId!]?.["NftMarketplace"]?.address!;
    const marketplaceAbi = contracts?.[chainId!]?.["NftMarketplace"]?.abi!;

    watchContractEvent(wagmiConfig, {
        address: marketplaceAddress,
        abi: marketplaceAbi,
        eventName: "ItemListed",
        onLogs(logs: any) {
            if (!marketplaceAbi) return;
            let newNFTs = [...listedNFTs];
            logs.forEach((x: { args: ListedNFT }) => {
                const nftIndex = newNFTs.findIndex(
                    (nft) => nft.tokenId === x.args.tokenId
                );
                if (nftIndex !== -1) {
                    newNFTs[nftIndex].price = x.args.price;
                    newNFTs[nftIndex].seller = x.args.seller;
                } else {
                    newNFTs.push(x.args);
                }
            });
            setListedNFTs([...newNFTs]);
        },
    });

    watchContractEvent(wagmiConfig, {
        address: marketplaceAddress,
        abi: marketplaceAbi,
        eventName: "ItemBought",
        onLogs(logs: any) {
            const nfts = [...listedNFTs];
            logs.forEach((x: { args: BoughtNFT }) => {
                const nftIndex = nfts.findIndex(
                    (nft) => nft.tokenId === x.args.tokenId
                );
                if (nftIndex !== -1) {
                    nfts.splice(nftIndex, 1);
                }
            });
            setListedNFTs([...nfts]);
        },
    });

    return (
        <div>
            <Grid container spacing={2}>
                {listedNFTs.map((x, index) => (
                    <Grid item key={index}>
                        <NFTCard
                            seller={x.seller}
                            nftAddress={x.nftAddress}
                            price={x.price}
                            tokenId={x.tokenId}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default Page;
