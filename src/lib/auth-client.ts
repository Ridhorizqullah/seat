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

export function logout() {
  if (typeof document === 'undefined') return

  // Hapus cookie
  document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

  // Redirect
  window.location.href = '/'
}
