import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json')

export interface CMSUser {
  username: string
  passwordHash: string
  salt: string
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return arr
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes.buffer as ArrayBuffer, iterations: 100_000 },
    keyMaterial,
    256,
  )
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(saltBytes) }
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  try {
    const saltBytes = fromHex(salt)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes.buffer as ArrayBuffer, iterations: 100_000 },
      keyMaterial,
      256,
    )
    return toHex(new Uint8Array(bits)) === hash
  } catch {
    return false
  }
}

export function getUsers(): CMSUser[] {
  try {
    if (!existsSync(USERS_PATH)) return []
    return JSON.parse(readFileSync(USERS_PATH, 'utf-8')) as CMSUser[]
  } catch {
    return []
  }
}

export function setUsers(users: CMSUser[]): void {
  const dir = path.dirname(USERS_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')
}

export function findUser(username: string): CMSUser | undefined {
  return getUsers().find((u) => u.username === username)
}
