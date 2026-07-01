import express from 'express';
import {
  getAllAS,
  getASById,
  createAS,
  updateAS,
  patchAS,
  deleteAS
} from '../controllers/asController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createASValidator, idParamValidator, updateASValidator } from '../validators/asValidator.js';

const router = express.Router();

/**
 * @openapi
 * /api/autonomousSystems:
 *   get:
 *     tags:
 *       - AutonomousSystems
 *     summary: Lista todos os sistemas autônomos
 *     responses:
 *       200:
 *         description: Lista de AS
 */
router.get('/', catchAsync(getAllAS));

/**
 * @openapi
 * /api/autonomousSystems/{id}:
 *   get:
 *     tags:
 *       - AutonomousSystems
 *     summary: Retorna detalhes de um AS por ID ou ASN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do AS
 *       404:
 *         description: AS não encontrado
 */
router.get('/:id', idParamValidator, validateRequest, catchAsync(getASById));

/**
 * @openapi
 * /api/autonomousSystems:
 *   post:
 *     tags:
 *       - AutonomousSystems
 *     summary: Cria um novo sistema autônomo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asn:
 *                 type: integer
 *               org:
 *                 type: string
 *     responses:
 *       201:
 *         description: AS criado
 *       401:
 *         description: Não autorizado
 */
router.post('/', authMiddleware, createASValidator, validateRequest, catchAsync(createAS));

/**
 * @openapi
 * /api/autonomousSystems/{id}:
 *   put:
 *     tags:
 *       - AutonomousSystems
 *     summary: Atualiza um sistema autônomo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: AS atualizado
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: AS não encontrado
 */
router.put('/:id', authMiddleware, idParamValidator, updateASValidator, validateRequest, catchAsync(updateAS));

/**
 * @openapi
 * /api/autonomousSystems/{id}:
 *   patch:
 *     tags:
 *       - AutonomousSystems
 *     summary: Atualiza parcialmente um sistema autônomo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: AS atualizado parcialmente
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: AS não encontrado
 */
router.patch('/:id', authMiddleware, idParamValidator, updateASValidator, validateRequest, catchAsync(patchAS));

/**
 * @openapi
 * /api/autonomousSystems/{id}:
 *   delete:
 *     tags:
 *       - AutonomousSystems
 *     summary: Exclui um sistema autônomo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: AS excluído
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: AS não encontrado
 */
router.delete('/:id', authMiddleware, idParamValidator, validateRequest, catchAsync(deleteAS));

export default router;
