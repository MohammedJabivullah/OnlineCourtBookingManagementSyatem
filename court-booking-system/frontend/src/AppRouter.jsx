import React from "react"
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import { Badge } from "./components/ui/badge"
import { LogOut } from "lucide-react"
import { AppStateProvider, useAppState } from "./state/AppState"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Landing from "./pages/Landing"
import Admin from "./pages/Admin"
import Lawyer from "./pages/Lawyer"
import Client from "./pages/Client"

function Header() {
  const { currentUser, setCurrentUser } = useAppState()
  if (!currentUser) return null
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/${currentUser.role}`} className="text-xl font-serif font-bold text-card-foreground">Court Booking System</Link>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="capitalize">{currentUser?.role}</Badge>
          <button className="border px-3 py-1 rounded-md" onClick={() => setCurrentUser(null)}>
            <span className="inline-flex items-center"><LogOut className="h-4 w-4 mr-2" />Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function AppRoutes() {
  const { currentUser } = useAppState()
  const guard = (component, role) => {
    if (!currentUser) return <Navigate to="/login" replace />
    if (role && currentUser.role !== role) return <Navigate to={`/${currentUser.role}`} replace />
    return component
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={guard(<Admin />, "admin")} />
      <Route path="/lawyer" element={guard(<Lawyer />, "lawyer")} />
      <Route path="/client" element={guard(<Client />, "client")} />
      <Route path="*" element={<Navigate to={currentUser ? `/${currentUser.role}` : "/login"} replace />} />
    </Routes>
  )
}

export default function AppRouter() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  )
}


