# MCP puppeteer

A modern Node.js puppeteer for building Model Context Protocol (MCP) servers and clients, with HTTP transport, dynamic tool registration, robust logging, and graceful shutdown.

---

## Features

- **MCP Server and Client**: Easily start an MCP server and connect a client for tool discovery and invocation.
- **Dynamic Tool Registration**: Drop-in `.mjs` files in `src/tools/` to register new tools automatically.
- **HTTP API**: Built-in Express HTTP server for MCP transport and health checks.
- **Graceful Shutdown**: Handles process signals and cleans up resources on exit.
- **Winston-based Logging**: Configurable, structured logging for all components.
- **Environment-based Configuration**: Use `.env` for ports, tokens, and log levels.

---

## Getting Started

### 1. Clone the repository

```sh
# Replace <your-username> and <your-repo> with your GitHub info
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment

Create a `.env` file with your settings:

```env
MCP_PORT=1234
MCP_TOKEN=your-mcp-token
LOG_LEVEL=info
```

### 4. Run the puppeteer

```sh
node puppeteer.mjs
```

---

## Customization

### Adding Tools

- Place a `.mjs` file in `src/tools/`.
- Export a default async function that registers your tool with the MCP server.
- Use Zod for input validation and `buildResponse` from `toolHelpers.mjs` for output.

Example: `src/tools/mcp-echo.mjs`

```js
import { z } from 'zod';
import { buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'mcp-echo') {
  server.tool(
    toolName,
    "Echo Tool",
    { echoText: z.string() },
    async (_args, _extra) => {
      const pong = {
        message: "echo-reply",
        data: {
          text: _args.echoText
        }
      };
      return buildResponse(pong);
    }
  );
}
```

### Logging

- Logging is handled by Winston.
- Set `LOG_LEVEL` in your `.env` (`debug`, `info`, `warn`, `error`).

### Error Handling & Shutdown

- Uncaught exceptions and rejections are logged.
- Graceful shutdown on `SIGTERM`, `SIGINT`, or `SIGHUP`.
- The app will attempt to close the HTTP and MCP servers cleanly before exiting.

---

## Systemd Service Setup

To run your app as a service on Linux, use the provided `puppeteer.service` file.

**Update the paths and names to match your project.**

Example `puppeteer.service`:

```ini
[Unit]
Description=MCP puppeteer
After=network-online.target
Wants=network-online.target
StartLimitBurst=3
StartLimitIntervalSec=60

[Service]
User=appuser
Group=appgroup
RestartSec=5
Restart=on-failure
WorkingDirectory=/opt/puppeteer
ExecStart=/usr/bin/node /opt/puppeteer/puppeteer.mjs
EnvironmentFile=/opt/puppeteer/.env

[Install]
WantedBy=multi-user.target
```

**Instructions:**

1. Copy and rename the service file:

   ```sh
   sudo cp puppeteer.service /etc/systemd/system/myapp.service
   ```

2. Edit the service file:
   - Set `WorkingDirectory` and `ExecStart` to your app's location and main file (use absolute paths).
   - Set `EnvironmentFile` to your `.env` location.
   - Change `User` and `Group` to a non-root user for security.

3. Reload systemd and enable the service:

   ```sh
   sudo systemctl daemon-reload
   sudo systemctl enable myapp.service
   sudo systemctl start myapp.service
   sudo systemctl status myapp.service
   ```

---

## Folder Structure

```text
src/
  tools/         # Tool modules (auto-registered)
  *.mjs          # Core logic (server, client, logging, etc.)
```

---

## Best Practices & Tips

- **Keep your tokens secret!** Never commit your `.env` file or secrets to version control.
- **Use a dedicated, non-root user** for running your app in production.
- **Write tests** for your tools and core logic as your app grows.
- **Check the Model Context Protocol documentation** for new features and best practices.

---

## License

MIT

## Developer Support

Email: <russell.purinton@gmail.com>
Discord: laozi101
