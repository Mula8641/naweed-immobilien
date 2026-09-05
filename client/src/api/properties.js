import { api } from './client.js'

export const getBuildings    = ()           => api.get('/properties/buildings')
export const getUnits        = (buildingId) => api.get(`/properties/units/${buildingId}`)
export const createBuilding  = (data)       => api.post('/properties/buildings', data)
export const createUnit      = (data)       => api.post('/properties/units', data)
export const updateUnit      = (id, data)   => api.patch(`/properties/units/${id}`, data)
export const deleteUnit      = (id)         => api.delete(`/properties/units/${id}`)
export const deleteBuilding  = (id)         => api.delete(`/properties/buildings/${id}`)
