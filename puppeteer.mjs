#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import { createHttpServer } from './src/httpServer.mjs';
import initializeMcpServer from './src/mcpServer.mjs';
import initializeMcpClient from './src/mcpClient.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

(async () => {
  try {
    registerExceptionHandlers();

    const mcpTransport = new StreamableHTTPServerTransport({});
    if (!mcpTransport) {
      log.error('Failed to create MCP transport.');
      process.exit(1);
    }

    const mcpServer = await initializeMcpServer(mcpTransport);
    if (!mcpServer) {
      log.error('Failed to initialize MCP server.');
      process.exit(1);
    }
    global.mcpServer = mcpServer;


    const { app, httpInstance } = createHttpServer({ log, mcpServer, mcpTransport, autoStartMcpServer: false });
    if (!app || !httpInstance) {
      log.error('Failed to create HTTP server.');
      process.exit(1);
    }
    global.httpInstance = httpInstance;

    const port = process.env.MCP_PORT || 1234;
    httpInstance.listen(port, () => { log.info(`HTTP Server listening on port ${port}`) });

    const mcpClient = await initializeMcpClient({ log });
    if (!mcpClient) {
      log.error('Failed to initialize MCP client.');
      process.exit(1);
    }

    const tools = await mcpClient.listTools();
    global.tools = tools.tools || [];
    log.info(`MCP Server provides ${global.tools.length} tools`);
    if (global.tools.length === 0) {
      log.error('No tools registered in MCP Server. Please check your tool registration.');
      process.exit(1);
    }

    if (typeof mcpClient.close === 'function') {
      await mcpClient.close();
      log.info('MCP Client connection closed after retrieving tools.');
    }

    setupShutdownHandlers();

  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();