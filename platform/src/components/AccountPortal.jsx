import { useEffect, useState } from 'react'
import {
  defaultAccountPreferences,
  getAccountSession,
  loadAccountPreferences,
  saveAccountPreferences,
  signInAccount,
  signOutAccount,
  signUpAccount,
  subscribeToAccount
} from '../services/accountPreferences'
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

  return 'Não foi possível concluir a operação.'
}

function AccountPortal() {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [preferences, setPreferences] = useState(defaultAccountPreferences)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(configured)
  const userId = session?.user.id || null

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

        if (!currentSession) {
          setPreferences(defaultAccountPreferences)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [configured])

  useEffect(() => {
    if (!userId) {
      return undefined
    }

    let isMounted = true

    loadAccountPreferences(userId)
      .then((storedPreferences) => {
        if (!isMounted) {
          return
        }

        if (storedPreferences) {
          setPreferences(storedPreferences)
          setStatus('Preferências da conta carregadas.')
        } else {
          setStatus('A conta ainda não possui preferências sincronizadas.')
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar preferências:', error)

        if (isMounted) {
          setStatus('Não foi possível carregar as preferências da conta.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [userId])

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
            : 'Conta criada. Confirme o e-mail e depois entre.'
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

  const handlePreferenceChange = (name, value) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [name]: value
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')

    try {
      await saveAccountPreferences(userId, preferences)
      setStatus(
        'Preferências salvas. A extensão poderá recuperá-las pela mesma conta.'
      )
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      setStatus('Não foi possível salvar as preferências.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await signOutAccount()
      setStatus('Conta desconectada.')
    } catch (error) {
      console.error('Erro ao desconectar conta:', error)
      setStatus('Não foi possível desconectar a conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="account-portal" aria-busy={isLoading}>
      {!configured ? (
        <p className="account-note" role="note">
          A conta não está configurada nesta compilação. A plataforma e os
          recursos locais da extensão continuam disponíveis sem autenticação.
        </p>
      ) : isLoading && !session ? (
        <p role="status" aria-atomic="true">Carregando conta...</p>
      ) : session ? (
        <div className="account-session">
          <p>
            Conectado como <strong>{session.user.email}</strong>.
          </p>
          <p>
            As alterações só são enviadas quando você seleciona o botão de
            salvar. A extensão não precisa de conta para funcionar.
          </p>

          <form className="preference-form" onSubmit={handleSave}>
            <label htmlFor="account-theme">
              Tema preferido
              <select
                id="account-theme"
                value={preferences.theme}
                onChange={(event) => {
                  handlePreferenceChange('theme', event.target.value)
                }}
              >
                <option value="system">Seguir o sistema</option>
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="contrast">Alto contraste</option>
              </select>
            </label>

            <label htmlFor="account-text-scale">
              Tamanho do texto
              <select
                id="account-text-scale"
                value={preferences.textScale}
                onChange={(event) => {
                  handlePreferenceChange('textScale', event.target.value)
                }}
              >
                <option value="normal">Padrão</option>
                <option value="large">Grande</option>
                <option value="extra-large">Muito grande</option>
              </select>
            </label>

            <label className="checkbox-label" htmlFor="account-reduce-motion">
              <input
                id="account-reduce-motion"
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(event) => {
                  handlePreferenceChange('reduceMotion', event.target.checked)
                }}
              />
              Reduzir animações e movimentos
            </label>

            <div className="account-actions">
              <button className="primary-action" type="submit" disabled={isLoading}>
                Salvar preferências na conta
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                Sair da conta
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form className="account-form" onSubmit={handleAuthentication}>
          <p>
            Entre para consultar ou alterar as mesmas preferências que podem
            ser recuperadas pela extensão.
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

          <div className="account-actions">
            <button className="primary-action" type="submit" disabled={isLoading}>
              {mode === 'sign-up' ? 'Criar conta' : 'Entrar'}
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setMode((currentMode) => (
                  currentMode === 'sign-in' ? 'sign-up' : 'sign-in'
                ))
                setStatus('')
              }}
            >
              {mode === 'sign-up' ? 'Já tenho conta' : 'Quero criar uma conta'}
            </button>
          </div>
        </form>
      )}

      {status && (
        <p className="account-status" role="status" aria-atomic="true">
          {status}
        </p>
      )}
    </div>
  )
}

export default AccountPortal
