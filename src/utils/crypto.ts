// src/utils/crypto.ts

class SecurityHelper {
  private static readonly SECRET_PASSWORD = "HDG_AGC_1123_33212_3313_123123_4321";

  private static async getKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(this.SECRET_PASSWORD));
    return await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(plainText: string): Promise<string> {
    if (!plainText) return plainText;

    const key = await this.getKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      data
    );

    const result = new Uint8Array(iv.byteLength + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.byteLength);

    return btoa(String.fromCharCode(...result));
  }

  static async decrypt(cipherText: string): Promise<string> {
    if (!cipherText) return cipherText;

    try {
      const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
      if (data.length < 16) throw new Error("Invalid ciphertext");

      const iv = data.slice(0, 16);
      const ciphertext = data.slice(16);
      const key = await this.getKey();

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.warn("Giải mã thất bại, trả về dữ liệu gốc:", err);
      return cipherText;
    }
  }
}

export default SecurityHelper;