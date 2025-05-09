"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PasswordReset() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle the URL params (e.g., recovery token) if necessary
  useEffect(() => {
    const handleHashChange = async () => {
      // Extract hash parameters
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      const accessToken = params.get("access_token")
      const type = params.get("type")

      if (type === "recovery" && accessToken) {
        // You can validate or handle the token if necessary
        console.log("Recovery flow detected")
      }
    }

    handleHashChange()
  }, [])

  const handleReset = async () => {
    setLoading(true)

    try {
      // Assuming Supabase handles token automatically
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (!error) {
        alert("Password updated! Redirecting to login...")
        router.push("/login")
      } else {
        alert(error.message)
      }
    } catch (err) {
      console.error("Error resetting password:", err)
      alert("An error occurred while resetting your password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>
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
