import { Alert, Snackbar } from "@mui/material";
import { FC } from "react";

type NotificationProps = {
    open: boolean;
    handleClose: () => void;
};

export const SuccessNotification: FC<NotificationProps> = ({
    open,
    handleClose,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            <Alert
                onClose={handleClose}
                severity="success"
                variant="filled"
                sx={{ width: "100%" }}
            >
                Transaction confirmed
            </Alert>
        </Snackbar>
    );
};
