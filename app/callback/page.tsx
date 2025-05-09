// app/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PasswordResetCallback() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // Handle URL params (e.g., recovery token) from the query string
    const { search } = window.location
    const urlParams = new URLSearchParams(search)
    const accessToken = urlParams.get("access_token")
    const type = urlParams.get("type")

    if (type === "recovery" && accessToken) {
      console.log("Recovery flow detected")
      // You may validate or handle the token here if needed
    } else {
      setError("Invalid or missing recovery token.")
    }
  }, [])

  const handleReset = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) throw error

      setSuccessMessage("Password successfully reset! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while resetting your password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
        {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{successMessage}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              minLength={6}
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading || newPassword.length < 6}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  )
}
