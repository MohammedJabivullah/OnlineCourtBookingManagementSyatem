const API_BASE = import.meta.env.VITE_API_BASE || "/api"

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...authHeaders(token) } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiDelete(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


