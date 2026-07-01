import { body, param } from 'express-validator';

export const createASValidator = [
  body('asn').isInt({ min: 1 }).withMessage('ASN deve ser um número inteiro positivo.'),
  body('org').trim().notEmpty().withMessage('Organização é obrigatória.'),
  body('country').optional().isString().withMessage('País deve ser texto.'),
  body('type').optional().isString().withMessage('Tipo deve ser texto.'),
  body('routes').optional().isInt({ min: 0 }).withMessage('Rotas deve ser um número inteiro positivo.'),
  body('prefixes').optional().isArray().withMessage('Prefixos deve ser um array.'),
  body('upstreams').optional().isArray().withMessage('Upstreams deve ser um array.'),
  body('peers').optional().isArray().withMessage('Peers deve ser um array.'),
  body('description').optional().isString().withMessage('Descrição deve ser texto.')
];

export const updateASValidator = [
  body('asn').optional().isInt({ min: 1 }).withMessage('ASN deve ser um número inteiro positivo.'),
  body('org').optional().trim().notEmpty().withMessage('Organização é obrigatória.'),
  body('country').optional().isString().withMessage('País deve ser texto.'),
  body('type').optional().isString().withMessage('Tipo deve ser texto.'),
  body('routes').optional().isInt({ min: 0 }).withMessage('Rotas deve ser um número inteiro positivo.'),
  body('prefixes').optional().isArray().withMessage('Prefixos deve ser um array.'),
  body('upstreams').optional().isArray().withMessage('Upstreams deve ser um array.'),
  body('peers').optional().isArray().withMessage('Peers deve ser um array.'),
  body('description').optional().isString().withMessage('Descrição deve ser texto.')
];

export const idParamValidator = [
  param('id').notEmpty().withMessage('ID ou ASN é obrigatório.')
];
