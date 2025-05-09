"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, PawPrint, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">iScoopDoo</span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-6">
          <Link
            href="/#services"
            className={`text-sm font-medium ${pathname === "/#services" ? "text-primary" : "text-foreground/60 hover:text-primary"}`}
          >
            Services
          </Link>
          <Link
            href="/#how-it-works"
            className={`text-sm font-medium ${pathname === "/#how-it-works" ? "text-primary" : "text-foreground/60 hover:text-primary"}`}
          >
            How It Works
          </Link>
          <Link
            href="/#faq"
            className={`text-sm font-medium ${pathname === "/#faq" ? "text-primary" : "text-foreground/60 hover:text-primary"}`}
          >
            FAQ
          </Link>
          <Link
            href="/#testimonials"
            className={`text-sm font-medium ${pathname === "/#testimonials" ? "text-primary" : "text-foreground/60 hover:text-primary"}`}
          >
            Testimonials
          </Link>
          <Link
            href="/#contact"
            className={`text-sm font-medium ${pathname === "/#contact" ? "text-primary" : "text-foreground/60 hover:text-primary"}`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!loading &&
            (user ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden md:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/book">Get Started</Link>
                </Button>
              </>
            ))}

          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/#services"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/#testimonials"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="/#contact"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            {!loading && !user && (
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
