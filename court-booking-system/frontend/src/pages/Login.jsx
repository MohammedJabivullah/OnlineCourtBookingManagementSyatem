import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Gavel } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppState } from "../state/AppState"
import { apiPost } from "../lib/api"

export default function Login() {
  const navigate = useNavigate()
  const { setCurrentUser, setToken } = useAppState()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { token, user } = await apiPost('/auth/login', credentials)
      setToken(token)
      setCurrentUser(user)
      navigate(`/${user.role}`)
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md bg-card border rounded-xl shadow-xl">
        <CardHeader className="text-center pb-1">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Gavel className="h-6 w-6" />
            </span>
            <div className="text-left">
              <CardTitle className="text-3xl font-serif leading-tight text-card-foreground">Court Booking System</CardTitle>
              <CardDescription className="text-sm">Sign in to continue</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} placeholder="Enter username" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} placeholder="Enter password" className="mt-1" required />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Quick Access (Admin)</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Demo</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="font-semibold mr-2">Username:</span>
              <span className="px-2 py-0.5 rounded bg-background border">admin</span>
            </div>
            <div className="mt-1 text-xs">
              <span className="font-semibold mr-2">Password:</span>
              <span className="px-2 py-0.5 rounded bg-background border">admin123</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span>New user? </span>
            <a className="text-primary underline" href="/signup">Create account</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


