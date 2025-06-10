"use client"

import { useState, useEffect } from "react"

const CORRECT_PASSWORD = "TachyonMotors"
const SESSION_KEY = "showcase-gallery-auth"

export function usePasswordStore() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated in this session
    const sessionAuth = sessionStorage.getItem(SESSION_KEY)
    if (sessionAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const authenticate = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem(SESSION_KEY, "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return {
    isAuthenticated,
    isLoading,
    authenticate,
    logout,
  }
}
