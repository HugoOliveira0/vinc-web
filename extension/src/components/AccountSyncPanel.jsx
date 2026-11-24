import { useEffect, useState } from 'react'
import {
  getAccountSession,
  loadSyncedPreferences,
  saveSyncedPreferences,
  signInAccount,
  signOutAccount,
  signUpAccount,
  subscribeToAccount
} from '../services/preferenceSync'
import { isSupabaseConfigured } from '../services/supabaseClient'

const getAccountErrorMessage = (error) => {
  const message = error?.message?.toLowerCase() || ''

  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }

  if (message.includes('email not confirmed')) {
    return 'Confirme o e-mail da conta antes de entrar.'
  }

  if (message.includes('password should be')) {
    return 'A senha deve possuir pelo menos seis caracteres.'
  }

  return 'Não foi possível concluir a operação da conta.'
}

function AccountSyncPanel({ preferences, onApplyPreferences }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(configured)

  useEffect(() => {
    if (!configured) {
      return undefined
    }

    let isMounted = true

    getAccountSession()
      .then((currentSession) => {
        if (isMounted) {
          setSession(currentSession)
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar sessão:', error)

        if (isMounted) {
          setStatus('Não foi possível carregar a conta.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    const unsubscribe = subscribeToAccount((currentSession) => {
      if (isMounted) {
        setSession(currentSession)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [configured])

  const handleAuthentication = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')

    try {
      if (mode === 'sign-up') {
        const result = await signUpAccount({ email, password })

        setStatus(
          result.session
            ? 'Conta criada e conectada.'
            : 'Conta criada. Confirme o e-mail e depois entre na extensão.'
        )
      } else {
        await signInAccount({ email, password })
        setStatus('Conta conectada.')
      }

      setPassword('')
    } catch (error) {
      console.error('Erro de autenticação:', error)
      setStatus(getAccountErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setStatus('')

    try {
      await saveSyncedPreferences(session.user.id, preferences)
      setStatus('Preferências enviadas para a conta.')
    } catch (error) {
      console.error('Erro ao sincronizar preferências:', error)
      setStatus('Não foi possível sincronizar as preferências.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoad = async () => {
    setIsLoading(true)
    setStatus('')

    try {
      const syncedPreferences = await loadSyncedPreferences(session.user.id)

      if (!syncedPreferences) {
        setStatus('Esta conta ainda não possui preferências salvas.')
        return
      }

      await onApplyPreferences(syncedPreferences)
      setStatus('Preferências da conta aplicadas neste navegador.')
    } catch (error) {
      console.error('Erro ao recuperar preferências:', error)
      setStatus('Não foi possível recuperar as preferências.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await signOutAccount()
      setStatus('Conta desconectada. As preferências locais foram mantidas.')
    } catch (error) {
      console.error('Erro ao desconectar conta:', error)
      setStatus('Não foi possível desconectar a conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <details className="account-sync" aria-busy={isLoading}>
      <summary>Conta e sincronização opcional</summary>

      <div className="account-sync-content">
        {!configured ? (
          <p>
            A sincronização não está configurada nesta compilação. Os
            recursos locais continuam disponíveis normalmente.
          </p>
        ) : isLoading && !session ? (
          <p role="status" aria-atomic="true">Carregando conta...</p>
        ) : session ? (
          <div className="account-session">
            <p>
              Conectado como <strong>{session.user.email}</strong>.
            </p>

            <p>
              A sincronização acontece somente quando você escolhe enviar ou
              recuperar as preferências.
            </p>

            <div className="account-sync-actions">
              <button type="button" onClick={handleSave} disabled={isLoading}>
                Enviar preferências atuais
              </button>
              <button type="button" onClick={handleLoad} disabled={isLoading}>
                Usar preferências da conta
              </button>
              <button type="button" onClick={handleSignOut} disabled={isLoading}>
                Sair da conta
              </button>
            </div>
          </div>
        ) : (
          <form className="account-form" onSubmit={handleAuthentication}>
            <p>
              A conta é opcional. Sem entrar, todas as funções locais da
              extensão continuam disponíveis.
            </p>

            <label htmlFor="account-email">
              E-mail
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label htmlFor="account-password">
              Senha
              <input
                id="account-password"
                type="password"
                aria-describedby="account-password-description"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <p id="account-password-description" className="field-hint">
              Use pelo menos seis caracteres.
            </p>

            <button type="submit" disabled={isLoading}>
              {mode === 'sign-up' ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              className="account-mode-button"
              type="button"
              onClick={() => {
                setMode((currentMode) => (
                  currentMode === 'sign-in' ? 'sign-up' : 'sign-in'
                ))
                setStatus('')
              }}
            >
              {mode === 'sign-up'
                ? 'Já tenho conta'
                : 'Quero criar uma conta'}
            </button>
          </form>
        )}

        {status && (
          <p className="account-status" role="status" aria-atomic="true">
            {status}
          </p>
        )}
      </div>
    </details>
  )
}

export default AccountSyncPanel
