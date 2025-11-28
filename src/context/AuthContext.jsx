import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null, // Giá trị mặc định cho user
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState(
  //   JSON.parse(localStorage.getItem("user")) || null
  // );


const storedUser = localStorage.getItem("user");
const [user, setUser] = useState(
  storedUser && storedUser !== "null" ? JSON.parse(storedUser) : null
);



  useEffect(() => {
    // Lắng nghe sự thay đổi của user và cập nhật vào localStorage
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  // const login = (userData) => {
  //   setUser(userData);
  //   localStorage.setItem("user", JSON.stringify(userData));
  // };

  const login = (userData) => {
  // Tạo bản sao user nhưng bỏ token
  const { jwToken, refreshToken, ...userWithoutTokens } = userData;

  setUser(userWithoutTokens);
  localStorage.setItem("user", JSON.stringify(userWithoutTokens));
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
