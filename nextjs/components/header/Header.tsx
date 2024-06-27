import { Button, Divider, Grid, Typography } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FC, useState } from "react";
import {
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { contracts } from "../../contracts/contract";
import { SellNftModal } from "../modals/SellNftModal";
import { ErrorNotification } from "../notifications/ErrorNotification";
import { SuccessNotification } from "../notifications/SuccessNotification";

const Header: FC = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [successNotification, setSuccessNotification] =
        useState<boolean>(false);
    const [errorNotification, setErrorNotification] = useState<boolean>(false);
    const { isConnected, chainId, address } = useAccount();
    const marketplaceAddress =
        contracts?.[chainId!]?.["NftMarketplace"]?.address!;
    const marketplaceAbi = contracts?.[chainId!]?.["NftMarketplace"]?.abi!;

    const {
        data: hash,
        writeContract,
        isError,
        error,
    } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setSuccessNotification(isConfirmed);
            },
            onError: () => {
                setErrorNotification(isError);
            },
        },
    });
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: addressFunds } = useReadContract({
        address: marketplaceAddress,
        abi: marketplaceAbi,
        functionName: "getProceeds",
        args: [address],
    });

    const handleSellClick = () => {
        if (!isConnected) return;
        setOpenModal(true);
    };

    const handleWithdrawClick = () => {
        writeContract({
            address: marketplaceAddress,
            abi: marketplaceAbi,
            functionName: "withdrawProceeds",
        });
    };

    return (
        <div>
            <Grid container direction="row" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h4">NFT Marketplace</Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={handleSellClick}>
                        Sell NFT
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        disabled={Number(addressFunds) === 0}
                        onClick={handleWithdrawClick}
                    >
                        Withdraw funds
                    </Button>
                </Grid>
                <Grid item>
                    <ConnectButton />
                </Grid>
            </Grid>
            <Divider />
            <SellNftModal
                open={openModal}
                onClick={() => setOpenModal(false)}
            />
            <SuccessNotification
                open={successNotification}
                handleClose={() => setSuccessNotification(false)}
            />
            <ErrorNotification
                error={error}
                open={errorNotification}
                handleClose={() => setErrorNotification(false)}
            />
        </div>
    );
};

export default Header;
