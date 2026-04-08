# NFC Writer Test

PWA (React + Vite + TypeScript) para ler um **UUID** de um **QR Code** e gravar na **TAG NFC** como registro NDEF texto (Web NFC).

## Requisitos

- **Android** com **Chrome** (Web NFC)
- **HTTPS** em produção, ou `localhost` em desenvolvimento
- **NFC** ativado no aparelho

## Comandos

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Pré-visualizar o build (PWA + service worker):

```bash
npm run preview
```

## Ícones PWA

Os PNG em `public/icons/` podem ser regenerados com:

```bash
node scripts/generate-icons.mjs
```

## Testar no Android

1. Faça o deploy do `dist/` em um host **HTTPS** (ou use um túnel como ngrok apontando para `npm run preview`).
2. Abra a URL no **Chrome** do celular.
3. Ative o **NFC** nas configurações.
4. Conceda permissão da **câmera** para ler o QR; depois aproxime uma tag **gravável** para escrever/ler.

## Observações

- A **Web NFC** funciona principalmente no **Chrome para Android**.
- É necessário **HTTPS** (ou **localhost**).
- O **NFC** deve estar **ligado** no dispositivo.
