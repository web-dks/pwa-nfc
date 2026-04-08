import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { AwaitingNfcOverlay } from './components/AwaitingNfcOverlay'
import { HomePanel } from './components/HomePanel'
import { QrScannerOverlay } from './components/QrScannerOverlay'
import { ResultOverlay } from './components/ResultOverlay'
import { useNfc } from './hooks/useNfc'
import { useQrScanner } from './hooks/useQrScanner'
import { isValidUuid, normalizeUuid } from './utils/uuid'

const QR_FULLSCREEN_ID = 'qr-reader-fullscreen'

type UiPhase =
  | 'home'
  | 'qr-fullscreen'
  | 'awaiting-nfc'
  | 'result-success'
  | 'result-error'

export default function App() {
  const { start, stop } = useQrScanner(QR_FULLSCREEN_ID)
  const { supported: nfcSupported, write, read } = useNfc()

  const [phase, setPhase] = useState<UiPhase>('home')
  const [uuid, setUuid] = useState<string | null>(null)
  const [qrBanner, setQrBanner] = useState<string | null>(null)
  const [writing, setWriting] = useState(false)
  const [reading, setReading] = useState(false)
  const [lastReadText, setLastReadText] = useState<string | null>(null)
  const [lastReadSerial, setLastReadSerial] = useState<string | null>(null)
  const [writeError, setWriteError] = useState<string | null>(null)

  const onDecodedRef = useRef<(text: string) => void>(() => {})

  const onDecoded = useCallback(
    (raw: string) => {
      const normalized = normalizeUuid(raw)
      if (isValidUuid(normalized)) {
        setUuid(normalized)
        setQrBanner(null)
        void (async () => {
          await stop()
          setPhase('awaiting-nfc')
        })()
      } else {
        setQrBanner('Conteúdo inválido: não é um UUID.')
      }
    },
    [stop],
  )

  onDecodedRef.current = onDecoded

  useEffect(() => {
    if (phase !== 'qr-fullscreen') return
    let cancelled = false
    setQrBanner(null)

    const run = async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
      try {
        await start((text) => onDecodedRef.current(text))
      } catch (e) {
        if (!cancelled) {
          setPhase('home')
          setQrBanner(
            e instanceof Error ? e.message : 'Não foi possível abrir a câmera.',
          )
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      void stop()
    }
  }, [phase, start, stop])

  const closeQrFullscreen = useCallback(async () => {
    await stop()
    setPhase('home')
    setQrBanner(null)
  }, [stop])

  const openQrFullscreen = useCallback(() => {
    setQrBanner(null)
    setPhase('qr-fullscreen')
  }, [])

  const handleWrite = useCallback(async () => {
    if (!uuid || !isValidUuid(uuid)) return
    setWriting(true)
    setWriteError(null)
    try {
      await write(uuid)
      setPhase('result-success')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setWriteError(msg)
      setPhase('result-error')
    } finally {
      setWriting(false)
    }
  }, [uuid, write])

  const handleRead = useCallback(async () => {
    setReading(true)
    setLastReadText(null)
    setLastReadSerial(null)
    try {
      const result = await read()
      setLastReadText(result.text || '(vazio)')
      setLastReadSerial(result.serialNumber ?? null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao ler NFC'
      setLastReadText(`Erro: ${msg}`)
    } finally {
      setReading(false)
    }
  }, [read])

  const cancelAwaitingNfc = useCallback(() => {
    setUuid(null)
    setPhase('home')
  }, [])

  const finishResult = useCallback(() => {
    setUuid(null)
    setWriteError(null)
    setQrBanner(null)
    setPhase('home')
  }, [])

  return (
    <div className="app">
      {phase === 'home' && (
        <>
          <header className="header">
            <h1 className="header__title">Gravar UUID em TAG NFC</h1>
            <p className="header__subtitle">Ferramenta interna de teste</p>
          </header>

          <main className="card">
            <HomePanel
              nfcSupported={nfcSupported}
              onStartQr={openQrFullscreen}
              onReadTag={() => void handleRead()}
              reading={reading}
              lastReadText={lastReadText}
              lastReadSerial={lastReadSerial}
            />
            {qrBanner && (
              <p className="home-banner home-banner--error" role="alert">
                {qrBanner}
              </p>
            )}
          </main>
        </>
      )}

      {phase === 'qr-fullscreen' && (
        <QrScannerOverlay
          elementId={QR_FULLSCREEN_ID}
          onClose={() => void closeQrFullscreen()}
          bannerMessage={qrBanner}
          bannerVariant="error"
        />
      )}

      {phase === 'awaiting-nfc' && uuid && (
        <AwaitingNfcOverlay
          uuid={uuid}
          nfcSupported={nfcSupported}
          writing={writing}
          onWrite={() => void handleWrite()}
          onCancel={cancelAwaitingNfc}
        />
      )}

      {phase === 'result-success' && (
        <ResultOverlay
          variant="success"
          uuid={uuid}
          errorMessage={null}
          onDone={finishResult}
        />
      )}

      {phase === 'result-error' && (
        <ResultOverlay
          variant="error"
          uuid={uuid}
          errorMessage={writeError}
          onDone={finishResult}
        />
      )}
    </div>
  )
}
