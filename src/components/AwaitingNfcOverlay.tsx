type Props = {
  uuid: string
  writing: boolean
  /** X: encerra o ciclo e volta ao início. */
  onExit: () => void
}

export function AwaitingNfcOverlay({ uuid, writing, onExit }: Props) {
  return (
    <div
      className="fs fs--await-nfc"
      role="dialog"
      aria-modal="true"
      aria-label="Aguardando gravação NFC"
    >
      <header className="fs-await__bar">
        <span className="fs-await__bar-title">Aguardando NFC</span>
        <button
          type="button"
          className="fs-await__close"
          onClick={onExit}
          disabled={writing}
          aria-label="Sair do fluxo e voltar ao início"
        >
          ✕
        </button>
      </header>

      <div className="fs-await__body">
        <div className="fs-await__icon" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="120" height="120" fill="none">
            <circle cx="60" cy="60" r="56" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
            <path
              fill="#78350f"
              d="M60 28c-3.5 0-6.3 2.8-6.3 6.3v34c0 3.5 2.8 6.3 6.3 6.3s6.3-2.8 6.3-6.3v-34c0-3.5-2.8-6.3-6.3-6.3zm0 52a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
            />
          </svg>
        </div>
        <p className="fs-await__lead">
          {writing
            ? 'Aproxime a TAG ao celular para gravar…'
            : 'Preparando gravação…'}
        </p>
        <output className="fs-await__uuid">{uuid}</output>
        <p className="fs-await__hint">Conteúdo que será gravado na tag</p>
      </div>
    </div>
  )
}
