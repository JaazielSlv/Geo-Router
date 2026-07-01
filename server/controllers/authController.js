import bcrypt from 'bcryptjs';
import prisma from '../services/prismaClient.js';
import { generateToken } from '../utils/jwt.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.statusCode = status;
  return error;
}

export async function register(req, res, next) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, 'Email e senha são obrigatórios.'));
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createHttpError(400, 'Email já cadastrado.'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, 'Email e senha são obrigatórios.'));
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createHttpError(401, 'Credenciais inválidas.'));
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export async function profile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return next(createHttpError(404, 'Usuário não encontrado.'));
    }

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    next(error);
  }
}
