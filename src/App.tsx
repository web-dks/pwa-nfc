import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { NfcActions } from './components/NfcActions'
import { QrSection } from './components/QrSection'
import { StatusMessage } from './components/StatusMessage'
import { useNfc } from './hooks/useNfc'
import { useQrScanner } from './hooks/useQrScanner'
import { isValidUuid, normalizeUuid } from './utils/uuid'

const QR_ELEMENT_ID = 'qr-reader-region'

type StatusVariant = 'info' | 'success' | 'error' | 'warning'

export default function App() {
  const { start, stop, isScanning } = useQrScanner(QR_ELEMENT_ID)
  const { supported: nfcSupported, write, read } = useNfc()

  const [uuid, setUuid] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    'Aguardando leitura do QR Code',
  )
  const [statusVariant, setStatusVariant] = useState<StatusVariant>('info')
  const [writing, setWriting] = useState(false)
  const [reading, setReading] = useState(false)
  const [lastReadText, setLastReadText] = useState<string | null>(null)
  const [lastReadSerial, setLastReadSerial] = useState<string | null>(null)

  const setStatus = useCallback(
    (msg: string, variant: StatusVariant = 'info') => {
      setStatusMessage(msg)
      setStatusVariant(variant)
    },
    [],
  )

  const onDecoded = useCallback(
    (raw: string) => {
      const normalized = normalizeUuid(raw)
      if (isValidUuid(normalized)) {
        setUuid(normalized)
        setStatus('QR Code lido com sucesso', 'success')
        void stop().then(() => setShowPreview(false))
      } else {
        setStatus(
          'Conteúdo inválido: não é um UUID. Continue apontando ou pare a leitura.',
          'error',
        )
      }
    },
    [setStatus, stop],
  )

  const handleToggleScan = useCallback(async () => {
    if (isScanning) {
      await stop()
      setShowPreview(false)
      setStatus('Aguardando leitura do QR Code', 'info')
      return
    }
    setShowPreview(true)
    setStatus('Iniciando câmera…', 'info')
    await new Promise<void>((r) => requestAnimationFrame(() => r()))
    try {
      await start(onDecoded)
      setStatus('Aponte a câmera para o QR Code', 'info')
    } catch (e) {
      setShowPreview(false)
      setStatus(
        e instanceof Error ? e.message : 'Não foi possível abrir a câmera.',
        'error',
      )
    }
  }, [isScanning, start, stop, onDecoded, setStatus])

  const handleWrite = useCallback(async () => {
    if (!uuid || !isValidUuid(uuid)) return
    setWriting(true)
    setStatus('Aproxime a TAG NFC', 'info')
    try {
      await write(uuid)
      setStatus('UUID gravado com sucesso', 'success')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setStatus(`Erro ao gravar NFC: ${msg}`, 'error')
    } finally {
      setWriting(false)
    }
  }, [uuid, write, setStatus])

  const handleRead = useCallback(async () => {
    setReading(true)
    setLastReadText(null)
    setLastReadSerial(null)
    setStatus('Aproxime a TAG NFC para leitura', 'info')
    try {
      const result = await read()
      setLastReadText(result.text || '(vazio)')
      setLastReadSerial(result.serialNumber ?? null)
      setStatus('TAG lida com sucesso', 'success')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao ler NFC'
      setStatus(msg, 'error')
    } finally {
      setReading(false)
    }
  }, [read, setStatus])

  useEffect(() => {
    return () => {
      void stop()
    }
  }, [stop])

  const canWrite = Boolean(uuid && isValidUuid(uuid))

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Gravar UUID em TAG NFC</h1>
        <p className="header__subtitle">Ferramenta interna de teste</p>
      </header>

      <main className="card">
        <QrSection
          elementId={QR_ELEMENT_ID}
          showPreview={showPreview}
          isScanning={isScanning}
          uuidDisplay={uuid}
          onToggleScan={() => void handleToggleScan()}
        />

        <NfcActions
          nfcSupported={nfcSupported}
          canWrite={canWrite}
          writing={writing}
          reading={reading}
          onWrite={() => void handleWrite()}
          onRead={() => void handleRead()}
          lastReadText={lastReadText}
          lastReadSerial={lastReadSerial}
        />

        <footer className="card__footer">
          <StatusMessage message={statusMessage} variant={statusVariant} />
        </footer>
      </main>
    </div>
  )
}
