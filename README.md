<p align="center">
  <img src=".github/readme-banner.png" alt="peersend.io" width="100%" />
</p>

<p align="center">
  <a href="https://peersend.io">peersend.io</a> &nbsp;·&nbsp;
  <a href="https://peersend.io/session/create">Open App</a> &nbsp;·&nbsp;
  <a href="https://peersend.io/privacy">Privacy Policy</a> &nbsp;·&nbsp;
  <a href="https://peersend.io/terms">Terms of Service</a>
</p>

---

**PeerSend.io** is a browser-based, peer-to-peer file transfer tool. Drop a file. Share a code. Your recipient connects directly — no uploads, no cloud storage, no account required.

Files travel encrypted, browser-to-browser, over a WebRTC data channel. Our servers never see your data.

## How it works

```
You open a session      →   A unique code is generated
Your peer enters it     →   A direct WebRTC connection is established
You send the file       →   It streams encrypted, peer-to-peer
Session closes          →   The code expires. Nothing is stored.
```

## Features

- **Zero storage** — files are never uploaded to a server
- **End-to-end encrypted** — WebRTC DTLS-SRTP encryption, built into the protocol
- **No account needed** — open the app and go
- **Any device** — works in any modern browser on desktop or mobile
- **Ephemeral sessions** — codes expire when the browser tab closes

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4, shadcn/ui |
| Backend | Go 1.24, gorilla/websocket |
| Transport | WebRTC (browser-native) |
| Infrastructure | Docker Compose |

## Running locally

```bash
# Start everything
docker compose up

# Frontend only  (http://localhost:3500)
docker compose up web

# Backend only   (ws://localhost:3600)
docker compose up go_server
```

### Development

```bash
# Frontend
cd web
npm install
npm run dev        # dev server
npm run build      # production build
npm run type-check # TypeScript check
npm run lint       # ESLint

# Backend
cd server
go run ./cmd/peersend   # run
go test ./...           # test
go build ./cmd/peersend # build
```

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_SERVER_ENDPOINT` | WebSocket signaling server URL | `ws://localhost:3600/exchange` |
| `VITE_LOG_LEVEL` | Log level (`debug`, `info`, `warn`, `error`) | `info` |
| `SERVER_CONFIG_PATH` | Path to server YAML config | `configs/peersend.yml` |

## Architecture

The backend is a lightweight Go WebSocket signaling server. It brokers the initial WebRTC handshake (ICE candidates, SDP) between two peers — after that, the connection is direct. The server never handles file data.

The frontend manages WebRTC connection state, file chunking, and transfer progress entirely in the browser using a custom pub-sub state store.

## License

[MIT](LICENSE)
