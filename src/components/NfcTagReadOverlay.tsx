type Props = {
  loading: boolean
  text: string | null
  serial: string | null
  error: string | null
  onClose: () => void
}

export function NfcTagReadOverlay({
  loading,
  text,
  serial,
  error,
  onClose,
}: Props) {
  return (
    <div
      className="fs fs--tag-read"
      role="dialog"
      aria-modal="true"
      aria-label="Leitura da TAG NFC"
    >
      <header className="fs-tag-read__bar">
        <span className="fs-tag-read__title">Leitura da TAG NFC</span>
        <button
          type="button"
          className="fs-tag-read__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
      </header>

      <div className="fs-tag-read__body">
        {loading && (
          <div className="fs-tag-read__loading">
            <p className="fs-tag-read__lead">Aproxime a TAG NFC ao celular…</p>
            <div className="fs-tag-read__spinner" aria-hidden="true" />
          </div>
        )}

        {!loading && error && (
          <div className="fs-tag-read__panel fs-tag-read__panel--err">
            <p className="fs-tag-read__err-title">Não foi possível ler</p>
            <p className="fs-tag-read__err-msg">{error}</p>
          </div>
        )}

        {!loading && !error && text !== null && (
          <div className="fs-tag-read__panel">
            <p className="fs-tag-read__label">Conteúdo (NDEF texto)</p>
            <output className="fs-tag-read__value">{text}</output>
            {serial && (
              <p className="fs-tag-read__serial">
                <span className="fs-tag-read__serial-label">Serial da tag</span>
                <span className="fs-tag-read__serial-value">{serial}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <footer className="fs-tag-read__footer">
          <button type="button" className="btn btn--primary btn--xl" onClick={onClose}>
            Fechar
          </button>
        </footer>
      )}
    </div>
  )
}
