export const formatCurrency = (amount) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const monthName = (month, lang = 'en') => {
  const date = new Date(2000, month - 1, 1)
  return date.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { month: 'long' })
}
