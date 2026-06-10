import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    firmName:    'Hashmi Traders',
    firmAddress: '',
    firmContact: '',
    allowPriceChange:    true,
    allowDiscountChange: true,
    checkStockAlert:     true,
    checkCreditDays:     true,
    duplicateSaleDays:   4,
    autoLockDays:        1,
    enableDelete:        false,
    categoryA:           true,
    categoryB:           true,
    categoryC:           true,
  },
  reducers: {
    updateSettings: (state, action) => {
      return { ...state, ...action.payload }
    }
  }
})

export const { updateSettings } = settingsSlice.actions
export default settingsSlice.reducer