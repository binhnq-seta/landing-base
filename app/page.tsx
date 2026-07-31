import { redirect } from 'next/navigation'

// The middleware redirects / → /vi (default locale).
// This fallback handles any edge case where middleware is bypassed.
export default function RootPage() {
  redirect('/vi')
}
