const elementTypeNames = {
  heading: 'Título',
  link: 'Link',
  button: 'Botão',
  field: 'Campo',
  image: 'Imagem'
}

function AISummaryPanel({
  configured,
  loading,
  result,
  onGenerate,
  onRead,
  onLocate,
  isSpeaking
}) {
  return (
    <section className="ai-summary" aria-labelledby="ai-summary-title">
      <div className="ai-summary-heading">
        <div>
          <p className="ai-label">Inteligência artificial</p>
          <h2 id="ai-summary-title">Resumo contextual</h2>
        </div>

        <span className="ai-badge" aria-hidden="true">IA</span>
      </div>

      <p className="ai-privacy-note">
        O texto visível da página será enviado ao serviço de IA somente
        quando você solicitar. Valores de formulários não são coletados.
      </p>

      {!configured && (
        <p className="ai-configuration-note" role="note">
          Configure o endereço e a chave pública do serviço para habilitar
          este recurso.
        </p>
      )}

      <button
        className="ai-generate-button"
        type="button"
        onClick={onGenerate}
        disabled={loading || !configured}
      >
        {loading ? 'Gerando resumo...' : 'Gerar resumo com IA'}
      </button>

      {loading && (
        <p className="ai-loading" role="status">
          Analisando o conteúdo e os principais elementos da página...
        </p>
      )}

      {result && (
        <div className="ai-result">
          <h3>Sobre a página</h3>
          <p>{result.summary}</p>

          {result.keyElements.length > 0 && (
            <>
              <h3>Elementos principais</h3>
              <ol className="ai-element-list">
                {result.keyElements.map((element) => (
                  <li key={`${element.type}-${element.index}`}>
                    <button
                      type="button"
                      onClick={() => onLocate(element)}
                    >
                      <strong>
                        {elementTypeNames[element.type]} {element.index}:
                      </strong>{' '}
                      {element.label}
                      <span>{element.reason}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}

          <button
            className="ai-read-button"
            type="button"
            onClick={onRead}
            disabled={isSpeaking}
          >
            Ouvir resumo da IA
          </button>
        </div>
      )}
    </section>
  )
}

export default AISummaryPanel

