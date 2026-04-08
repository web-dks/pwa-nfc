type Props = {
  nfcSupported: boolean
  onStartQr: () => void
  onReadTag: () => void
  reading: boolean
  lastReadText: string | null
  lastReadSerial: string | null
}

export function HomePanel({
  nfcSupported,
  onStartQr,
  onReadTag,
  reading,
  lastReadText,
  lastReadSerial,
}: Props) {
  return (
    <>
      <section className="section" aria-labelledby="start-heading">
        <h2 id="start-heading" className="section__title">
          Início
        </h2>
        <button
          type="button"
          className="btn btn--primary btn--xl"
          onClick={onStartQr}
        >
          Ler QR Code
        </button>
        <p className="home-hint">
          A leitura abre em <strong>tela cheia</strong>. Depois do UUID
          válido, siga para gravar na TAG NFC.
        </p>
      </section>

      {nfcSupported && (
        <section className="section section--compact" aria-labelledby="test-heading">
          <h2 id="test-heading" className="section__title">
            Teste
          </h2>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onReadTag}
            disabled={reading}
          >
            {reading ? 'Lendo…' : 'Ler TAG NFC (teste)'}
          </button>
        </section>
      )}

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
    </>
  )
}
