import { Alert, Snackbar } from "@mui/material";
import { WriteContractErrorType } from "@wagmi/core";
import { FC } from "react";

type NotificationProps = {
    open: boolean;
    handleClose: () => void;
    error: WriteContractErrorType | null;
};

export const ErrorNotification: FC<NotificationProps> = ({
    open,
    error,
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
                severity="error"
                variant="filled"
                sx={{ width: "100%" }}
            >
                {error?.name ?? "Error"}
            </Alert>
        </Snackbar>
    );
};
