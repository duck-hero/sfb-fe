import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Container, Stack, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import accountApi from '../../api/accountApi'; // Import your API call
import { useAuth } from '../../context/AuthContext';

const Verify2FA = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userId = localStorage.getItem('twoFactorUserId'); // Get the userId for 2FA (from login step)

    const handleInputChange = (e) => {
        setOtp(e.target.value);
    };

 const handleVerify2FACode = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const data = {
    code: otp.trim(),
    userId: userId,
    rememberDevice: false
  };

  try {
    const response = await accountApi.verify2FACode(data);

    toast.success("2FA verification successful");
    localStorage.removeItem("twoFactorUserId");

    const accessToken = response.jwToken;
    const refreshToken = response.refreshToken;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    login(response.user);
    navigate("/");

  } catch (error) {
    setErrorMessage(error?.description || "Invalid OTP or error during verification");
    toast.error(errorMessage || "An error occurred during 2FA verification");
  } finally {
    setIsSubmitting(false);
  }
};


    return (
        <Container>
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card sx={{ width: '100%', maxWidth: '400px', padding: 4, borderRadius: 3 }}>
                    <Typography variant="h4" textAlign="center" mb={2}>
                        Verify 2FA
                    </Typography>
                    <form onSubmit={handleVerify2FACode}>
                        <Stack spacing={3}>
                            <TextField
                                label="Enter OTP"
                                variant="outlined"
                                fullWidth
                                value={otp}
                                onChange={handleInputChange}
                                size="small"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{ borderRadius: '24px', py: 1.5 }}
                            >
                                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </Stack>
                    </form>

                    {errorMessage && (
                        <Typography color="error" variant="subtitle2" align="center" mt={2}>
                            {errorMessage}
                        </Typography>
                    )}
                </Card>
            </Box>

            <ToastContainer />
        </Container>
    );
};

export default Verify2FA;
