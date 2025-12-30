import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits
const KEY_LENGTH = 32 // 256 bits

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // If key is hex encoded (64 chars = 32 bytes)
  if (key.length === 64) {
    return Buffer.from(key, 'hex')
  }

  // If key is base64 encoded
  if (key.length === 44) {
    return Buffer.from(key, 'base64')
  }

  // Otherwise hash it to get consistent 32 bytes
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(key).digest()
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns: base64(iv + authTag + ciphertext)
 */
export function encryptKey(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Combine: iv (12 bytes) + authTag (16 bytes) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted])

  return combined.toString('base64')
}

/**
 * Decrypts a ciphertext that was encrypted with encryptKey
 * Expects: base64(iv + authTag + ciphertext)
 */
export function decryptKey(ciphertext: string): string {
  const key = getEncryptionKey()
  const combined = Buffer.from(ciphertext, 'base64')

  // Extract parts: iv (12 bytes) + authTag (16 bytes) + ciphertext
  const iv = combined.subarray(0, IV_LENGTH)
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Generates a new random encryption key (for initial setup)
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex')
}
