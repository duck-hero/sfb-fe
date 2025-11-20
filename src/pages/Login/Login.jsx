import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Container, CssBaseline, Grid, Stack, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from '../../context/AuthContext.jsx';
import accountApi from '../../api/accountApi.js';
import CustomTextField from '../../assets/CustomTextField.jsx';



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

    const handleLogin = async (e) => {

        e.preventDefault();
        try {
            const userData = await accountApi.login(credentials);

            // const accessToken = userData.accessToken;
            // const refreshToken = userData.refreshToken;
            // Mã hóa tokens
            // const encryptedAccessToken = encryptToken(accessToken);
            // const encryptedRefreshToken = encryptToken(refreshToken);

            // Lưu vào localStorage
            // localStorage.setItem("accessToken", encryptedAccessToken);
            // localStorage.setItem("refreshToken", encryptedRefreshToken);

            navigate("/admin/foods");
            login(userData);
        } catch (error) {
            // setErrorMessage(error.errors);
            // setErrorMessage("Email hoặc mật khẩu chưa chính xác!");
            toast.error("Email hoặc mật khẩu không chính xác");
        }
    };

    //   return (
    //     <Container component="main" maxWidth="xs">
    //       <CssBaseline />
    //       <div className="flex flex-col items-center">
    //         {/* <div className="flex justify-center">
    //           <img src={logo} alt="Admin Logo" className="mb-4 w-20 mt-5" />
    //         </div> */}

    //         <Typography component="h2" variant="h6">
    //           Đăng Nhập
    //         </Typography>

    //         <form onSubmit={handleLogin} className="w-full max-w-lg mt-2">
    //           <Grid container spacing={2}>
    //             <Grid item xs={12}>
    //               <TextField
    //                 variant="outlined"
    //                 required
    //                 fullWidth
    //                 label="username"
    //                 type="text"
    //                 name="userName"
    //                 autoComplete="username"
    //                 value={credentials.userName}
    //                 onChange={handleInputChange}
    //                 size="small"
    //                 className="inputField "
    //                 InputProps={{ fullWidth: true, style: { borderRadius: 20 } }}
    //               />
    //             </Grid>
    //             <Grid item xs={12}>
    //               <TextField
    //                 variant="outlined"
    //                 required
    //                 fullWidth
    //                 label="Mật khẩu"
    //                 type="password"
    //                 name="password"
    //                 autoComplete="current-password"
    //                 value={credentials.password}
    //                 onChange={handleInputChange}
    //                 size="small"
    //                 className="inputField mb-2"
    //                 InputProps={{ fullWidth: true, style: { borderRadius: 20 } }}
    //               />
    //             </Grid>
    //           </Grid>
    //           <button
    //             type="submit"
    //             fullWidth
    //             variant="contained"
    //             className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full rounded-3xl"
    //           >
    //             Đăng nhập
    //           </button>
    //         </form>
    //       </div>
    //       <ToastContainer />
    //     </Container>
    //   );

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