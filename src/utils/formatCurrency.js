export const fmt = (amount) =>
  'Rs ' + Number(amount || 0)
    .toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
