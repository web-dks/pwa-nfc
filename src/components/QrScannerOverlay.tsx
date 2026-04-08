type Props = {
  elementId: string
  onClose: () => void
  bannerMessage: string | null
  bannerVariant?: 'error' | 'info'
}

export function QrScannerOverlay({
  elementId,
  onClose,
  bannerMessage,
  bannerVariant = 'error',
}: Props) {
  return (
    <div className="fs fs--qr" role="dialog" aria-modal="true" aria-label="Leitura de QR Code">
      <header className="fs-qr__bar">
        <span className="fs-qr__title">Ler QR Code</span>
        <button
          type="button"
          className="fs-qr__close"
          onClick={onClose}
          aria-label="Fechar leitor"
        >
          ✕
        </button>
      </header>
      {bannerMessage && (
        <div
          className={
            bannerVariant === 'error'
              ? 'fs-qr__banner fs-qr__banner--error'
              : 'fs-qr__banner fs-qr__banner--info'
          }
          role="alert"
        >
          {bannerMessage}
        </div>
      )}
      <div id={elementId} className="fs-qr__viewport" />
    </div>
  )
}
