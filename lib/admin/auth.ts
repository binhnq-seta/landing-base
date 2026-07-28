const SECRET = process.env.ADMIN_SECRET ?? 'dev-secret-please-change-in-production'

async function getKey(usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  )
}

function toB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromB64url(str: string): ArrayBuffer {
  const padded =
    str.replace(/-/g, '+').replace(/_/g, '/') +
    '=='.slice(0, (4 - (str.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer as ArrayBuffer
}


export async function createSessionToken(username: string): Promise<string> {
  const payloadBytes = new TextEncoder().encode(
    JSON.stringify({ sub: username, exp: Date.now() + 24 * 60 * 60 * 1000 }),
  )
  const data = toB64url(payloadBytes)
  const key = await getKey('sign')
  const sig = toB64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)))
  return `${data}.${sig}`
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const data = token.slice(0, dot)
    const sig = fromB64url(token.slice(dot + 1))
    const key = await getKey('verify')
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sig,
      new TextEncoder().encode(data),
    )
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(data)))
    if (payload.exp < Date.now()) return null
    return payload.sub as string
  } catch {
    return null
  }
}
