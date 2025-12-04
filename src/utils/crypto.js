// src/utils/crypto.js

/**
 * Helper class for AES-CBC encryption and decryption using the Web Crypto API.
 * Uses a secret key derived from a VITE environment variable.
 * * NOTE: This is client-side encryption. The secret is visible in the browser source.
 * It's only suitable for obfuscation or protecting data from casual viewing, 
 * not high-security applications.
 */
class SecurityHelper {
  // Đọc SECRET_PASSWORD từ biến môi trường của Vite. 
  // Biến này PHẢI bắt đầu bằng VITE_ (ví dụ: VITE_CRYPTO_SECRET)
  // Cung cấp một giá trị mặc định để tránh lỗi nếu biến không được đặt.
  static #SECRET_PASSWORD = 
    import.meta.env.VITE_CRYPTO_SECRET || "DEFAULT_FALLBACK_SECRET";

  /**
   * Generates the CryptoKey from the SECRET_PASSWORD using SHA-256.
   * @returns {Promise<CryptoKey>} The derived key.
   */
  static async #getKey() {
    const encoder = new TextEncoder();
    
    // Hash the password using SHA-256
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(SecurityHelper.#SECRET_PASSWORD));
    
    // Import the hash as an AES-CBC key
    return await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts the plain text using AES-CBC.
   * Prepends the IV (Initialization Vector) to the ciphertext before base64 encoding.
   * @param {string} plainText The string to encrypt.
   * @returns {Promise<string>} The base64-encoded IV + ciphertext.
   */
  static async encrypt(plainText) {
    if (!plainText) return plainText;

    const key = await SecurityHelper.#getKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes IV for AES-CBC

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      data
    );

    // Concatenate IV and ciphertext into one Uint8Array
    const result = new Uint8Array(iv.byteLength + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.byteLength);

    // Convert Uint8Array to binary string, then base64 encode
    // Note: btoa is a browser/client-side function
    return btoa(String.fromCharCode(...result));
  }

  /**
   * Decrypts the base64-encoded ciphertext.
   * It expects the first 16 bytes of the decoded data to be the IV.
   * @param {string} cipherText The base64-encoded IV + ciphertext.
   * @returns {Promise<string>} The decrypted plain text or the original cipherText on failure.
   */
  static async decrypt(cipherText) {
    if (!cipherText) return cipherText;

    try {
      // Base64 decode, then convert to Uint8Array
      const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
      
      if (data.length < 16) throw new Error("Invalid ciphertext: data too short.");

      const iv = data.slice(0, 16);
      const ciphertext = data.slice(16);
      
      const key = await SecurityHelper.#getKey();

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        ciphertext
      );

      // Decode the result to a string
      return new TextDecoder().decode(decrypted);
    } catch (err) {
      // Log a warning and return the original text on decryption failure
      console.warn("Giải mã thất bại, trả về dữ liệu gốc:", err);
      return cipherText;
    }
  }
}

export default SecurityHelper;