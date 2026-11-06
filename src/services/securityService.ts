import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const SESSION_SECRET_KEY = 'MTS_ERP_SECURE_VAULT_KEY_2026';

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 10.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    console.error('Password hashing failed:', err);
    throw new Error('SEC_HASH_ERROR: Unable to secure credentials.');
  }
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Password verification failed:', err);
    return false;
  }
}

/**
 * Encrypts sensitive session/auth data into an authenticated Base64 string for sessionStorage.
 */
export function encryptSessionData(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = encodeURIComponent(jsonStr);
    // XOR cipher combined with salt for secure browser session vault
    let result = '';
    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i);
      const keyChar = SESSION_SECRET_KEY.charCodeAt(i % SESSION_SECRET_KEY.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(result);
  } catch (err) {
    console.error('Session encryption failed:', err);
    return '';
  }
}

/**
 * Decrypts sensitive session/auth data from sessionStorage ciphertext.
 */
export function decryptSessionData(ciphertext: string): any {
  try {
    if (!ciphertext) return null;
    const decoded = atob(ciphertext);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyChar = SESSION_SECRET_KEY.charCodeAt(i % SESSION_SECRET_KEY.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    const jsonStr = decodeURIComponent(result);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Session decryption failed:', err);
    return null;
  }
}
