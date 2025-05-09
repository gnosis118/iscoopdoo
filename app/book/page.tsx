"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, CheckIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayPalCheckoutButton, PayPalSubscriptionButton } from "@/components/paypal-button"
import { createBooking } from "./actions"

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialDogs = searchParams.get("dogs") ? Number.parseInt(searchParams.get("dogs") as string) : 1
  const initialFrequency = searchParams.get("frequency") || "weekly"
  const initialService = searchParams.get("service") || "regular"

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paypal")

  const [formData, setFormData] = useState({
    service: initialService,
    dogs: initialDogs,
    frequency: initialFrequency,
    selectedDays: [] as Date[],
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    specialInstructions: "",
    paymentId: "",
    paymentStatus: "pending",
  })

  const handleDaySelect = (day: Date) => {
    if (formData.frequency === "weekly" && formData.selectedDays.length >= 1) {
      setFormData({
        ...formData,
        selectedDays: [day],
      })
      return
    }

    if (formData.frequency === "twice-weekly" && formData.selectedDays.length >= 2) {
      setFormData({
        ...formData,
        selectedDays: [formData.selectedDays[0], day],
      })
      return
    }

    const isSelected = formData.selectedDays.some((selectedDay) => selectedDay.toDateString() === day.toDateString())

    if (isSelected) {
      setFormData({
        ...formData,
        selectedDays: formData.selectedDays.filter((selectedDay) => selectedDay.toDateString() !== day.toDateString()),
      })
    } else {
      setFormData({
        ...formData,
        selectedDays: [...formData.selectedDays, day],
      })
    }
  }

  const handlePayPalSuccess = async (details: any) => {
    try {
      setLoading(true)

      // Update form data with payment details
      const updatedFormData = {
        ...formData,
        paymentId: details.id || details.subscriptionID || details.orderID,
        paymentStatus: "completed",
      }

      // Submit the booking with payment info
      const result = await createBooking(updatedFormData)

      if (result.success) {
        setComplete(true)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("An error occurred while processing your payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalError = (error: any) => {
    console.error("PayPal error:", error)
    alert("There was an issue with your payment. Please try again or choose a different payment method.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If using PayPal, the submission is handled by the PayPal success callback
    if (paymentMethod !== "paypal") {
      setLoading(true)

      try {
        const result = await createBooking(formData)

        if (result.success) {
          setComplete(true)
        } else {
          alert(`Error: ${result.error}`)
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        alert("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const getPrice = () => {
    if (formData.service === "one-time") return 150

    if (formData.frequency === "weekly") {
      if (formData.dogs === 1) return 80
      if (formData.dogs === 2) return 100
      if (formData.dogs === 3) return 120
    } else {
      if (formData.dogs === 1) return 100
      if (formData.dogs === 2) return 120
      if (formData.dogs === 3) return 140
    }

    return 0
  }

  const isNextDisabled = () => {
    if (step === 1) {
      if (formData.service === "one-time") return false
      return (
        formData.selectedDays.length === 0 ||
        (formData.frequency === "twice-weekly" && formData.selectedDays.length < 2)
      )
    }

    if (step === 2) {
      return (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.zip
      )
    }

    return false
  }

  if (complete) {
    return (
      <div className="container max-w-3xl py-10">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription className="text-center">Thank you for choosing iScoopDoo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Booking Details</h3>
              <div className="mt-2 grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">
                    {formData.service === "one-time"
                      ? "One-Time Cleanup"
                      : `${formData.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service (${formData.dogs} ${formData.dogs > 1 ? "Dogs" : "Dog"})`}
                  </span>
                </div>
                {formData.service !== "one-time" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Days:</span>
                    <span className="font-medium">
                      {formData.selectedDays
                        .map((day) => day.toLocaleDateString("en-US", { weekday: "long" }))
                        .join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium">{formData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    ${getPrice()}
                    {formData.service !== "one-time" ? "/month" : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">What's Next?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You'll receive a confirmation email shortly with all your booking details. If you selected a recurring
                service, your first cleaning will be on the next scheduled day.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Book Your Service</h1>
        <p className="text-muted-foreground">
          {formData.service === "one-time"
            ? "Schedule your one-time yard cleanup"
            : "Set up your recurring poop scooping service"}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "border bg-muted text-muted-foreground"}`}
            >
              1
            </div>
            <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Service Details</span>
          </div>
          <Separator className="w-10 sm:w-20" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "border bg-muted text-muted-foreground"}`}
            >
              2
            </div>
            <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Your Information</span>
          </div>
          <Separator className="w-10 sm:w-20" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "border bg-muted text-muted-foreground"}`}
            >
              3
            </div>
            <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Payment</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Service</CardTitle>
              <CardDescription>Select your service type and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <RadioGroup
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="regular" id="regular" className="peer sr-only" />
                    <Label
                      htmlFor="regular"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-medium">Regular Service</span>
                      <span className="text-sm text-muted-foreground">Weekly or twice-weekly</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="one-time" id="one-time" className="peer sr-only" />
                    <Label
                      htmlFor="one-time"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-medium">One-Time Cleanup</span>
                      <span className="text-sm text-muted-foreground">Deep clean service</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.service === "regular" && (
                <>
                  <div className="space-y-2">
                    <Label>Number of Dogs</Label>
                    <RadioGroup
                      value={formData.dogs.toString()}
                      onValueChange={(value) => setFormData({ ...formData, dogs: Number.parseInt(value) })}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="1" id="dogs-1" className="peer sr-only" />
                        <Label
                          htmlFor="dogs-1"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="font-medium">1 Dog</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="2" id="dogs-2" className="peer sr-only" />
                        <Label
                          htmlFor="dogs-2"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="font-medium">2 Dogs</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="3" id="dogs-3" className="peer sr-only" />
                        <Label
                          htmlFor="dogs-3"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="font-medium">3 Dogs</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Frequency</Label>
                    <RadioGroup
                      value={formData.frequency}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          frequency: value,
                          selectedDays:
                            value === "weekly" && formData.selectedDays.length > 1
                              ? [formData.selectedDays[0]]
                              : formData.selectedDays,
                        })
                      }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="weekly" id="weekly" className="peer sr-only" />
                        <Label
                          htmlFor="weekly"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="font-medium">Once a Week</span>
                          <span className="text-sm text-muted-foreground">
                            ${formData.dogs === 1 ? 80 : formData.dogs === 2 ? 100 : 120}/month
                          </span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="twice-weekly" id="twice-weekly" className="peer sr-only" />
                        <Label
                          htmlFor="twice-weekly"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="font-medium">Twice a Week</span>
                          <span className="text-sm text-muted-foreground">
                            ${formData.dogs === 1 ? 100 : formData.dogs === 2 ? 120 : 140}/month
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Your Service Days</Label>
                      <span className="text-sm text-muted-foreground">
                        {formData.frequency === "weekly" ? "Choose 1 day" : "Choose 2 days"}
                      </span>
                    </div>
                    <div className="rounded-md border">
                      <Calendar
                        mode="multiple"
                        selected={formData.selectedDays}
                        onSelect={(days) => {
                          if (!days) return
                          setFormData({ ...formData, selectedDays: days })
                        }}
                        className="rounded-md"
                        disabled={(date) => {
                          // Only allow selecting weekdays (Monday to Friday)
                          return date.getDay() === 0 || date.getDay() === 6
                        }}
                        modifiers={{
                          selected: formData.selectedDays,
                        }}
                        modifiersStyles={{
                          selected: {
                            backgroundColor: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                          },
                        }}
                        footer={
                          <div className="p-3 border-t text-sm text-muted-foreground">
                            We service Monday-Friday only. These days will repeat weekly.
                          </div>
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.service === "one-time" && (
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">One-Time Yard Clean-Up</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our team will thoroughly clean your entire yard, removing all pet waste.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>Thorough waste removal</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>Perfect for neglected yards</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>One-time service with no commitment</span>
                        </li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">$150</p>
                      <p className="text-sm text-muted-foreground">one-time fee</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button onClick={() => setStep(2)} disabled={isNextDisabled()}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us where to provide service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Denver"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="CO"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="80202"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-medium">Special Instructions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please provide any special instructions for accessing your yard (gate codes, dog information, etc.)
                </p>
                <textarea
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Gate code: 1234, beware of friendly golden retriever named Max..."
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={isNextDisabled()}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Complete your booking with secure payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-medium">Order Summary</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service:</span>
                    <span>
                      {formData.service === "one-time"
                        ? "One-Time Cleanup"
                        : `${formData.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service (${formData.dogs} ${formData.dogs > 1 ? "Dogs" : "Dog"})`}
                    </span>
                  </div>
                  {formData.service !== "one-time" && (
                    <div className="flex justify-between text-sm">
                      <span>Service Days:</span>
                      <span>
                        {formData.selectedDays
                          .map((day) => day.toLocaleDateString("en-US", { weekday: "long" }))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      ${getPrice()}
                      {formData.service !== "one-time" ? "/month" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Tabs defaultValue="paypal" onValueChange={(value) => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="invoice">Pay Later (Invoice)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paypal" className="pt-4">
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-blue-50">
                        <p className="text-sm">
                          Pay securely with PayPal. You can use your PayPal account or pay with a credit/debit card
                          without creating an account.
                        </p>
                      </div>

                      {formData.service === "one-time" ? (
                        <PayPalCheckoutButton
                          amount={getPrice()}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                          description="iScoopDoo One-Time Cleanup"
                        />
                      ) : (
                        <PayPalSubscriptionButton
                          amount={getPrice()}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                          description={`iScoopDoo ${formData.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service (${formData.dogs} Dogs)`}
                        />
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="invoice" className="pt-4">
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <p className="text-sm">
                          We'll send you an invoice to the email address you provided. You can pay the invoice within 7
                          days of your service.
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Complete Booking & Receive Invoice`
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="mt-1" />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and understand that{" "}
                    {formData.service === "one-time" ? "this is a one-time charge" : "my card will be charged monthly"}.
                    {formData.service !== "one-time" && " I can cancel anytime."}
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              {paymentMethod === "invoice" && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    `Complete Booking`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  )
}
