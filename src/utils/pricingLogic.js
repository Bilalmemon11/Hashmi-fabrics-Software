export function getRate(product, category) {
  switch (category) {
    case 'A': return product.sale_net_rate
    case 'B': return product.sale_dozen_carton_rate / 12
    case 'C': return product.sale_super_mart_rate
    default:  return product.sale_net_rate
  }
}

export function calcLineTotal(qty, rate, discPct, tpPct, tradePct, gst1Pct, gst2Pct) {
  const gross     = qty * rate
  const disc      = gross * (discPct / 100)
  const tp        = gross * (tpPct / 100)
  const trade     = gross * (tradePct / 100)
  const afterDisc = gross - disc - tp - trade
  const gst1      = afterDisc * (gst1Pct / 100)
  const gst2      = afterDisc * (gst2Pct / 100)
  return +(afterDisc + gst1 + gst2).toFixed(2)
}
