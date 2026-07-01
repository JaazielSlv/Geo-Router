import express from 'express';
import authRoutes from './authRoutes.js';
import asRoutes from './asRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/autonomousSystems', asRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
