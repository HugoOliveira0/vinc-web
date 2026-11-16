const severityNames = {
  error: 'Problema',
  warning: 'Aviso'
}

function AccessibilityAuditPanel({ audit, onLocate }) {
  if (!audit) {
    return null
  }

  return (
    <section
      className="accessibility-audit"
      aria-labelledby="accessibility-audit-title"
    >
      <div className="accessibility-audit-heading">
        <div>
          <p className="audit-label">Análise local</p>
          <h2 id="accessibility-audit-title">
            Auditoria de acessibilidade
          </h2>
        </div>

        <span className="audit-badge" aria-hidden="true">A11Y</span>
      </div>

      <p className="audit-note">
        Triagem automática baseada na estrutura visível da página. Ela ajuda a
        encontrar barreiras comuns, mas não substitui uma avaliação manual.
      </p>

      <ul className="audit-summary" aria-label="Resumo da auditoria">
        <li>
          <strong>{audit.errorCount}</strong>
          <span>Problemas</span>
        </li>
        <li>
          <strong>{audit.warningCount}</strong>
          <span>Avisos</span>
        </li>
        <li>
          <strong>{audit.passedChecks}/{audit.totalChecks}</strong>
          <span>Verificações aprovadas</span>
        </li>
      </ul>

      {audit.issues.length === 0 ? (
        <p className="audit-success" role="status">
          Nenhuma barreira foi encontrada nesta triagem automática.
        </p>
      ) : (
        <ol className="audit-issue-list">
          {audit.issues.map((issue) => (
            <li
              className={`audit-issue audit-issue-${issue.severity}`}
              key={issue.id}
            >
              <div>
                <span className="audit-severity">
                  {severityNames[issue.severity]}
                </span>
                <strong>{issue.title}</strong>
                <p>{issue.description}</p>
              </div>

              {issue.element && (
                <button
                  type="button"
                  onClick={() => onLocate(issue.element)}
                >
                  Localizar
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default AccessibilityAuditPanel
