import { Alert, Snackbar } from "@mui/material";
import { FC } from "react";

type NotificationProps = {
    open: boolean;
    handleClose: () => void;
};

export const PendingNotification: FC<NotificationProps> = ({
    open,
    handleClose,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert
                onClose={handleClose}
                severity="info"
                variant="filled"
                sx={{ width: "100%" }}
            >
                Transaction pending...
            </Alert>
        </Snackbar>
    );
};
