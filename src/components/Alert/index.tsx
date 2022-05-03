import { AlertTitle, Alert as MUIAlert, Snackbar } from "@mui/material";
import useAlert from "../../hooks/useAlert";

export default function Alert() {
  const { message, handleClose } = useAlert();

  return (
    <Snackbar open={!!message} autoHideDuration={6000} onClose={handleClose}>
      
      <MUIAlert
        variant="filled"
        onClose={handleClose}
        severity={message?.type || "error"}
        sx={{ width: "100%" }}
      >
        <AlertTitle>{message?.type || "error"}</AlertTitle>
        {message?.text}
      </MUIAlert>
    </Snackbar>
  );
}
