import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Container, CssBaseline, Grid, Stack, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from "react-toastify";

import accountApi from '../../api/accountApi.js';
import CustomTextField from '../../assets/CustomTextField.jsx';
import { encryptToken } from '../../api/cryptoService.js';
import { useAuth } from '../../context/AuthContext.jsx';



const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prevCredentials) => ({
            ...prevCredentials,
            [name]: value,
        }));
    };

    // const handleLogin = async (e) => {

    //     e.preventDefault();
    //     try {
    //         const userData = await accountApi.login(credentials);
    //         const accessToken = userData.jwToken;
    //         const refreshToken = userData.refreshToken;
    //         console.log(userData)
            
    //         // Mã hóa tokens
    //         const encryptedAccessToken = encryptToken(accessToken);
    //         const encryptedRefreshToken = encryptToken(refreshToken);

    //         // Lưu vào localStorage
    //         localStorage.setItem("accessToken", encryptedAccessToken);
    //         localStorage.setItem("refreshToken", encryptedRefreshToken);

    //         navigate("/");
    //         login(userData);
          
    //     } catch (error) {
    //         // setErrorMessage(error.errors);
    //         // setErrorMessage("Email hoặc mật khẩu chưa chính xác!");
    //         toast.error("Email hoặc mật khẩu không chính xác");
    //     }
    // };

    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const res = await accountApi.login(credentials); 
        const userData = res.data; // Lấy đúng field "data"
        
        console.log("API Login:", userData);

        // Nếu tài khoản yêu cầu 2FA
        if (userData.requires2FA) {
            // Lưu tạm userId để xác thực 2FA
            localStorage.setItem("twoFactorUserId", userData.twoFactorUserId);

            // Chuyển sang trang nhập mã 2FA
            return navigate("/verify-2fa");
        }

        // --- Không yêu cầu 2FA → đăng nhập luôn ---
        const accessToken = userData.jwToken;
        const refreshToken = userData.refreshToken;

        // Mã hoá token
        const encryptedAccessToken = encryptToken(accessToken);
        const encryptedRefreshToken = encryptToken(refreshToken);

        // Lưu vào localStorage
        localStorage.setItem("accessToken", encryptedAccessToken);
        localStorage.setItem("refreshToken", encryptedRefreshToken);

        // update context
        login(userData);

        navigate("/");
    } catch (error) {
        toast.error("Email hoặc mật khẩu không chính xác");
    }
};

    return (

        <Container>
            <Box
                sx={{
                    position: "relative",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&": {
                        content: '""',
                        background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
                        backgroundSize: "400% 400%",
                        animation: "gradient 15s ease infinite",
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        // opacity: 0.3,
                        top: 0,
                        left: 0,
                    },
                }}
            >
                <Card
                    elevation={9}
                    sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px", borderRadius: 3 }}
                >

                    {/* Logo nếu cần */}



                    <Typography variant="h4" fontWeight="700" textAlign="center" mb={1}>
                        Đăng Nhập
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" textAlign="center" mb={3}>
                        Super Phê bút
                    </Typography>

                    <form onSubmit={handleLogin}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    component="label"
                                    htmlFor="username"
                                    mb="5px"
                                >
                                    Username
                                </Typography>
                                <CustomTextField
                                    variant="outlined"
                                    fullWidth
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleInputChange}
                                    size="small"                       
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    component="label"
                                    htmlFor="password"
                                    mb="5px"
                                >
                                    Mật khẩu
                                </Typography>
                                <CustomTextField
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    size="small"
                                />
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{ borderRadius: "24px", py: 1.5 }}
                            >
                                Đăng nhập
                            </Button>
                        </Stack>
                    </form>

                    <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                        
                        <Typography
                            component="a"
                            href="/authentication/register"
                            fontWeight="500"
                            sx={{ textDecoration: "none", color: "primary.main" }}
                        >
                            Quên mật khẩu
                        </Typography>
                    </Stack>
                </Card>
            </Box>
            <ToastContainer />
        </Container >

);



};


export default Login;