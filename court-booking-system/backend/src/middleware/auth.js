import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: "Unauthorized" })
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret")
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" })
    next()
  }
}


