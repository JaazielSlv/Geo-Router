import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { loginValidator, registerValidator } from '../validators/authValidator.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registra um novo usuário e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', registerValidator, validateRequest, catchAsync(register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Autentica usuário e retorna um JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token de autenticação
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginValidator, validateRequest, catchAsync(login));

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Retorna o perfil do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Token inválido ou não informado
 */
router.get('/profile', authMiddleware, catchAsync(profile));

export default router;
