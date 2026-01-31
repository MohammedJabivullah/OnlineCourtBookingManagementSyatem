import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Calendar, Clock, Gavel, Plus } from "lucide-react"
import { useAppState } from "../state/AppState"
import { apiGet, apiPost } from "../lib/api"

export default function Client() {
  const { token, currentUser, users, bookings, setBookings, appointments, setAppointments, sendSms, sendEmail, getUnifiedCalendar } = useAppState()
  const [appointmentForm, setAppointmentForm] = useState({ lawyerId: "", date: "", time: "", description: "" })
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [availabilityDate, setAvailabilityDate] = useState("")
  const [lawyerAvailability, setLawyerAvailability] = useState([])
  const [selectedSlot, setSelectedSlot] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!availabilityDate || !appointmentForm.lawyerId) return
      const data = await apiGet(`/appointments/availability?lawyerId=${appointmentForm.lawyerId}&date=${availabilityDate}`)
      setLawyerAvailability(data.slots || [])
      setSelectedSlot("")
    }
    load()
  }, [availabilityDate, appointmentForm.lawyerId])

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const list = await apiGet('/appointments', token)
        setAppointments(list)
      } catch (e) {
        // ignore for client if unauthorized
      }
    }
    loadAppointments()
  }, [])

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const list = await apiGet('/bookings', token)
        setBookings(list)
      } catch (e) {
        // ignore
      }
    }
    loadBookings()
  }, [])

  const handleAppointment = async (e) => {
    e.preventDefault()
    if (!appointmentForm.lawyerId || !availabilityDate || !selectedSlot) {
      alert('Please select a lawyer, date and time slot')
      return
    }
    const payload = {
      clientId: currentUser.id,
      lawyerId: appointmentForm.lawyerId,
      date: availabilityDate,
      time: selectedSlot,
      description: appointmentForm.description,
    }
    const created = await apiPost('/appointments', payload, token)
    setAppointments([...appointments, created])
    setAppointmentForm({ lawyerId: "", date: "", time: "", description: "" })
    setSelectedSlot("")
    setShowAppointmentForm(false)
    alert(`Appointment request sent for ${created.date} at ${created.time}`)
    sendSms("CLIENT", `Appointment requested for ${created.date} ${created.time}`)
    sendEmail("lawyer@example.com", "New Appointment Request", JSON.stringify(created))
  }

  const [lawyers, setLawyers] = useState([])

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        const list = await apiGet('/lawyers')
        setLawyers(list)
      } catch (e) {
        console.error('Failed to load lawyers', e)
      }
    }
    loadLawyers()
  }, [])
  const clientBookings = bookings.filter((b) => (b.clientId?._id || b.clientId) === currentUser.id)
  const clientAppointments = appointments.filter((a) => (a.clientId?._id || a.clientId) === currentUser.id)

  const nextBooking = (() => {
    const toDate = (d, t) => new Date(`${d} ${t}`)
    const future = clientBookings.filter((b) => toDate(b.date, b.time) >= new Date())
    future.sort((a,b) => toDate(a.date,a.time) - toDate(b.date,b.time))
    return future[0]
  })()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Client Dashboard</h2>
          <p className="text-muted-foreground">Manage your appointments and court hearings</p>
        </div>
        <Button onClick={() => setShowAppointmentForm(!showAppointmentForm)}><Plus className="h-4 w-4 mr-2" />Book Appointment</Button>
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
                  <select id="lawyer" className="w-full p-2 border border-border rounded-md bg-input" value={appointmentForm.lawyerId} onChange={(e) => setAppointmentForm({ ...appointmentForm, lawyerId: e.target.value })} required>
                    <option value="">Choose a lawyer</option>
                    {lawyers.map((lawyer) => (<option key={lawyer._id || lawyer.id} value={(lawyer._id || lawyer.id)}>{lawyer.name} - {lawyer.specialization}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input id="date" type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Available Slots</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lawyerAvailability.length > 0 ? lawyerAvailability.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.time)}
                      className={`px-3 py-1 rounded border text-sm ${!s.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : selectedSlot === s.time ? 'bg-blue-600 text-white' : 'bg-blue-50 hover:bg-blue-100'}`}
                    >
                      {s.time} {s.available ? '' : '(Booked)'}
                    </button>
                  )) : (
                    <span className="text-sm text-muted-foreground">Select lawyer and date to view availability</span>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Case Description</Label>
                <textarea id="description" className="w-full p-2 border border-border rounded-md bg-input min-h-[100px]" placeholder="Briefly describe your legal matter" value={appointmentForm.description} onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })} required />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Book Appointment</Button>
                <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)}>Cancel</Button>
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
            {nextBooking ? (
              <>
                <div className="text-2xl font-bold">{nextBooking.date}</div>
                <p className="text-xs text-muted-foreground">{nextBooking.time} • {nextBooking.courtroom}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No upcoming hearings</p>
            )}
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
                  <div key={booking._id || booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.case}</p>
                      <p className="text-sm text-muted-foreground">Lawyer: {lawyer?.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.date} at {booking.time} - {booking.courtroom}</p>
                    </div>
                    <Badge variant="default">{booking.status}</Badge>
                  </div>
                )
              })}
              {clientBookings.length === 0 && (<p className="text-center text-muted-foreground py-8">No hearings scheduled</p>)}
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
                  <div key={appointment._id || appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Consultation with {lawyer?.name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time}</p>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                )
              })}
              {clientAppointments.length === 0 && (<p className="text-center text-muted-foreground py-8">No appointments scheduled</p>)}
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


