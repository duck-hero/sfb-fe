import CryptoJS from "crypto-js";

// Sử dụng biến môi trường
const SECRET_KEY = import.meta.env.VITE_APP_KEY;


// Hàm mã hóa
export const encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};

// Hàm giải mã
export const decryptToken = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
