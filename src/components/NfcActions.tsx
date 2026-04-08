type Props = {
  nfcSupported: boolean
  canWrite: boolean
  writing: boolean
  reading: boolean
  onWrite: () => void
  onRead: () => void
  lastReadText: string | null
  lastReadSerial: string | null
}

export function NfcActions({
  nfcSupported,
  canWrite,
  writing,
  reading,
  onWrite,
  onRead,
  lastReadText,
  lastReadSerial,
}: Props) {
  return (
    <section className="section" aria-labelledby="nfc-heading">
      <h2 id="nfc-heading" className="section__title">
        TAG NFC
      </h2>

      {!nfcSupported && (
        <p className="hint hint--warn">
          Este navegador não suporta Web NFC. Use o{' '}
          <strong>Chrome no Android</strong> com HTTPS (ou localhost) e NFC
          ativado.
        </p>
      )}

      <div className="btn-row">
        <button
          type="button"
          className="btn btn--accent"
          onClick={onWrite}
          disabled={!nfcSupported || !canWrite || writing || reading}
        >
          {writing ? 'Gravando…' : 'Gravar na TAG NFC'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onRead}
          disabled={!nfcSupported || writing || reading}
        >
          {reading ? 'Lendo…' : 'Ler TAG NFC'}
        </button>
      </div>

      {(lastReadText !== null || lastReadSerial !== null) && (
        <div className="readout">
          <p className="readout__label">Última leitura (teste)</p>
          <p className="readout__value">{lastReadText ?? '—'}</p>
          {lastReadSerial && (
            <p className="readout__meta">
              <span className="readout__meta-label">Serial:</span>{' '}
              {lastReadSerial}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
