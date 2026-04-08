type Props = {
  variant: 'success' | 'error'
  uuid: string | null
  errorMessage: string | null
  onDone: () => void
}

export function ResultOverlay({
  variant,
  uuid,
  errorMessage,
  onDone,
}: Props) {
  const ok = variant === 'success'

  return (
    <div
      className={ok ? 'fs fs--result fs--result-ok' : 'fs fs--result fs--result-err'}
      role="dialog"
      aria-modal="true"
      aria-label={ok ? 'Gravação concluída' : 'Erro na gravação'}
    >
      <div className="fs-result__icon" aria-hidden="true">
        {ok ? (
          <svg viewBox="0 0 120 120" width="120" height="120" fill="none">
            <circle cx="60" cy="60" r="56" fill="#10b981" stroke="#047857" strokeWidth="4" />
            <path
              d="M38 62l14 14 30-36"
              stroke="#fff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 120 120" width="120" height="120" fill="none">
            <circle cx="60" cy="60" r="56" fill="#ef4444" stroke="#b91c1c" strokeWidth="4" />
            <path
              d="M44 44l32 32M76 44L44 76"
              stroke="#fff"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <h2 className="fs-result__title">
        {ok ? 'Gravação concluída' : 'Erro ao gravar'}
      </h2>
      {ok && uuid && (
        <p className="fs-result__uuid">
          <span className="fs-result__uuid-label">UUID gravado</span>
          <span className="fs-result__uuid-value">{uuid}</span>
        </p>
      )}
      {!ok && errorMessage && (
        <p className="fs-result__err-text">{errorMessage}</p>
      )}
      <button type="button" className="btn btn--xl btn--on-result" onClick={onDone}>
        Concluir
      </button>
    </div>
  )
}
