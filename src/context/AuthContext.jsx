import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { supabase } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let isMounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession)
        setIsLoading(false)
        setSessionError('')
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (error) {
        setSessionError(error.message)
      } else {
        setSession(data.session)
      }
      setIsLoading(false)
    }).catch(error => {
      if (!isMounted) return
      setSessionError(error instanceof Error
        ? error.message
        : 'Your saved session could not be restored.')
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    sessionError,
    signOut
  }), [session, isLoading, sessionError, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
