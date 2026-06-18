import bcrypt from 'bcryptjs';
import prisma from '../services/prismaClient.js';
import { generateToken } from '../utils/jwt.js';

export async function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Email já cadastrado.' });
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
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}

export async function profile(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
