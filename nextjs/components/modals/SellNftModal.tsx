import { Button, Grid, Modal, TextField } from "@mui/material";
import { isAddress, parseUnits } from "ethers";
import { FC, useState } from "react";
import { Address } from "viem";
import {
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { contracts } from "../../contracts/contract";
import { ErrorNotification } from "../notifications/ErrorNotification";
import { PendingNotification } from "../notifications/PendingNotification";
import { SuccessNotification } from "../notifications/SuccessNotification";

export type SellNFTProps = {
    open: boolean;
    onClick: () => void;
};

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

export const SellNftModal: FC<SellNFTProps> = ({ open, onClick }) => {
    const [nftAddress, setNftAddress] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [tokenId, setTokenId] = useState<number>(0);
    const [successNotification, setSuccessNotification] =
        useState<boolean>(false);
    const [errorNotification, setErrorNotification] = useState<boolean>(false);
    const [pendingNotification, setPendingNotification] =
        useState<boolean>(false);
    const { chainId } = useAccount();
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
                setSuccessNotification(isConfirmed);
                if (variables.functionName === "approve") {
                    handleSellClick();
                }
                if (variables.functionName === "listItem") {
                    setNftAddress("");
                    setPrice(0);
                    setTokenId(0);
                }
                onClick();
            },
            onError: () => {
                setErrorNotification(isError);
                onClick();
            },
            onMutate: () => {
                setPendingNotification(isConfirming);
                onClick();
            },
        },
    });
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

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
            <Modal
                open={open}
                onClose={onClick}
                aria-labelledby="sell-nft-modal"
                aria-describedby="sell-nft-modal"
            >
                <Grid
                    container
                    direction="column"
                    rowSpacing={1}
                    sm={6}
                    sx={style}
                >
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
            </Modal>
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
};
