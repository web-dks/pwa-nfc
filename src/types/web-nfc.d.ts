/** Minimal Web NFC typings for NDEFReader (Chrome Android) */

interface NDEFMessage {
  records: NDEFRecord[]
}

interface NDEFRecord {
  recordType: string
  data?: DataView
  encoding?: string
  id?: string
}

interface NDEFWriteOptions {
  records: NDEFRecordInit[]
}

interface NDEFRecordInit {
  recordType: string
  data?: string | BufferSource
  id?: string
  encoding?: string
  lang?: string
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage
  serialNumber?: string
}

interface NDEFReaderInstance extends EventTarget {
  write(options: NDEFWriteOptions): Promise<void>
  scan(options?: { signal?: AbortSignal }): Promise<void>
  addEventListener(
    type: 'reading',
    listener: (ev: NDEFReadingEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void
}

declare const NDEFReader: new () => NDEFReaderInstance
