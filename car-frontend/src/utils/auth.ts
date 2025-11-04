export function setUser(user: unknown) {
    localStorage.setItem('user', JSON.stringify(user))
}


export function getUser() {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
}


export function clearUser() {
    localStorage.removeItem('user')
}

export function getFirstAndFatherName(fullName: string) {
  if (!fullName) return ''
  const parts = fullName.trim().split(' ')
  if (parts.length >= 3) {
    return parts[1] + ' ' + parts[2]
  }
  if (parts.length === 2) {
    return parts[1]
  }
  return fullName
}
