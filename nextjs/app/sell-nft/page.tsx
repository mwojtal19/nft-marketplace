"use client";
import { Button, Grid, TextField } from "@mui/material";
import { getAccount } from "@wagmi/core";
import { parseUnits } from "ethers";
import { useEffect, useState } from "react";
import { Address, isAddress } from "viem";
import {
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { ErrorNotification } from "../../components/notifications/ErrorNotification";
import { PendingNotification } from "../../components/notifications/PendingNotification";
import { SuccessNotification } from "../../components/notifications/SuccessNotification";
import { contracts } from "../../contracts/contract";
import { wagmiConfig } from "../../services/web3/wagmiConfig";

function Page() {
    const [nftAddress, setNftAddress] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [tokenId, setTokenId] = useState<number>(0);
    const [successNotification, setSuccessNotification] =
        useState<boolean>(false);
    const [errorNotification, setErrorNotification] = useState<boolean>(false);
    const [pendingNotification, setPendingNotification] =
        useState<boolean>(false);
    const { chainId } = getAccount(wagmiConfig);
    const marketplaceAddress =
        contracts?.[chainId!]?.["NftMarketplace"]?.address!;
    const marketplaceAbi = contracts?.[chainId!]?.["NftMarketplace"]?.abi!;
    const nftAbi = contracts?.[chainId!]?.["BasicNft"]?.abi!;
    const nftContractAddress = contracts?.[chainId!]?.["BasicNft"].address!;

    const { data: approvedAddress } = useReadContract({
        address: nftContractAddress,
        abi: nftAbi,
        functionName: "getApproved",
        args: [BigInt(tokenId)],
    });

    const {
        data: hash,
        writeContract,
        isPending,
        isError,
        error,
    } = useWriteContract({
        mutation: {
            onSuccess: (data, variables) => {
                if (variables.functionName === "approve") {
                    handleSellClick();
                }
                if (variables.functionName === "listItem") {
                    setNftAddress("");
                    setPrice(0);
                    setTokenId(0);
                }
            },
        },
    });
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    useEffect(() => {
        setSuccessNotification(isConfirmed);
        setPendingNotification(isConfirming);
        setErrorNotification(isError);
    }, [isConfirmed, isConfirming, isError]);

    const handleApproveClick = () => {
        if (approvedAddress === marketplaceAddress) {
            handleSellClick();
        } else {
            writeContract({
                address: nftContractAddress,
                abi: nftAbi,
                functionName: "approve",
                args: [marketplaceAddress, BigInt(tokenId)],
            });
        }
    };
    const handleSellClick = () => {
        writeContract({
            address: marketplaceAddress,
            abi: marketplaceAbi,
            functionName: "listItem",
            args: [
                nftAddress as Address,
                BigInt(tokenId),
                parseUnits(price.toString(), "ether"),
            ],
        });
    };

    return (
        <>
            <Grid container direction="column" rowSpacing={1} sm={6}>
                <Grid item>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="nftAddress"
                        variant="outlined"
                        value={nftAddress}
                        onChange={(e) => setNftAddress(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="tokenId"
                        variant="outlined"
                        type="number"
                        value={tokenId}
                        onChange={(e) => setTokenId(Number(e.target.value))}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="price (ETH)"
                        variant="outlined"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </Grid>
                <Grid item>
                    <Button
                        disabled={!isAddress(nftAddress) || isPending}
                        variant="contained"
                        onClick={handleApproveClick}
                    >
                        Sell NFT
                    </Button>
                </Grid>
            </Grid>
            <SuccessNotification
                open={successNotification}
                handleClose={() => setSuccessNotification(false)}
            />
            <ErrorNotification
                error={error}
                open={errorNotification}
                handleClose={() => setErrorNotification(false)}
            />
            <PendingNotification
                open={pendingNotification}
                handleClose={() => setPendingNotification(false)}
            />
        </>
    );
}

export default Page;
