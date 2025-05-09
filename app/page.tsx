import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckIcon, ChevronDownIcon, MapPinIcon, PawPrintIcon, PhoneIcon, SendIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-green-50 py-20 md:py-32">
          <div className="container relative z-10">
            <div className="grid gap-6 md:grid-cols-2 md:gap-12 items-center">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  We Scoop the Poop <br />
                  So You Don&apos;t Have To!
                </h1>
                <p className="text-xl text-muted-foreground">
                  Professional dog waste removal services for busy pet owners. Weekly or twice-weekly visits to keep
                  your yard clean and fresh.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button size="lg" asChild>
                    <Link href="#services">View Pricing</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#how-it-works">How It Works</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Happy dog in clean yard"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section id="services" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Simple, Flat-Rate Pricing</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Choose the plan that works best for you and your furry friends
              </p>
            </div>

            <Tabs defaultValue="weekly" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="weekly">Once a Week</TabsTrigger>
                <TabsTrigger value="twice-weekly">Twice a Week</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly">
                <div className="grid gap-6 md:grid-cols-3">
                  <PricingCard
                    title="1 Dog"
                    price="$80"
                    description="Perfect for single-dog households"
                    features={[
                      "Once weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={1}
                    frequency="weekly"
                  />
                  <PricingCard
                    title="2 Dogs"
                    price="$100"
                    description="Great for multi-dog families"
                    features={[
                      "Once weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={2}
                    frequency="weekly"
                    highlighted={true}
                  />
                  <PricingCard
                    title="3 Dogs"
                    price="$120"
                    description="For the ultimate dog lovers"
                    features={[
                      "Once weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={3}
                    frequency="weekly"
                  />
                </div>
              </TabsContent>
              <TabsContent value="twice-weekly">
                <div className="grid gap-6 md:grid-cols-3">
                  <PricingCard
                    title="1 Dog"
                    price="$100"
                    description="Perfect for single-dog households"
                    features={[
                      "Twice weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={1}
                    frequency="twice-weekly"
                  />
                  <PricingCard
                    title="2 Dogs"
                    price="$120"
                    description="Great for multi-dog families"
                    features={[
                      "Twice weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={2}
                    frequency="twice-weekly"
                    highlighted={true}
                  />
                  <PricingCard
                    title="3 Dogs"
                    price="$140"
                    description="For the ultimate dog lovers"
                    features={[
                      "Twice weekly service",
                      "Thorough yard cleaning",
                      "Waste disposal included",
                      "Text notifications",
                    ]}
                    dogs={3}
                    frequency="twice-weekly"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12 max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>One-Time Yard Clean-Up</CardTitle>
                  <CardDescription>For yards that need a fresh start</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium">Deep cleaning for neglected yards</p>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>Thorough waste removal</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>No recurring commitment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          <span>Perfect before starting regular service</span>
                        </li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">$150</p>
                      <p className="text-sm text-muted-foreground">one-time fee</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/book?service=one-time">Book Deep Clean</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Getting started with iScoopDoo is simple and hassle-free
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">1. Choose Your Schedule</h3>
                <p className="mt-2 text-muted-foreground">
                  Select once or twice weekly service and pick your preferred days
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <MapPinIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">2. We Visit Your Yard</h3>
                <p className="mt-2 text-muted-foreground">Our professional scoopers arrive on your scheduled days</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <PawPrintIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">3. Enjoy Your Clean Yard</h3>
                <p className="mt-2 text-muted-foreground">We remove all waste, leaving your yard fresh and clean</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Everything you need to know about our poop scooping service
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <FaqAccordion />
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Don't just take our word for it - hear from our happy customers
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <TestimonialCard
                name="Sarah J."
                location="Denver, CO"
                quote="iScoopDoo has been a lifesaver! With my busy schedule and two large dogs, keeping the yard clean was impossible. Now it's always fresh and I don't have to worry about it."
                rating={5}
              />
              <TestimonialCard
                name="Michael T."
                location="Boulder, CO"
                quote="The service is reliable and thorough. I love that I can set my preferred days and they stick to the schedule. My yard has never been cleaner!"
                rating={5}
              />
              <TestimonialCard
                name="Jessica M."
                location="Fort Collins, CO"
                quote="As a new puppy owner, I was overwhelmed with all the responsibilities. iScoopDoo takes care of the worst part, and their staff is always friendly and professional."
                rating={4}
              />
            </div>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Get In Touch</h2>
                <p className="mt-4 text-muted-foreground">
                  Have questions or need more information? Reach out to our friendly team.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <SendIcon className="h-5 w-5 text-primary" />
                    <span>info@iscoopdoo.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <span>Serving the greater Denver metro area</span>
                  </div>
                </div>
              </div>

              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <PawPrintIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">iScoopDoo</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} iScoopDoo. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                <Link href="#" className="hover:underline">
                  Privacy Policy
                </Link>{" "}
                |
                <Link href="#" className="hover:underline">
                  {" "}
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  highlighted = false,
  dogs,
  frequency,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  dogs: number
  frequency: "weekly" | "twice-weekly"
}) {
  return (
    <Card className={`flex flex-col ${highlighted ? "border-primary shadow-lg" : ""}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/book?dogs=${dogs}&frequency=${frequency}`}>Start Service</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function FaqAccordion() {
  return (
    <div className="space-y-4">
      <FaqItem
        question="What if my dog is in the yard?"
        answer="No problem! Our scoopers are experienced with dogs and will work around them. If your dog is aggressive, we ask that you secure them during our visit."
      />
      <FaqItem
        question="Do I need to be home during the service?"
        answer="Not at all! As long as we have access to your yard, we can complete the service whether you're home or not. Many of our customers provide gate codes or leave side gates unlocked on service days."
      />
      <FaqItem
        question="What if it rains or snows?"
        answer="We work in most weather conditions! If severe weather makes service impossible, we'll reschedule for the next available day and notify you of the change."
      />
      <FaqItem
        question="How do I change my service schedule?"
        answer="You can easily update your preferred service days through your online account dashboard or by contacting our customer service team."
      />
      <FaqItem
        question="What areas do you serve?"
        answer="We currently serve the greater Denver metro area, including Boulder, Fort Collins, and surrounding suburbs."
      />
      <FaqItem
        question="How do I cancel my service?"
        answer="You can cancel anytime with no penalties. Simply log into your account dashboard or contact our customer service team to cancel your recurring service."
      />
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between gap-2 bg-background p-4 text-lg font-medium">
          {question}
          <ChevronDownIcon className="h-5 w-5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t p-4 text-muted-foreground">{answer}</div>
      </details>
    </div>
  )
}

function TestimonialCard({
  name,
  location,
  quote,
  rating,
}: { name: string; location: string; quote: string; rating: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
        <p className="italic mb-4">"{quote}"</p>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactForm() {
  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Name
          </Label>
          <Input
            id="name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Your email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="subject"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Subject
        </Label>
        <Input
          id="subject"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Subject"
        />
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="message"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Message
        </Label>
        <textarea
          id="message"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Your message"
        />
      </div>
      <Button className="w-full">Send Message</Button>
    </form>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
