export function useBitcoinUtils() {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000)
    return `${seconds}s`
  }

  return {
    formatPrice,
    formatTime,
  }
}
