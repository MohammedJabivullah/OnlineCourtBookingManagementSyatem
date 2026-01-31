import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiGet } from "../lib/api"

export const courtrooms = ["Courtroom A", "Courtroom B", "Courtroom C", "Courtroom D"]
export const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth') || 'null') : null
  const [currentUser, setCurrentUser] = useState(stored?.user || null)
  const [token, setToken] = useState(stored?.token || null)
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [appointments, setAppointments] = useState([])
  const [cases, setCases] = useState([])

  const sendSms = (to, message) => {
    console.log("SMS ->", to, message)
  }
  const sendEmail = (to, subject, body) => {
    console.log("EMAIL ->", to, subject, body)
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const lawyers = await apiGet('/lawyers')
        let combined = [...lawyers]
        if (token && (currentUser?.role === 'admin' || currentUser?.role === 'lawyer')) {
          try {
            const clients = await apiGet('/clients', token)
            combined = [...combined, ...clients]
          } catch {}
        }
        // Ensure current user is present for name lookups
        if (currentUser && !combined.find(u => (u._id || u.id) === currentUser.id)) {
          combined.push({ _id: currentUser.id, id: currentUser.id, name: currentUser.name, role: currentUser.role })
        }
        setUsers(combined)
      } catch {}
    }
    loadUsers()
  }, [token, currentUser?.role])

  const getUnifiedCalendar = () => {
    const normalizeId = (v) => (v && typeof v === 'object' && v._id) ? v._id : v
    const findName = (id) => {
      const user = users.find(u => (u._id || u.id) === id)
      return user?.name || id
    }
    const hearingEvents = bookings.map((b) => ({ type: "hearing", color: "text-red-600", title: b.case || 'Hearing', date: b.date, time: b.time, extra: `${b.courtroom} • ${b.status}` }))
    const appointmentEvents = appointments.map((a) => {
      const clientName = findName(normalizeId(a.clientId))
      const lawyerName = findName(normalizeId(a.lawyerId))
      return { type: "appointment", color: "text-blue-600", title: "Client Appointment", date: a.date, time: a.time, extra: `${clientName} ↔ ${lawyerName} • ${a.status}` }
    })
    const caseEvents = cases.map((c) => ({ type: "case", color: "text-red-600", title: c.title || c.caseId || 'Case', date: c.date, time: "", extra: `${c.court}` }))
    return [...hearingEvents, ...appointmentEvents, ...caseEvents]
  }

  const value = useMemo(
    () => ({
      // state
      currentUser, setCurrentUser: (u) => {
        setCurrentUser(u)
        const next = u ? { user: u, token } : null
        localStorage.setItem('auth', JSON.stringify(next))
      },
      token, setToken: (t) => {
        setToken(t)
        const next = currentUser ? { user: currentUser, token: t } : null
        localStorage.setItem('auth', JSON.stringify(next))
      },
      users, setUsers,
      bookings, setBookings,
      appointments, setAppointments,
      cases, setCases,
      // utils
      sendSms, sendEmail, getUnifiedCalendar,
    }),
    [currentUser, token, users, bookings, appointments, cases]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider")
  return ctx
}


