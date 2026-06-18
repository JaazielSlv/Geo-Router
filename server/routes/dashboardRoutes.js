import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Retorna métricas agregadas para o dashboard
 *     responses:
 *       200:
 *         description: Resumo do dashboard
 */
router.get('/summary', getDashboardSummary);

export default router;
