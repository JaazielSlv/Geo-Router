import prisma from '../services/prismaClient.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.statusCode = status;
  return error;
}

function parseIdentifier(value) {
  if (typeof value === 'string') {
    const cleaned = value.replace(/^AS/i, '').trim();
    const numeric = Number(cleaned);
    return Number.isInteger(numeric) ? numeric : null;
  }

  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : null;
}

export async function getAllAS(req, res, next) {
  try {
    const items = await prisma.autonomousSystem.findMany({ orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function getASById(req, res, next) {
  const { id } = req.params;
  const numeric = parseIdentifier(id);

  try {
    const item = await prisma.autonomousSystem.findFirst({
      where: {
        OR: [
          numeric !== null ? { id: numeric } : undefined,
          numeric !== null ? { asn: numeric } : undefined
        ]
      }
    });

    if (!item) {
      return next(createHttpError(404, 'AS não encontrado.'));
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function createAS(req, res, next) {
  const data = req.body;
  const requiredFields = ['asn', 'org'];

  if (!requiredFields.every(field => field in data && data[field] !== undefined && data[field] !== null && data[field] !== '')) {
    return next(createHttpError(400, 'Campos obrigatórios: asn, org.'));
  }

  try {
    const item = await prisma.autonomousSystem.create({ data });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateAS(req, res, next) {
  const { id } = req.params;
  const data = req.body;
  const numeric = parseIdentifier(id);

  try {
    const existing = await prisma.autonomousSystem.findFirst({
      where: {
        OR: [
          numeric !== null ? { id: numeric } : undefined,
          numeric !== null ? { asn: numeric } : undefined
        ]
      }
    });

    if (!existing) {
      return next(createHttpError(404, 'AS não encontrado.'));
    }

    const updated = await prisma.autonomousSystem.update({
      where: { id: existing.id },
      data
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function patchAS(req, res, next) {
  const { id } = req.params;
  const data = req.body;
  const numeric = parseIdentifier(id);

  try {
    const existing = await prisma.autonomousSystem.findFirst({
      where: {
        OR: [
          numeric !== null ? { id: numeric } : undefined,
          numeric !== null ? { asn: numeric } : undefined
        ]
      }
    });

    if (!existing) {
      return next(createHttpError(404, 'AS não encontrado.'));
    }

    const updated = await prisma.autonomousSystem.update({
      where: { id: existing.id },
      data
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteAS(req, res, next) {
  const { id } = req.params;
  const numeric = parseIdentifier(id);

  try {
    const existing = await prisma.autonomousSystem.findFirst({
      where: {
        OR: [
          numeric !== null ? { id: numeric } : undefined,
          numeric !== null ? { asn: numeric } : undefined
        ]
      }
    });

    if (!existing) {
      return next(createHttpError(404, 'AS não encontrado.'));
    }

    await prisma.autonomousSystem.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
