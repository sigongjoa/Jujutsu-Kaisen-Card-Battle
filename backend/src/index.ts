/**
 * Main server entry point
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import deckRoutes from './routes/deck';
import gameRoutes from './routes/game';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Logging middleware
import fs from 'fs';
import path from 'path';

app.use((req, _res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
  console.log(log.trim());
  fs.appendFileSync(path.join(__dirname, '../backend.log'), log);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deck', deckRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start HTTP server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

// WebSocket server (initialized but not actively managed in this simple implementation)
new WebSocketServer({ port: WS_PORT as number });

console.log(`✓ WebSocket server running on ws://localhost:${WS_PORT}`);

export default app;
