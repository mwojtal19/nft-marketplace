import { Box, Modal, TextField, Typography } from "@mui/material";
import { formatUnits } from "ethers";
import { FC, useState } from "react";

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

    const handlePriceChange = (newPrice: string) => {
        setPrice(Number(newPrice));
    };
    return (
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
                <form>
                    <TextField
                        sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                {
                                    display: "none",
                                },
                            "& input[type=number]": {
                                MozAppearance: "textfield",
                            },
                        }}
                        id="outlined-basic"
                        label="Price"
                        variant="outlined"
                        value={price}
                        type="number"
                        onChange={(e) => handlePriceChange(e.target.value)}
                    />
                </form>
            </Box>
        </Modal>
    );
};
