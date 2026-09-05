const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function request(path, options = {}) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res
}

export const api = {
  get:    (path)         => request(path).then(r => r.json()),
  post:   (path, body)   => request(path, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()),
  patch:  (path, body)   => request(path, { method: 'PATCH', body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path)         => request(path, { method: 'DELETE' }).then(r => r.json()),
  postForm: (path, form) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const headers = {}
    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`
    return fetch(`${BASE}${path}`, { method: 'POST', headers, body: form }).then(r => r.json())
  },
  download: (path) => request(path),
}
