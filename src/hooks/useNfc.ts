import { useCallback, useMemo } from 'react'

export function isNfcSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

export type NfcReadResult = {
  text: string
  serialNumber?: string
}

function mapNfcError(err: unknown): Error {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') {
      return new Error('Permissão NFC negada ou NFC desligado no aparelho.')
    }
    if (err.name === 'AbortError') {
      return new Error('Operação NFC cancelada.')
    }
    return new Error(err.message || 'Erro na operação NFC.')
  }
  if (err instanceof Error) return err
  return new Error(String(err))
}

export async function writeUuidNdef(uuid: string): Promise<void> {
  const ndef = new NDEFReader()
  try {
    await ndef.write({
      records: [
        {
          recordType: 'text',
          data: uuid,
          id: '',
          encoding: 'utf-8',
          lang: 'en',
        },
      ],
    })
  } catch (err) {
    throw mapNfcError(err)
  }
}

/** Lê a primeira mensagem NDEF com registro texto (ou payload decodificável). */
export async function readNdefTextOnce(): Promise<NfcReadResult> {
  const ndef = new NDEFReader()
  const abort = new AbortController()
  let settled = false

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      ndef.removeEventListener('reading', onReading)
      ndef.removeEventListener('readingerror', onReadingError)
    }

    const onReading = (event: Event) => {
      if (settled) return
      const e = event as NDEFReadingEvent
      let text = ''
      for (const record of e.message.records) {
        if (record.recordType === 'text' && record.data) {
          const enc = record.encoding ?? 'utf-8'
          text = new TextDecoder(enc).decode(record.data)
          break
        }
      }
      if (!text) {
        for (const record of e.message.records) {
          if (record.data) {
            text = new TextDecoder().decode(record.data)
            break
          }
        }
      }
      settled = true
      cleanup()
      abort.abort()
      resolve({
        text: text.trim(),
        serialNumber: e.serialNumber,
      })
    }

    const onReadingError = () => {
      if (settled) return
      settled = true
      cleanup()
      abort.abort()
      reject(new Error('Erro ao ler a TAG NFC (readingerror).'))
    }

    ndef.addEventListener('reading', onReading)
    ndef.addEventListener('readingerror', onReadingError)

    void ndef.scan({ signal: abort.signal }).catch((err: unknown) => {
      if (settled && err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      if (!settled) {
        settled = true
        cleanup()
        reject(mapNfcError(err))
      }
    })
  })
}

export function useNfc() {
  const supported = useMemo(() => isNfcSupported(), [])

  const write = useCallback(async (uuid: string) => {
    await writeUuidNdef(uuid)
  }, [])

  const read = useCallback(async () => {
    return readNdefTextOnce()
  }, [])

  return { supported, write, read }
}
