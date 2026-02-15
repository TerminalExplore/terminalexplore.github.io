# TerminalExplore Personal Site

Static personal site optimized for Docker + Nginx deployment.

## Run with Node.js (npm)

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

Production mode:

```bash
npm start
```

Open: `http://localhost:8080` (or set `PORT` environment variable)

## Run with Docker Compose

```bash
docker compose up -d --build
```

Open: `http://localhost:8080`

## Run with Docker only

```bash
docker build -t terminalexplore-site .
docker run -d --name terminalexplore-site -p 8080:80 --restart unless-stopped terminalexplore-site
```

## What is configured

- Nginx static hosting
- Gzip compression for text assets
- Browser caching for static assets
- Healthcheck for container monitoring

## Contact form (API)

Contact form in `index.html` supports two providers via form data attributes:

- Default: `formsubmit` (no API key, first submission requires email activation)
- Optional: `web3forms` (requires access key)

Current form markup:

```html
<form novalidate data-provider="formsubmit" data-endpoint="" data-access-key="">
```

### Option 1: FormSubmit (default)

1. Keep `data-provider="formsubmit"`.
2. Set recipient email in the `To` field value in `index.html`.
3. First message triggers activation email from FormSubmit.

### Option 2: Web3Forms

1. Set `data-provider="web3forms"`.
2. Put your key into `data-access-key="YOUR_KEY"`.
3. Keep `data-endpoint` empty (uses `https://api.web3forms.com/submit`) or set your custom endpoint.
