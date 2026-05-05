export function getUser() {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split('; ')
  let email = null
  let role = null

  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'user_email') email = decodeURIComponent(value)
    if (name === 'user_role') role = decodeURIComponent(value)
  }

  if (email && role) {
    return { email, role }
  }

  return null
}

export async function logout() {
  await fetch('/api/auth/logout')
  window.location.href = '/'
}
