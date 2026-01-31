import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Calendar, Users, Gavel, Plus } from "lucide-react"
import { courtrooms, useAppState } from "../state/AppState"
import { apiGet, apiPost, apiDelete } from "../lib/api"

export default function Admin() {
  const { token, users, bookings, setBookings } = useAppState()
  const [newCourtroom, setNewCourtroom] = useState("")

  const addCourtroom = () => {
    if (newCourtroom.trim()) {
      courtrooms.push(newCourtroom.trim())
      setNewCourtroom("")
      alert(`Courtroom "${newCourtroom}" added successfully!`)
    }
  }

  const approveBooking = async (bookingId) => {
    const updated = await apiPost(`/bookings/${bookingId}/approve`, {}, token)
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
  }

  const rejectBooking = async (bookingId) => {
    await apiDelete(`/bookings/${bookingId}`, token)
    setBookings((prev) => prev.filter((b) => b._id !== bookingId))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Court sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courtrooms</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courtrooms.length}</div>
            <p className="text-xs text-muted-foreground">Available rooms</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id || user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.username} • {user.role}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courtroom Management</CardTitle>
            <CardDescription>Add and manage courtroom availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input placeholder="Enter courtroom name" value={newCourtroom} onChange={(e) => setNewCourtroom(e.target.value)} />
                <Button onClick={addCourtroom}><Plus className="h-4 w-4 mr-2" />Add</Button>
              </div>
              <div className="space-y-2">
                {courtrooms.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                    <span>{room}</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Approve or reject pending bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.map((booking) => {
              const lawyer = users.find((u) => (u._id || u.id) === (booking.lawyerId?._id || booking.lawyerId))
              const client = users.find((u) => (u._id || u.id) === (booking.clientId?._id || booking.clientId))
              return (
                <div key={booking._id || booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.case}</p>
                    <p className="text-sm text-muted-foreground">{lawyer?.name} representing {client?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.date} at {booking.time} - {booking.courtroom}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                    {booking.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => approveBooking(booking._id || booking.id)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectBooking(booking._id || booking.id)}>Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


