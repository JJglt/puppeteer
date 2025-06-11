# Puppeteer Web Scraper MCP

A Node.js project for dynamic web page scraping using Puppeteer, exposed as a Model Context Protocol (MCP) server tool. This project features a custom-managed Puppeteer browser pool and a robust HTTP API for extracting visible text from web pages.

---

## Project Features

- **Custom Puppeteer Pool**: Efficient FIFO pool of 4 browser workers for concurrent, reliable scraping.
- **Web Scrape Tool**: Securely extract visible text from any web page via a single MCP tool endpoint.
- **Modern Logging**: Structured logging for all scraping and server operations.
- **Graceful Shutdown**: Cleans up browser resources and server connections on exit.

---

## Usage

1. **Install dependencies**

   ```sh
   npm install
   npm test # Optional
   ```

2. **Configure environment**

   Create a `.env` file with:

   ```env
   MCP_PORT=1234
   MCP_TOKEN=your-mcp-token
   LOG_LEVEL=info
   ```

3. **Run the server**

   ```sh
   node puppeteer.mjs
   ```

4. **Call the web-scrape tool**

   - Use the MCP HTTP API to invoke the `web-scrape` tool with a JSON body:

     ```json
     { "url": "https://example.com" }
     ```

   - Returns the visible text content of the page.

---

## Code Overview

- `src/custom/puppeteerPool.mjs`: Manages a pool of Puppeteer browser instances for efficient, parallel scraping.
- `src/tools/web-scrape.mjs`: Registers the `web-scrape` tool, which uses the pool to fetch and extract visible text from a given URL.

---

## Security & Best Practices

- **Tokens**: Keep your `.env` and MCP_TOKEN secret.
- **Production**: Run as a non-root user and monitor resource usage.
- **Extensibility**: Add new tools in `src/tools/` as needed.

---

## Running as a Systemd Service (Linux)

To run this project as a background service on Linux, use the provided `puppeteer.service` file for systemd.

### 1. Install Chrome for Puppeteer

Puppeteer requires a compatible browser. You can install Chrome to a cache directory with:

```sh
PUPPETEER_CACHE_DIR=.cache/ npx puppeteer browsers install chrome
```

For production, set the cache directory to a persistent location (e.g. `/opt/puppeteer/.cache`) and ensure your `.env` contains:

```env
PUPPETEER_CACHE_DIR=/opt/puppeteer/.cache
```

### 2. Configure the systemd service

- Edit `puppeteer.service` to match your deployment paths and user:

```ini
[Unit]
Description=puppeteer
After=network-online.target
Wants=network-online.target
StartLimitBurst=3
StartLimitIntervalSec=60

[Service]
User=puppeteer
Group=puppeteer
RestartSec=5
Restart=on-failure
WorkingDirectory=/opt/puppeteer
ExecStart=/opt/puppeteer/puppeteer.mjs
EnvironmentFile=/opt/puppeteer/.env

[Install]
WantedBy=multi-user.target
```

- Copy the file to systemd:

```sh
sudo cp puppeteer.service /etc/systemd/system/puppeteer.service
```

- Reload systemd and enable the service:

```sh
sudo systemctl daemon-reload
sudo systemctl enable puppeteer.service
sudo systemctl start puppeteer.service
sudo systemctl status puppeteer.service
```

---

## License

MIT

---

For questions or support,
Email: Russell Purinton <russell.purinton@gmail.com>
Github & Discord: rpurinton
