import { api } from './client.js'

export const getMyContract      = ()            => api.get('/contracts/my')
export const downloadMyContract = ()            => api.download('/contracts/my/download')
export const getAllContracts     = ()            => api.get('/contracts')
export const uploadContract     = (tenantId, file) => {
  const form = new FormData()
  form.append('contract', file)
  return api.postForm(`/contracts/${tenantId}`, form)
}
