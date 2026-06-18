import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  const token = authorization.split(' ')[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
