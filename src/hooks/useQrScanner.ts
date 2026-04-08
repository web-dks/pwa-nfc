import { useCallback, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

function mapCameraError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'NotAllowedError') {
      return 'Permissão da câmera negada. Permita o acesso nas configurações do navegador.'
    }
    if (err.name === 'NotFoundError') {
      return 'Nenhuma câmera encontrada neste dispositivo.'
    }
    if (err.name === 'NotReadableError') {
      return 'A câmera não está disponível (pode estar em uso por outro app).'
    }
    if (err.message) return err.message
  }
  return 'Não foi possível iniciar a câmera.'
}

export function useQrScanner(elementId: string) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const stop = useCallback(async () => {
    const s = scannerRef.current
    if (!s) {
      setIsScanning(false)
      return
    }
    try {
      if (s.getState() === Html5QrcodeScannerState.SCANNING) {
        await s.stop()
      }
      s.clear()
    } catch {
      /* ignore */
    } finally {
      scannerRef.current = null
      setIsScanning(false)
    }
  }, [])

  const start = useCallback(
    async (onDecoded: (text: string) => void) => {
      await stop()
      try {
        const html5 = new Html5Qrcode(elementId, /* verbose */ false)
        scannerRef.current = html5
        await html5.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (w, h) => {
              const edge = Math.min(w, h)
              const size = Math.floor(edge * 0.72)
              return { width: size, height: size }
            },
          },
          (decodedText) => {
            onDecoded(decodedText)
          },
          () => {
            /* per-frame: ignore */
          },
        )
        setIsScanning(true)
      } catch (err) {
        scannerRef.current = null
        setIsScanning(false)
        throw new Error(mapCameraError(err))
      }
    },
    [elementId, stop],
  )

  return { start, stop, isScanning }
}
