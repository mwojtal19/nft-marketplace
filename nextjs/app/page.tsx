"use client";
import { Grid } from "@mui/material";
import { getAccount, watchContractEvent } from "@wagmi/core";
import { useEffect, useState } from "react";
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
    const { isConnected, address } = useAccount();
    const { chainId } = getAccount(wagmiConfig);

    const abi = contracts?.[chainId!]?.["NftMarketplace"]?.abi!;
    const contractAddress = contracts?.[chainId!]?.["NftMarketplace"].address!;

    const watchListedNftsEvents = watchContractEvent(wagmiConfig, {
        address: contractAddress,
        abi: abi,
        eventName: "ItemListed",
        onLogs(logs: any) {
            logs.forEach((x: { args: ListedNFT }) => {
                let newNFTs: ListedNFT[] = [];
                const nftIndex = listedNFTs.findIndex(
                    (nft) => nft.tokenId === x.args.tokenId
                );
                if (nftIndex !== -1) {
                    listedNFTs[nftIndex].price = x.args.price;
                    listedNFTs[nftIndex].seller = x.args.seller;
                } else {
                    newNFTs.push(x.args);
                }
                setListedNFTs([...listedNFTs, ...newNFTs]);
            });
        },
    });

    const watchBoughtNftsEvents = watchContractEvent(wagmiConfig, {
        address: contractAddress,
        abi: abi,
        eventName: "ItemBought",
        onLogs(logs: any) {
            logs.forEach((x: { args: BoughtNFT }) => {
                const nfts = [...listedNFTs];
                const nftIndex = listedNFTs.findIndex(
                    (nft) => nft.tokenId === x.args.tokenId
                );
                if (nftIndex !== -1) {
                    nfts.splice(nftIndex, 1);
                }
                setListedNFTs(nfts);
            });
        },
    });
    console.log(listedNFTs);

    useEffect(() => {
        watchListedNftsEvents();
        watchBoughtNftsEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
