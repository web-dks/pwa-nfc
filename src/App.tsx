import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { AwaitingNfcOverlay } from './components/AwaitingNfcOverlay'
import { HomePanel } from './components/HomePanel'
import { NfcTagReadOverlay } from './components/NfcTagReadOverlay'
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
  const [tagReadOpen, setTagReadOpen] = useState(false)
  const [tagReadLoading, setTagReadLoading] = useState(false)
  const [tagReadText, setTagReadText] = useState<string | null>(null)
  const [tagReadSerial, setTagReadSerial] = useState<string | null>(null)
  const [tagReadError, setTagReadError] = useState<string | null>(null)
  const tagReadDismissedRef = useRef(false)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [resultCountdown, setResultCountdown] = useState(3)

  const exitSerialCycleToHome = useCallback(() => {
    setUuid(null)
    setWriteError(null)
    setQrBanner(null)
    setPhase('home')
  }, [])

  const onDecodedRef = useRef<(text: string) => void>(() => {})

  const onDecoded = useCallback(
    (raw: string) => {
      const normalized = normalizeUuid(raw)
      if (isValidUuid(normalized)) {
        setUuid(normalized)
        setQrBanner(null)
        void (async () => {
          await stop()
          if (!nfcSupported) {
            setWriteError(
              'Web NFC não disponível neste dispositivo ou navegador.',
            )
            setResultCountdown(3)
            setPhase('result-error')
            return
          }
          setPhase('awaiting-nfc')
        })()
      } else {
        setQrBanner('Conteúdo inválido: não é um UUID.')
      }
    },
    [stop, nfcSupported],
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
          setUuid(null)
          setWriteError(null)
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

  const nfcAutoWriteStarted = useRef(false)

  useEffect(() => {
    if (phase !== 'awaiting-nfc') {
      nfcAutoWriteStarted.current = false
      return
    }
    if (!uuid || !isValidUuid(uuid) || !nfcSupported) return
    if (nfcAutoWriteStarted.current) return
    nfcAutoWriteStarted.current = true

    let cancelled = false
    const run = async () => {
      setWriting(true)
      setWriteError(null)
      try {
        await write(uuid)
        if (!cancelled) {
          setResultCountdown(3)
          setPhase('result-success')
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido'
        if (!cancelled) {
          setWriteError(msg)
          setResultCountdown(3)
          setPhase('result-error')
        }
      } finally {
        if (!cancelled) setWriting(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [phase, uuid, nfcSupported, write])

  /** Próxima etapa em série: novo leitor de QR em tela cheia. */
  const continueCycleToQr = useCallback(() => {
    setUuid(null)
    setWriteError(null)
    setQrBanner(null)
    setPhase('qr-fullscreen')
  }, [])

  const closeQrFullscreen = useCallback(async () => {
    await stop()
    exitSerialCycleToHome()
  }, [stop, exitSerialCycleToHome])

  const openQrFullscreen = useCallback(() => {
    setQrBanner(null)
    setPhase('qr-fullscreen')
  }, [])

  const closeTagReadOverlay = useCallback(() => {
    tagReadDismissedRef.current = true
    setTagReadOpen(false)
    setTagReadLoading(false)
    setTagReadText(null)
    setTagReadSerial(null)
    setTagReadError(null)
  }, [])

  const handleRead = useCallback(async () => {
    tagReadDismissedRef.current = false
    setTagReadOpen(true)
    setTagReadLoading(true)
    setTagReadText(null)
    setTagReadSerial(null)
    setTagReadError(null)
    try {
      const result = await read()
      if (tagReadDismissedRef.current) return
      setTagReadText(result.text || '(vazio)')
      setTagReadSerial(result.serialNumber ?? null)
    } catch (e) {
      if (tagReadDismissedRef.current) return
      setTagReadError(e instanceof Error ? e.message : 'Erro ao ler NFC')
    } finally {
      if (!tagReadDismissedRef.current) setTagReadLoading(false)
    }
  }, [read])

  useEffect(() => {
    if (phase !== 'result-success' && phase !== 'result-error') return

    setResultCountdown(3)
    let elapsed = 0
    const iv = window.setInterval(() => {
      elapsed += 1
      const left = 3 - elapsed
      setResultCountdown(Math.max(0, left))
      if (left <= 0) {
        clearInterval(iv)
        continueCycleToQr()
      }
    }, 1000)

    return () => clearInterval(iv)
  }, [phase, continueCycleToQr])

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
              readInProgress={tagReadOpen && tagReadLoading}
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
          writing={writing}
          onExit={exitSerialCycleToHome}
        />
      )}

      {phase === 'result-success' && (
        <ResultOverlay
          variant="success"
          uuid={uuid}
          errorMessage={null}
          countdownSeconds={resultCountdown}
          onContinue={continueCycleToQr}
          onExit={exitSerialCycleToHome}
        />
      )}

      {phase === 'result-error' && (
        <ResultOverlay
          variant="error"
          uuid={uuid}
          errorMessage={writeError}
          countdownSeconds={resultCountdown}
          onContinue={continueCycleToQr}
          onExit={exitSerialCycleToHome}
        />
      )}

      {tagReadOpen && (
        <NfcTagReadOverlay
          loading={tagReadLoading}
          text={tagReadText}
          serial={tagReadSerial}
          error={tagReadError}
          onClose={closeTagReadOverlay}
        />
      )}
    </div>
  )
}
