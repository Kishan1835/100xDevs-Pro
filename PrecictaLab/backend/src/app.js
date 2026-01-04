import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import clerkMiddleware from './config/clerkMiddleware.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'API Running' });
});

// Apply Clerk middleware before routes that need authentication
app.use('/auth', clerkMiddleware, authRoutes);

export default app;
