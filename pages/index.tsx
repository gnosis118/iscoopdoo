"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function PagesIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return <div>Redirecting...</div>
}
