"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckDatabasePage() {
  const [status, setStatus] = useState<{
    loading: boolean
    error?: string
    data?: any
  }>({
    loading: true,
  })

  const checkConnection = async () => {
    setStatus({ loading: true })
    try {
      const response = await fetch("/api/check-db")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check database connection")
      }

      setStatus({
        loading: false,
        data,
      })
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Database Connection Check</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Check if your database connections are working properly</CardDescription>
        </CardHeader>
        <CardContent>
          {status.loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Checking connection...</span>
            </div>
          ) : status.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">{status.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p className="font-medium">Prisma Connection</p>
                  <p className="text-sm">{status.data.prismaConnection}</p>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p className="font-medium">Supabase Connection</p>
                  <p className="text-sm">{status.data.supabaseConnection}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(status.data.environmentVariables, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkConnection} disabled={status.loading}>
            {status.loading ? "Checking..." : "Check Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
