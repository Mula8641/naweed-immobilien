import { api } from './client.js'

export const getMyInvoices     = ()         => api.get('/invoices/my')
export const getAllInvoices     = ()         => api.get('/invoices')
export const createInvoice     = (data)     => api.post('/invoices', data)
export const updateStatus      = (id, status) => api.patch(`/invoices/${id}/status`, { status })
export const downloadInvoicePdf = (id, isAdmin = false) => {
  const path = isAdmin ? `/invoices/${id}/pdf` : `/invoices/my/${id}/pdf`
  return api.download(path)
}
