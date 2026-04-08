type Props = {
  elementId: string
  showPreview: boolean
  isScanning: boolean
  uuidDisplay: string | null
  onToggleScan: () => void
  scanDisabled?: boolean
}

export function QrSection({
  elementId,
  showPreview,
  isScanning,
  uuidDisplay,
  onToggleScan,
  scanDisabled,
}: Props) {
  return (
    <section className="section" aria-labelledby="qr-heading">
      <h2 id="qr-heading" className="section__title">
        QR Code
      </h2>
      <button
        type="button"
        className="btn btn--primary"
        onClick={onToggleScan}
        disabled={scanDisabled}
      >
        {isScanning ? 'Parar leitura' : 'Ler QR Code'}
      </button>

      <div
        id={elementId}
        className={
          showPreview ? 'qr-preview qr-preview--visible' : 'qr-preview'
        }
        aria-hidden={!showPreview}
      />

      <div className="field">
        <label className="field__label" htmlFor="uuid-field">
          Conteúdo que será gravado na tag
        </label>
        <output id="uuid-field" className="field__uuid">
          {uuidDisplay ?? '—'}
        </output>
      </div>
    </section>
  )
}
