import prisma from '../services/prismaClient.js';

function parseIdentifier(value) {
  if (typeof value === 'string') {
    const cleaned = value.replace(/^AS/i, '').trim();
    const numeric = Number(cleaned);
    return Number.isInteger(numeric) ? numeric : null;
  }

  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : null;
}

export async function getAllAS(req, res) {
  const items = await prisma.autonomousSystem.findMany({ orderBy: { id: 'asc' } });
  res.json(items);
}

export async function getASById(req, res) {
  const { id } = req.params;
  const numeric = parseIdentifier(id);

  const item = await prisma.autonomousSystem.findFirst({
    where: {
      OR: [
        numeric !== null ? { id: numeric } : undefined,
        numeric !== null ? { asn: numeric } : undefined
      ]
    }
  });

  if (!item) {
    return res.status(404).json({ error: 'AS não encontrado.' });
  }

  res.json(item);
}

export async function createAS(req, res) {
  const data = req.body;
  const requiredFields = ['asn', 'org'];

  if (!requiredFields.every(field => field in data && data[field] !== undefined && data[field] !== null && data[field] !== '')) {
    return res.status(400).json({ error: 'Campos obrigatórios: asn, org.' });
  }

  const item = await prisma.autonomousSystem.create({ data });
  res.status(201).json(item);
}

export async function updateAS(req, res) {
  const { id } = req.params;
  const data = req.body;
  const numeric = parseIdentifier(id);

  const existing = await prisma.autonomousSystem.findFirst({
    where: {
      OR: [
        numeric !== null ? { id: numeric } : undefined,
        numeric !== null ? { asn: numeric } : undefined
      ]
    }
  });

  if (!existing) {
    return res.status(404).json({ error: 'AS não encontrado.' });
  }

  const updated = await prisma.autonomousSystem.update({
    where: { id: existing.id },
    data
  });

  res.json(updated);
}

export async function patchAS(req, res) {
  const { id } = req.params;
  const data = req.body;
  const numeric = parseIdentifier(id);

  const existing = await prisma.autonomousSystem.findFirst({
    where: {
      OR: [
        numeric !== null ? { id: numeric } : undefined,
        numeric !== null ? { asn: numeric } : undefined
      ]
    }
  });

  if (!existing) {
    return res.status(404).json({ error: 'AS não encontrado.' });
  }

  const updated = await prisma.autonomousSystem.update({
    where: { id: existing.id },
    data
  });

  res.json(updated);
}

export async function deleteAS(req, res) {
  const { id } = req.params;
  const numeric = parseIdentifier(id);

  const existing = await prisma.autonomousSystem.findFirst({
    where: {
      OR: [
        numeric !== null ? { id: numeric } : undefined,
        numeric !== null ? { asn: numeric } : undefined
      ]
    }
  });

  if (!existing) {
    return res.status(404).json({ error: 'AS não encontrado.' });
  }

  await prisma.autonomousSystem.delete({ where: { id: existing.id } });
  res.status(204).send();
}
