"use client"

// Simple encryption/decryption using Web Crypto API
export class CryptoUtils {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  // Generate a key from password
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey("raw", this.encoder.encode(password), "PBKDF2", false, [
      "deriveKey",
    ])

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    )
  }

  // Encrypt data
  static async encrypt(data: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await this.deriveKey(password, salt)

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, this.encoder.encode(data))

    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  // Decrypt data
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((char) => char.charCodeAt(0)),
      )

      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const encrypted = combined.slice(28)

      const key = await this.deriveKey(password, salt)

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted)

      return this.decoder.decode(decrypted)
    } catch (error) {
      throw new Error("Invalid password or corrupted data")
    }
  }

  // Hash password for verification
  static async hashPassword(password: string): Promise<string> {
    const data = this.encoder.encode(password)
    const hash = await crypto.subtle.digest("SHA-256", data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
  }
}
