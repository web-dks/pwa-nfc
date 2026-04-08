type Props = {
  uuid: string
  nfcSupported: boolean
  writing: boolean
  onWrite: () => void
  onCancel: () => void
}

export function AwaitingNfcOverlay({
  uuid,
  nfcSupported,
  writing,
  onWrite,
  onCancel,
}: Props) {
  return (
    <div
      className="fs fs--await-nfc"
      role="dialog"
      aria-modal="true"
      aria-label="Aguardando gravação NFC"
    >
      <div className="fs-await__icon" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120" fill="none">
          <circle cx="60" cy="60" r="56" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
          <path
            fill="#78350f"
            d="M60 28c-3.5 0-6.3 2.8-6.3 6.3v34c0 3.5 2.8 6.3 6.3 6.3s6.3-2.8 6.3-6.3v-34c0-3.5-2.8-6.3-6.3-6.3zm0 52a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
          />
        </svg>
      </div>
      <h2 className="fs-await__title">Aguardando NFC</h2>
      <p className="fs-await__lead">
        Aproxime a TAG e toque em gravar. O conteúdo gravado será:
      </p>
      <output className="fs-await__uuid">{uuid}</output>

      {!nfcSupported && (
        <p className="fs-await__warn">
          Este dispositivo ou navegador não suporta Web NFC. Use o Chrome no
          Android com HTTPS.
        </p>
      )}

      <div className="fs-await__actions">
        <button
          type="button"
          className="btn btn--dark btn--xl"
          onClick={onWrite}
          disabled={!nfcSupported || writing}
        >
          {writing ? 'Gravando…' : 'Gravar na TAG NFC'}
        </button>
        <button
          type="button"
          className="btn btn--ghost-dark"
          onClick={onCancel}
          disabled={writing}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
