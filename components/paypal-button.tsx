"use client"

import { useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { paypalOptions } from "@/lib/paypal"
import { Loader2 } from "lucide-react"

interface PayPalButtonProps {
  amount: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
  description?: string
  isSubscription?: boolean
}

export function PayPalCheckoutButton({
  amount,
  onSuccess,
  onError,
  description = "iScoopDoo Service",
  isSubscription = false,
}: PayPalButtonProps) {
  const [isPending, setIsPending] = useState(false)

  return (
    <div className="w-full">
      {isPending && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Processing payment...</span>
        </div>
      )}

      <PayPalScriptProvider options={paypalOptions}>
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect" }}
          createOrder={(data, actions) => {
            setIsPending(true)
            return actions.order.create({
              purchase_units: [
                {
                  description: description,
                  amount: {
                    value: amount.toString(),
                    currency_code: "USD",
                  },
                },
              ],
              application_context: {
                shipping_preference: "NO_SHIPPING",
              },
            })
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture()
              setIsPending(false)
              onSuccess(details)
            }
          }}
          onError={(err) => {
            setIsPending(false)
            onError(err)
            console.error("PayPal error:", err)
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}

export function PayPalSubscriptionButton({
  amount,
  onSuccess,
  onError,
  description = "iScoopDoo Monthly Service",
}: PayPalButtonProps) {
  const [isPending, setIsPending] = useState(false)

  return (
    <div className="w-full">
      {isPending && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Setting up subscription...</span>
        </div>
      )}

      <PayPalScriptProvider options={{ ...paypalOptions, vault: true }}>
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect" }}
          createSubscription={(data, actions) => {
            setIsPending(true)
            return actions.subscription.create({
              plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "",
              custom_id: description,
              quantity: "1",
            })
          }}
          onApprove={async (data, actions) => {
            setIsPending(false)
            onSuccess(data)
          }}
          onError={(err) => {
            setIsPending(false)
            onError(err)
            console.error("PayPal subscription error:", err)
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}
