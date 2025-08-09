import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';
const app = express();
app.use(express.json());
const server = new McpServer({
    name: 'helprlocal-mcp-server',
    version: '1.0.0',
});
// Example tool: add two numbers
server.registerTool('add', {
    title: 'Addition Tool',
    description: 'Add two numbers',
    inputSchema: { a: z.number(), b: z.number() },
}, async ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }],
}));
// Example resource: greeting
server.registerResource('greeting', new ResourceTemplate('greeting://{name}', { list: undefined }), {
    title: 'Greeting Resource',
    description: 'Dynamic greeting generator',
}, async (uri, { name }) => ({
    contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
}));
// MCP transport
const transports = {};
app.post('/mcp', async (req, res) => {
    let sessionId = req.headers['mcp-session-id'];
    let transport;
    if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
    }
    else {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => Math.random().toString(36).slice(2),
            onsessioninitialized: (id) => {
                transports[id] = transport;
            },
        });
        await server.connect(transport);
    }
    await transport.handleRequest(req, res, req.body);
});
app.listen(4000, () => {
    console.log('MCP server running on http://localhost:4000/mcp');
});
//# sourceMappingURL=index.js.map