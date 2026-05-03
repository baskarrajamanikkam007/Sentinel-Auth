import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { httpLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/user/user.routes';
import { sessionRouter } from './modules/session/session.routes';
import { apiKeyRouter } from './modules/api-key/apiKey.routes';
import { adminRouter } from './modules/admin/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/keys', apiKeyRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
