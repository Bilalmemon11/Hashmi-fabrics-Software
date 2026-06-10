export const fmtDate = (date) =>
  new Date(date).toLocaleDateString(
    'en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  )