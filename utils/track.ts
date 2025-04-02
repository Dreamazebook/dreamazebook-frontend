// utils/facebookPixel.ts
type FacebookEventParams = Record<string, string | number | boolean>

export const fbTrack = (
  eventName: string,
  options?: FacebookEventParams
): void => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, options)
  }
}

// Usage example:
// fbTrack('Purchase', { value: 100, currency: 'USD' })