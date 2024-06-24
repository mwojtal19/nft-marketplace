import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import { getAccount, readContract } from "@wagmi/core";
import { formatUnits } from "ethers";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ListedNFT } from "../../app/page";
import { contracts } from "../../contracts/contract";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
import { trimAddress } from "../../utils/common";
import { UpdateListingModal } from "../modals/UpdateListingModal";

export const NFTCard: FC<ListedNFT> = ({
    seller,
    price,
    tokenId,
    nftAddress,
}) => {
    const { chainId, address } = getAccount(wagmiConfig);
    const { isConnected } = useAccount();
    const [imageURI, setImageURI] = useState<string>("");
    const [tokenName, setTokenName] = useState<string>("");
    const [tokenDescription, setTokenDescription] = useState<string>("");
    const [actualSeller, setActualSeller] = useState<string>("");
    const [openModal, setOpenModal] = useState<boolean>(false);
    const nftAbi = contracts?.[chainId!]?.["BasicNft"]?.abi!;
    const nftContractAddress = contracts?.[chainId!]?.["BasicNft"].address!;

    const getTokenURI = async () => {
        return (await readContract(wagmiConfig, {
            address: nftContractAddress,
            abi: nftAbi,
            functionName: "tokenURI",
            args: [tokenId],
        })) as string;
    };
    const updateUI = async () => {
        const tokenURI = await getTokenURI();
        if (tokenURI) {
            const requestURL = tokenURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            );
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            );
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
        }
    };

    const handleCardClick = (modalOpen: boolean) => {
        setOpenModal(modalOpen);
    };

    useEffect(() => {
        setActualSeller(address === seller ? "you" : trimAddress(seller));
        if (isConnected) {
            updateUI();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, address]);

    return (
        <>
            <Card sx={{ maxWidth: 345, backgroundColor: "#b6d8db" }}>
                <CardActionArea onClick={() => handleCardClick(true)}>
                    <CardMedia
                        component="img"
                        sx={{ height: "250px" }}
                        image={imageURI}
                        alt="nft image"
                    />
                    <CardContent>
                        <Typography
                            sx={{ fontWeight: "bold" }}
                            variant="h5"
                            component="div"
                        >
                            {formatUnits(price, "ether")} ETH
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div">
                            {tokenName}
                        </Typography>
                        <Typography variant="body1">
                            {tokenDescription}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="right"
                        >
                            #{tokenId.toString()}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="right"
                        >
                            Owned by {actualSeller}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <UpdateListingModal
                open={openModal}
                nftAddress={nftAddress}
                tokenId={tokenId}
                currentPrice={price}
                onClick={() => handleCardClick(false)}
            />
        </>
    );
};
