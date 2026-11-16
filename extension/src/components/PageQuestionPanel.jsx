const elementTypeNames = {
  heading: 'Título',
  link: 'Link',
  button: 'Botão',
  field: 'Campo',
  image: 'Imagem'
}

function PageQuestionPanel({
  configured,
  question,
  history,
  loading,
  listening,
  speechSupported,
  isSpeaking,
  onQuestionChange,
  onSubmit,
  onVoice,
  onRead,
  onLocate
}) {
  const latestAnswer = history.at(-1)

  return (
    <section className="page-question" aria-labelledby="page-question-title">
      <div className="page-question-heading">
        <div>
          <p className="ai-label">Inteligência artificial</p>
          <h2 id="page-question-title">Pergunte sobre esta página</h2>
        </div>

        <span className="ai-badge">IA</span>
      </div>

      <p id="page-question-description" className="page-question-note">
        Pergunte sobre o conteúdo ou sobre títulos, links, botões, campos e
        imagens encontrados. A resposta usa somente os dados desta página.
      </p>

      <form className="page-question-form" onSubmit={onSubmit}>
        <label htmlFor="page-question-input">Pergunta</label>
        <textarea
          id="page-question-input"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ex.: para que serve o botão 2?"
          aria-describedby="page-question-description"
          maxLength={300}
          rows={3}
          disabled={loading || !configured}
        />

        <div className="page-question-actions">
          <button
            className="ai-generate-button"
            type="submit"
            disabled={loading || !configured || !question.trim()}
          >
            {loading ? 'Buscando resposta...' : 'Perguntar à IA'}
          </button>

          {speechSupported && (
            <button
              className={`voice-command-button${
                listening ? ' is-listening' : ''
              }`}
              type="button"
              onClick={onVoice}
              aria-pressed={listening}
              disabled={loading || !configured}
            >
              {listening ? 'Parar escuta' : 'Falar pergunta'}
            </button>
          )}
        </div>
      </form>

      {loading && (
        <p className="ai-loading" role="status">
          Consultando o conteúdo visível da página...
        </p>
      )}

      {history.length > 0 && (
        <div className="page-question-history" aria-live="polite">
          <h3>Respostas desta página</h3>

          {history.map((entry, entryIndex) => (
            <article
              className="page-question-answer"
              key={`${entry.question}-${entryIndex}`}
            >
              <h4>{entry.question}</h4>
              <p>{entry.answer}</p>

              {entry.referencedElements.length > 0 && (
                <div className="page-question-references">
                  <strong>Elementos mencionados:</strong>
                  <ul>
                    {entry.referencedElements.map((element) => (
                      <li key={`${element.type}-${element.index}`}>
                        <button
                          type="button"
                          onClick={() => onLocate(element)}
                        >
                          {elementTypeNames[element.type]} {element.index}: {' '}
                          {element.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}

          <button
            className="ai-read-button"
            type="button"
            onClick={() => onRead(latestAnswer)}
            disabled={isSpeaking}
          >
            Ouvir resposta mais recente
          </button>
        </div>
      )}
    </section>
  )
}

export default PageQuestionPanel
