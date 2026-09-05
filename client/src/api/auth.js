import { api } from './client.js'

export const login = (email, password) => api.post('/auth/login', { email, password })
