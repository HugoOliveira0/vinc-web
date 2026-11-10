function ResultSection({
  id,
  title,
  items,
  emptyMessage,
  visibleCount,
  onShowMore,
  renderItem
}) {
  const visibleItems = items.slice(0, visibleCount)
  const remainingCount = items.length - visibleItems.length

  return (
    <section className="result-section" aria-labelledby={id}>
      <h3 id={id}>
        {title}
        <span className="result-count" aria-label={`${items.length} itens`}>
          {items.length}
        </span>
      </h3>

      {items.length > 0 ? (
        <>
          <ol id={`${id}-list`} className="result-list">
            {visibleItems.map((item) => (
              <li key={item.id}>{renderItem(item)}</li>
            ))}
          </ol>

          {remainingCount > 0 && (
            <button
              className="show-more-button"
              type="button"
              onClick={onShowMore}
              aria-controls={`${id}-list`}
            >
              Mostrar mais ({remainingCount})
            </button>
          )}
        </>
      ) : (
        <p className="empty-result">{emptyMessage}</p>
      )}
    </section>
  )
}

export default ResultSection
