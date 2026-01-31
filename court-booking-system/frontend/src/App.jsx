import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Badge } from "./components/ui/badge"
import { Calendar, Users, Gavel, Clock, User, LogOut, Plus } from "lucide-react"

// Sample data
const sampleUsers = [
  { id: 1, username: "admin", password: "admin123", role: "admin", name: "System Administrator" },
  {
    id: 2,
    username: "lawyer",
    password: "lawyer123",
    role: "lawyer",
    name: "John Smith",
    specialization: "Criminal Law",
  },
  { id: 3, username: "client", password: "client123", role: "client", name: "Jane Doe" },
]

const sampleBookings = [
  {
    id: 1,
    lawyerId: 2,
    clientId: 3,
    courtroom: "Courtroom A",
    date: "2024-01-25",
    time: "11:00 AM",
    case: "Smith vs. State",
    status: "confirmed",
  },
  {
    id: 2,
    lawyerId: 2,
    clientId: 3,
    courtroom: "Courtroom B",
    date: "2024-01-28",
    time: "2:00 PM",
    case: "Property Dispute",
    status: "pending",
  },
]

const courtrooms = ["Courtroom A", "Courtroom B", "Courtroom C", "Courtroom D"]
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(sampleUsers)
  const [bookings, setBookings] = useState(sampleBookings)
  const [appointments, setAppointments] = useState([])
  const [activeView, setActiveView] = useState("login")

  // Simple notification stubs (replace with Twilio/SendGrid/Nodemailer later)
  const sendSms = (to, message) => {
    console.log("SMS ->", to, message)
  }
  const sendEmail = (to, subject, body) => {
    console.log("EMAIL ->", to, subject, body)
  }

  // Utility: aggregate a simple unified calendar list with type and color
  const getUnifiedCalendar = () => {
    const hearingEvents = bookings.map((b) => ({
      type: "hearing",
      color: "text-red-600",
      title: b.case,
      date: b.date,
      time: b.time,
      extra: `${b.courtroom} • ${b.status}`,
    }))
    const appointmentEvents = appointments.map((a) => ({
      type: "appointment",
      color: "text-blue-600",
      title: "Client Appointment",
      date: a.date,
      time: a.time,
      extra: `Client ${a.clientId} ↔ Lawyer ${a.lawyerId} • ${a.status}`,
    }))
    const courtroomEvents = bookings.map((b) => ({
      type: "courtroom",
      color: "text-green-600",
      title: b.courtroom,
      date: b.date,
      time: b.time,
      extra: "Booked",
    }))
    return [...hearingEvents, ...appointmentEvents, ...courtroomEvents]
  }

  // Login Component
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "" })
    const [error, setError] = useState("")

    const handleLogin = (e) => {
      e.preventDefault()
      const user = users.find((u) => u.username === credentials.username && u.password === credentials.password)
      if (user) {
        setCurrentUser(user)
        setActiveView(user.role)
        setError("")
      } else {
        setError("Invalid credentials")
      }
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Gavel className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Court Booking System</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p>
                  <strong>Lawyer:</strong> lawyer / lawyer123
                </p>
                <p>
                  <strong>Client:</strong> client / client123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Navigation Header
  const Header = () => (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gavel className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-serif font-bold text-card-foreground">Court Booking System</h1>
            <p className="text-sm text-muted-foreground">Welcome, {currentUser?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="capitalize">
            {currentUser?.role}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentUser(null)
              setActiveView("login")
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )

  // Admin Dashboard
  const AdminDashboard = () => {
    const [newCourtroom, setNewCourtroom] = useState("")

    const addCourtroom = () => {
      if (newCourtroom.trim()) {
        courtrooms.push(newCourtroom.trim())
        setNewCourtroom("")
        alert(`Courtroom "${newCourtroom}" added successfully!`)
      }
    }

    const approveBooking = (bookingId) => {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b)))
    }

    const rejectBooking = (bookingId) => {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
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
                  <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.username} • {user.role}
                      </p>
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
                  <Input
                    placeholder="Enter courtroom name"
                    value={newCourtroom}
                    onChange={(e) => setNewCourtroom(e.target.value)}
                  />
                  <Button onClick={addCourtroom}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
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
            <CardDescription>Overview of all court bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.map((booking) => {
                const lawyer = users.find((u) => u.id === booking.lawyerId)
                const client = users.find((u) => u.id === booking.clientId)
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.case}</p>
                      <p className="text-sm text-muted-foreground">
                        {lawyer?.name} representing {client?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} at {booking.time} - {booking.courtroom}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => approveBooking(booking.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => rejectBooking(booking.id)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Courtrooms</CardTitle>
            <CardDescription>Map lawyers to preferred rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.filter((u) => u.role === "lawyer").map((lawyer) => (
                <div key={lawyer.id} className="flex items-center gap-2">
                  <span className="w-48">{lawyer.name}</span>
                  <select
                    className="w-56 p-2 border border-border rounded-md bg-input"
                    onChange={(e) => alert(`Assigned ${e.target.value} to ${lawyer.name}`)}
                    defaultValue=""
                  >
                    <option value="" disabled>Assign courtroom</option>
                    {courtrooms.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Lawyer Dashboard
  const LawyerDashboard = () => {
    const [bookingForm, setBookingForm] = useState({
      courtroom: "",
      date: "",
      time: "",
      case: "",
      clientId: "",
    })
    const [showBookingForm, setShowBookingForm] = useState(false)

    const handleBooking = (e) => {
      e.preventDefault()
      // Prevent double booking for same courtroom/date/time
      const hasConflict = bookings.some(
        (b) => b.courtroom === bookingForm.courtroom && b.date === bookingForm.date && b.time === bookingForm.time
      )
      if (hasConflict) {
        alert("Selected slot is already booked. Please choose another.")
        return
      }
      const newBooking = {
        id: bookings.length + 1,
        lawyerId: currentUser.id,
        clientId: Number.parseInt(bookingForm.clientId),
        courtroom: bookingForm.courtroom,
        date: bookingForm.date,
        time: bookingForm.time,
        case: bookingForm.case,
        status: "pending",
      }
      setBookings([...bookings, newBooking])
      setBookingForm({ courtroom: "", date: "", time: "", case: "", clientId: "" })
      setShowBookingForm(false)
      alert(`Booking submitted for approval: ${bookingForm.date} ${bookingForm.time} in ${bookingForm.courtroom}`)
      sendSms("LAWYER", `New booking requested for ${newBooking.date} ${newBooking.time} in ${newBooking.courtroom}`)
      sendEmail("admin@example.com", "New Booking Pending", JSON.stringify(newBooking))
    }

    const lawyerBookings = bookings.filter((b) => b.lawyerId === currentUser.id)
    const clients = users.filter((u) => u.role === "client")

    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold">Lawyer Dashboard</h2>
            <p className="text-muted-foreground">Manage your court bookings and cases</p>
          </div>
          <Button onClick={() => setShowBookingForm(!showBookingForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>

        {showBookingForm && (
          <Card>
            <CardHeader>
              <CardTitle>Book Court Session</CardTitle>
              <CardDescription>Schedule a new court hearing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courtroom">Courtroom</Label>
                    <select
                      id="courtroom"
                      className="w-full p-2 border border-border rounded-md bg-input"
                      value={bookingForm.courtroom}
                      onChange={(e) => setBookingForm({ ...bookingForm, courtroom: e.target.value })}
                      required
                    >
                      <option value="">Select Courtroom</option>
                      {courtrooms.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <select
                      id="client"
                      className="w-full p-2 border border-border rounded-md bg-input"
                      value={bookingForm.clientId}
                      onChange={(e) => setBookingForm({ ...bookingForm, clientId: e.target.value })}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <select
                      id="time"
                      className="w-full p-2 border border-border rounded-md bg-input"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      required
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="case">Case Title</Label>
                  <Input
                    id="case"
                    type="text"
                    placeholder="Enter case title"
                    value={bookingForm.case}
                    onChange={(e) => setBookingForm({ ...bookingForm, case: e.target.value })}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Book Session</Button>
                  <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyerBookings.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Upcoming hearings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Court Sessions</CardTitle>
            <CardDescription>Your scheduled hearings and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lawyerBookings.map((booking) => {
                const client = users.find((u) => u.id === booking.clientId)
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.case}</p>
                      <p className="text-sm text-muted-foreground">Client: {client?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} at {booking.time} - {booking.courtroom}
                      </p>
                    </div>
                    <Badge variant="default">{booking.status}</Badge>
                  </div>
                )
              })}
              {lawyerBookings.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No bookings scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Client Dashboard
  const ClientDashboard = () => {
    const [appointmentForm, setAppointmentForm] = useState({
      lawyerId: "",
      date: "",
      time: "",
      description: "",
    })
    const [showAppointmentForm, setShowAppointmentForm] = useState(false)

    const handleAppointment = (e) => {
      e.preventDefault()
      // prevent overlapping appointment with same lawyer/time
      const hasConflict = appointments.some(
        (a) => a.lawyerId === Number.parseInt(appointmentForm.lawyerId) && a.date === appointmentForm.date && a.time === appointmentForm.time
      )
      if (hasConflict) {
        alert("Selected appointment slot is not available. Choose another.")
        return
      }
      const newAppointment = {
        id: appointments.length + 1,
        clientId: currentUser.id,
        lawyerId: Number.parseInt(appointmentForm.lawyerId),
        date: appointmentForm.date,
        time: appointmentForm.time,
        description: appointmentForm.description,
        status: "pending",
      }
      setAppointments([...appointments, newAppointment])
      setAppointmentForm({ lawyerId: "", date: "", time: "", description: "" })
      setShowAppointmentForm(false)
      alert(`Appointment request sent for ${appointmentForm.date} at ${appointmentForm.time}`)
      sendSms("CLIENT", `Appointment requested for ${newAppointment.date} ${newAppointment.time}`)
      sendEmail("lawyer@example.com", "New Appointment Request", JSON.stringify(newAppointment))
    }

    const lawyers = users.filter((u) => u.role === "lawyer")
    const clientBookings = bookings.filter((b) => b.clientId === currentUser.id)
    const clientAppointments = appointments.filter((a) => a.clientId === currentUser.id)

    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold">Client Dashboard</h2>
            <p className="text-muted-foreground">Manage your appointments and court hearings</p>
          </div>
          <Button onClick={() => setShowAppointmentForm(!showAppointmentForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {showAppointmentForm && (
          <Card>
            <CardHeader>
              <CardTitle>Book Lawyer Appointment</CardTitle>
              <CardDescription>Schedule a consultation with a lawyer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lawyer">Select Lawyer</Label>
                    <select
                      id="lawyer"
                      className="w-full p-2 border border-border rounded-md bg-input"
                      value={appointmentForm.lawyerId}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, lawyerId: e.target.value })}
                      required
                    >
                      <option value="">Choose a lawyer</option>
                      {lawyers.map((lawyer) => (
                        <option key={lawyer.id} value={lawyer.id}>
                          {lawyer.name} - {lawyer.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time</Label>
                    <select
                      id="time"
                      className="w-full p-2 border border-border rounded-md bg-input"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                      required
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Case Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border border-border rounded-md bg-input min-h-[100px]"
                    placeholder="Briefly describe your legal matter"
                    value={appointmentForm.description}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Book Appointment</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Hearings</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientBookings.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled hearings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientAppointments.length}</div>
              <p className="text-xs text-muted-foreground">With lawyers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Hearing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 25</div>
              <p className="text-xs text-muted-foreground">11:00 AM</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Court Hearings</CardTitle>
              <CardDescription>Your scheduled court appearances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientBookings.map((booking) => {
                  const lawyer = users.find((u) => u.id === booking.lawyerId)
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.case}</p>
                        <p className="text-sm text-muted-foreground">Lawyer: {lawyer?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.date} at {booking.time} - {booking.courtroom}
                        </p>
                      </div>
                      <Badge variant="default">{booking.status}</Badge>
                    </div>
                  )
                })}
                {clientBookings.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hearings scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lawyer Appointments</CardTitle>
              <CardDescription>Your consultation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientAppointments.map((appointment) => {
                  const lawyer = users.find((u) => u.id === appointment.lawyerId)
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Consultation with {lawyer?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.description}</p>
                      </div>
                      <Badge variant="secondary">{appointment.status}</Badge>
                    </div>
                  )
                })}
                {clientAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unified Calendar</CardTitle>
              <CardDescription>All events in one list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getUnifiedCalendar().map((ev, idx) => (
                  <div key={idx} className="flex items-center justify-between border rounded p-2 text-sm">
                    <span className={ev.color}>{ev.title}</span>
                    <span className="text-muted-foreground">{ev.date} • {ev.time}</span>
                    <span className="text-muted-foreground">{ev.extra}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main render logic
  if (!currentUser) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {activeView === "admin" && <AdminDashboard />}
        {activeView === "lawyer" && <LawyerDashboard />}
        {activeView === "client" && <ClientDashboard />}
      </main>
    </div>
  )
}

export default App
