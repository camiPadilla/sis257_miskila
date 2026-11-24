export function getTokenFromLocalStorage() {
  return localStorage.getItem('miskilaAccessToken')
}

export function getStoredUser<T>() {
  const value = localStorage.getItem('miskilaUser')
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}
