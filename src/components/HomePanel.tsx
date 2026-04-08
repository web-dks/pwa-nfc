type Props = {
  nfcSupported: boolean
  onStartQr: () => void
  onReadTag: () => void
  readInProgress: boolean
}

export function HomePanel({
  nfcSupported,
  onStartQr,
  onReadTag,
  readInProgress,
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
          O fluxo é <strong>em série</strong>: QR → gravação NFC → resultado.
          Depois, volta ao leitor automaticamente em 3s (ou use Concluir). O{' '}
          <strong>✕</strong> no canto superior encerra o ciclo e volta aqui.
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
            disabled={readInProgress}
          >
            {readInProgress ? 'Lendo…' : 'Ler TAG NFC (teste)'}
          </button>
          <p className="home-hint home-hint--small">
            Abre em <strong>tela cheia</strong> com o conteúdo lido e botão
            fechar.
          </p>
        </section>
      )}
    </>
  )
}
