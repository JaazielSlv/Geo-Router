import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Email inválido.'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
  body('name').optional().isString().withMessage('Nome deve ser texto.')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email inválido.'),
  body('password').notEmpty().withMessage('Senha é obrigatória.')
];
