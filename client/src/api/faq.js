import { api } from './client.js'

export const getFaqs    = ()       => api.get('/faq')
export const createFaq  = (data)   => api.post('/faq', data)
export const deleteFaq  = (id)     => api.delete(`/faq/${id}`)
