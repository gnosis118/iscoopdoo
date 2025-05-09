// PayPal configuration options
export const paypalOptions = {
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
}

// Calculate price based on service type, dogs, and frequency
export function calculatePrice(service: string, dogs: number, frequency: string): number {
  if (service === "one-time") {
    return 150
  } else {
    if (frequency === "weekly") {
      if (dogs === 1) return 80
      else if (dogs === 2) return 100
      else if (dogs === 3) return 120
    } else {
      if (dogs === 1) return 100
      else if (dogs === 2) return 120
      else if (dogs === 3) return 140
    }
  }
  return 0
}
