import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Calendar, Clock, Plus, User } from "lucide-react"
import { courtrooms, timeSlots, useAppState } from "../state/AppState"
import { apiGet, apiPost, apiDelete } from "../lib/api"

export default function Lawyer() {
  const { token, currentUser, users, bookings, setBookings, appointments, setAppointments, sendSms, sendEmail, getUnifiedCalendar } = useAppState()
  const [clients, setClients] = useState([])
  const [bookingForm, setBookingForm] = useState({ courtroom: "", date: "", time: "", case: "", clientId: "" })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [availabilityDate, setAvailabilityDate] = useState("")
  const [availability, setAvailability] = useState([])
  const [weekStart, setWeekStart] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!availabilityDate) return
      const data = await apiGet(`/availability?date=${availabilityDate}`)
      setAvailability(data.availability || [])
    }
    load()
  }, [availabilityDate])

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const list = await apiGet('/appointments', token)
        setAppointments(list)
      } catch (e) {
        // ignore
      }
    }
    loadAppointments()
  }, [])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const list = await apiGet('/clients', token)
        setClients(list)
      } catch (e) {
        console.error('Failed to load clients', e)
        setClients([])
      }
    }
    loadClients()
  }, [token])

  const handleBooking = async (e) => {
    e.preventDefault()
    const payload = {
      lawyerId: currentUser.id,
      clientId: bookingForm.clientId,
      courtroom: bookingForm.courtroom,
      date: bookingForm.date,
      time: bookingForm.time,
      caseTitle: bookingForm.case,
    }
    const created = await apiPost('/bookings', payload, token)
    setBookings([...bookings, created])
    setBookingForm({ courtroom: "", date: "", time: "", case: "", clientId: "" })
    setShowBookingForm(false)
    alert(`Booking submitted for approval: ${created.date} ${created.time} in ${created.courtroom}`)
    sendSms("LAWYER", `New booking requested for ${created.date} ${created.time} in ${created.courtroom}`)
    sendEmail("admin@example.com", "New Booking Pending", JSON.stringify(created))
  }

  const lawyerBookings = bookings.filter((b) => (b.lawyerId?._id || b.lawyerId) === currentUser.id)
  const lawyerAppointments = appointments.filter((a) => (a.lawyerId?._id || a.lawyerId) === currentUser.id)
  // clients fetched from backend

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Lawyer Dashboard</h2>
          <p className="text-muted-foreground">Manage your court bookings and cases</p>
        </div>
        <Button onClick={() => setShowBookingForm(!showBookingForm)}><Plus className="h-4 w-4 mr-2" />New Booking</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courtroom Availability</CardTitle>
          <CardDescription>Select a date to view free/occupied slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Label htmlFor="availability-date">Date</Label>
            <Input id="availability-date" type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} />
          </div>
          {availability.length > 0 ? (
            <div className="space-y-4">
              {availability.map((room) => (
                <div key={room.courtroom} className="border rounded p-3">
                  <div className="font-medium mb-2">{room.courtroom}</div>
                  <div className="flex flex-wrap gap-2">
                    {room.slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setBookingForm((f) => ({ ...f, courtroom: room.courtroom, date: availabilityDate, time: s.time }))}
                        className={`px-3 py-1 rounded border text-sm ${s.available ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        title={s.available ? 'Click to select' : 'Unavailable'}
                      >
                        {s.time} {s.available ? '' : '(Booked)'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a date to view availability.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Calendar</CardTitle>
          <CardDescription>Unified view: Hearings (Red), Appointments (Blue), Bookings (Green)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Label htmlFor="week-start">Week start</Label>
            <Input id="week-start" type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="text-red-600">⚖ Hearings</span>
              <span className="text-blue-600">👥 Appointments</span>
              <span className="text-green-600">🏛 Bookings</span>
            </div>
          </div>
          {weekStart ? (
            <div className="grid md:grid-cols-3 gap-4">
              {(() => {
                const start = new Date(weekStart + 'T00:00:00')
                const days = [...Array(7)].map((_, i) => {
                  const d = new Date(start)
                  d.setDate(start.getDate() + i)
                  const yyyy = d.getFullYear()
                  const mm = String(d.getMonth() + 1).padStart(2, '0')
                  const dd = String(d.getDate()).padStart(2, '0')
                  const iso = `${yyyy}-${mm}-${dd}`
                  return { iso, label: d.toDateString() }
                })
                const byDay = days.map((day) => {
                  const items = getUnifiedCalendar().filter((ev) => ev.date === day.iso)
                  return { day, items }
                })
                return byDay.map(({ day, items }) => (
                  <div key={day.iso} className="border rounded p-3">
                    <div className="font-medium mb-2">{day.label}</div>
                    <div className="space-y-2">
                      {items.length ? items.map((ev, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className={ev.color}>{ev.title}</span>
                          <span className="text-muted-foreground">{ev.time || ''}</span>
                          <span className="text-muted-foreground">{ev.extra}</span>
                        </div>
                      )) : (<div className="text-muted-foreground text-sm">No events</div>)}
                    </div>
                  </div>
                ))
              })()}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a week start date to view schedule.</p>
          )}
        </CardContent>
      </Card>

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
                  <select id="courtroom" className="w-full p-2 border border-border rounded-md bg-input" value={bookingForm.courtroom} onChange={(e) => setBookingForm({ ...bookingForm, courtroom: e.target.value })} required>
                    <option value="">Select Courtroom</option>
                    {courtrooms.map((room) => (<option key={room} value={room}>{room}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <select id="client" className="w-full p-2 border border-border rounded-md bg-input" value={bookingForm.clientId} onChange={(e) => setBookingForm({ ...bookingForm, clientId: e.target.value })} required>
                    <option value="">Select Client</option>
                    {clients.map((client) => (<option key={client._id || client.id} value={client._id || client.id}>{client.name}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <select id="time" className="w-full p-2 border border-border rounded-md bg-input" value={bookingForm.time} onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} required>
                    <option value="">Select Time</option>
                    {timeSlots.map((time) => (<option key={time} value={time}>{time}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="case">Case Title</Label>
                <Input id="case" type="text" placeholder="Enter case title" value={bookingForm.case} onChange={(e) => setBookingForm({ ...bookingForm, case: e.target.value })} required />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Book Session</Button>
                <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>Cancel</Button>
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
              const client = users.find((u) => (u._id || u.id) === (booking.clientId?._id || booking.clientId))
              return (
                <div key={booking._id || booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.case}</p>
                    <p className="text-sm text-muted-foreground">Client: {client?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.date} at {booking.time} - {booking.courtroom}</p>
                  </div>
                  <Badge variant="default">{booking.status}</Badge>
                </div>
              )
            })}
            {lawyerBookings.length === 0 && (<p className="text-center text-muted-foreground py-8">No bookings scheduled</p>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Requests</CardTitle>
          <CardDescription>Pending consultations from clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lawyerAppointments.map((a) => (
              <div key={a._id || a.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Consultation request</p>
                  <p className="text-sm text-muted-foreground">{a.date} at {a.time}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === 'confirmed' ? 'default' : 'secondary'}>{a.status}</Badge>
                  {a.status !== 'confirmed' && (
                    <>
                      <Button size="sm" onClick={async () => {
                        const updated = await apiPost(`/appointments/${a._id || a.id}/approve`, {}, token)
                        setAppointments((prev) => prev.map((x) => ( (x._id||x.id) === (updated._id||updated.id) ? updated : x )))
                      }}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        await apiDelete(`/appointments/${a._id || a.id}`, token)
                        setAppointments((prev) => prev.filter((x) => (x._id||x.id) !== (a._id||a.id)))
                      }}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {lawyerAppointments.length === 0 && (<p className="text-center text-muted-foreground py-8">No appointment requests</p>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


