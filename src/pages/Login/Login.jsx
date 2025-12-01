import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import accountApi from '../../api/accountApi.js';
import { encryptToken } from '../../api/cryptoService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import sfbLogo from '../../assets/sfb-logo.png';
import { ClipLoader } from 'react-spinners'; // spinner

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false); // trạng thái loading
    const [errorMessage, setErrorMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // bật loading
        try {
            const res = await accountApi.login(credentials); 
            const userData = res.data;
            console.log("API Login:", userData);

            if (userData.requires2FA) {
                localStorage.setItem("twoFactorUserId", userData.twoFactorUserId);
                return navigate("/verify-2fa");
            }

            const accessToken = userData.jwToken;
            const refreshToken = userData.refreshToken;

            const encryptedAccessToken = encryptToken(accessToken);
            const encryptedRefreshToken = encryptToken(refreshToken);

            localStorage.setItem("accessToken", encryptedAccessToken);
            localStorage.setItem("refreshToken", encryptedRefreshToken);

            login(userData);
            navigate("/");

        } catch (error) {
            toast.error("Email hoặc mật khẩu không chính xác");
        } finally {
            setLoading(false); // tắt loading dù thành công hay thất bại
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-primary-lightest">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md z-10">
                <div className="flex justify-center mb-4">
                    <img src={sfbLogo} alt="SFB Logo" className="w-[48px] h-[48px]" />
                </div>

                <h1 className="text-2xl font-semibold text-center mb-1">Đăng nhập</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="font-medium block mb-1">Tài khoản</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={loading} // disable input khi loading
                        />
                    </div>

                    <div>
                        <label className="font-medium block mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading} // disable button khi loading
                        className={`w-full py-3 rounded-xl font-semibold transition ${
                            loading
                                ? "bg-primary-darkest opacity-50 cursor-not-allowed"
                                : "bg-primary-dark text-white hover:bg-primary-darkest"
                        }`}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <ClipLoader size={20} color="#fff" />
                                <span className="ml-2">Đang đăng nhập...</span>
                            </div>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </form>

                <div className="flex justify-center mt-4">
                    <a
                        href="/authentication/register"
                        className="text-primary-darkest font-medium hover:underline"
                    >
                        Quên mật khẩu
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
