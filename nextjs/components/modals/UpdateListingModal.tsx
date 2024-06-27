import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { getAccount } from "@wagmi/core";
import { formatUnits, parseUnits } from "ethers";
import { FC, useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contracts } from "../../contracts/contract";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
import { ErrorNotification } from "../notifications/ErrorNotification";
import { PendingNotification } from "../notifications/PendingNotification";
import { SuccessNotification } from "../notifications/SuccessNotification";

export type UpdateListingProps = {
    open: boolean;
    nftAddress: string;
    tokenId: bigint;
    currentPrice: bigint;
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

export const UpdateListingModal: FC<UpdateListingProps> = ({
    open,
    currentPrice,
    tokenId,
    nftAddress,
    onClick,
}) => {
    const [price, setPrice] = useState<number>(
        Number(formatUnits(currentPrice, "ether"))
    );
    const [successNotification, setSuccessNotification] =
        useState<boolean>(false);
    const [errorNotification, setErrorNotification] = useState<boolean>(false);
    const [pendingNotification, setPendingNotification] =
        useState<boolean>(false);
    const { chainId } = getAccount(wagmiConfig);
    const {
        data: hash,
        writeContract,
        isSuccess,
        isPending,
        isError,
        error,
    } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });
    const marketplaceAddress =
        contracts?.[chainId!]?.["NftMarketplace"]?.address!;
    const marketplaceAbi = contracts?.[chainId!]?.["NftMarketplace"]?.abi!;

    const handlePriceChange = (newPrice: string) => {
        setPrice(Number(newPrice));
    };

    const handleUpdatePrice = () => {
        writeContract({
            address: marketplaceAddress,
            abi: marketplaceAbi,
            functionName: "updateListing",
            args: [nftAddress, tokenId, parseUnits(price.toString(), "ether")],
        });
    };

    useEffect(() => {
        setSuccessNotification(isConfirmed);
        setPendingNotification(isConfirming);
        setErrorNotification(isError);
        if (isConfirmed || isError || isConfirming) {
            onClick();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConfirmed, isConfirming, isError]);

    return (
        <>
            <Modal
                open={open}
                onClose={onClick}
                aria-labelledby="update-listing-modal"
                aria-describedby="update-listing-modal"
            >
                <Box sx={style}>
                    <Typography
                        gutterBottom
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                    >
                        Update listing
                    </Typography>

                    <TextField
                        id="outlined-basic"
                        label="Price (ETH)"
                        variant="outlined"
                        value={price}
                        type="number"
                        onChange={(e) => handlePriceChange(e.target.value)}
                    />
                    <Button
                        disabled={isPending}
                        sx={{ marginTop: "1rem" }}
                        variant="contained"
                        onClick={handleUpdatePrice}
                    >
                        Update price
                    </Button>

                    {isSuccess ?? (
                        <Typography>Transaction hash: {hash}</Typography>
                    )}
                </Box>
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
