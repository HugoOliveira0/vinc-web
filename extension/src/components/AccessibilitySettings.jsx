function AccessibilitySettings({ preferences, onChange, onReset }) {
  return (
    <details className="accessibility-settings">
      <summary>Preferências de acessibilidade</summary>

      <div className="settings-content">
        <label className="setting-field" htmlFor="theme-preference">
          <span>Tema da interface</span>

          <select
            id="theme-preference"
            value={preferences.theme}
            onChange={(event) => onChange('theme', event.target.value)}
          >
            <option value="system">Usar tema do sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="contrast">Alto contraste</option>
          </select>
        </label>

        <label className="setting-field" htmlFor="text-scale-preference">
          <span>Tamanho do texto</span>

          <select
            id="text-scale-preference"
            value={preferences.textScale}
            onChange={(event) => onChange('textScale', event.target.value)}
          >
            <option value="normal">Padrão</option>
            <option value="large">Grande</option>
            <option value="extra-large">Muito grande</option>
          </select>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={preferences.reduceMotion}
            onChange={(event) => {
              onChange('reduceMotion', event.target.checked)
            }}
          />

          <span>Reduzir animações e transições</span>
        </label>

        <button
          className="reset-settings-button"
          type="button"
          onClick={onReset}
        >
          Restaurar preferências
        </button>
      </div>
    </details>
  )
}

export default AccessibilitySettings
