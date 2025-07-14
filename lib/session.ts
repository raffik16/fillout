import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'drink_wizard_session'

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return uuidv4()
  }

  let sessionId = localStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}