import React, { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Create a context to manage the Snackbar
const SnackbarContext = createContext();

// Custom hook to use the Snackbar context
export const useSnackbar = () => {
  return useContext(SnackbarContext);
};

// Snackbar Provider to wrap the app and provide global access to the Snackbar
export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState("success");
  const [anchorOrigin, setAnchorOrigin] = useState({ vertical: 'top', horizontal: 'right' });

  const showSnackbar = (msg, type = "success", position = { vertical: 'top', horizontal: 'right' }) => {
    setMessage(msg);
    setSeverity(type);
    setAnchorOrigin(position); // Update position when showing Snackbar
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
