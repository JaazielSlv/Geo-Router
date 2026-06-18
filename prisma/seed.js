import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dbFile = path.join(process.cwd(), 'db', 'db.json');
  const raw = fs.readFileSync(dbFile, 'utf-8');
  const json = JSON.parse(raw);
  const records = Array.isArray(json.autonomousSystems) ? json.autonomousSystems : [];

  await prisma.autonomousSystem.deleteMany();

  for (const record of records) {
    await prisma.autonomousSystem.create({
      data: {
        asn: record.asn,
        label: record.label || `AS${record.asn}`,
        org: record.org || '',
        country: record.country || 'BR',
        type: record.type || 'transit',
        routes: record.routes ?? 0,
        prefixes: record.prefixes ?? [],
        upstreams: record.upstreams ?? [],
        peers: record.peers ?? [],
        description: record.description ?? null,
        lastUpdate: record.lastUpdate ?? null,
        status: record.status ?? 'Ativo',
        routeHistory: record.routeHistory ?? []
      }
    });
  }

  const adminPassword = 'admin123';
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: 'admin@georoute.com' },
    update: {
      password: hashed,
      name: 'Admin GeoRoute'
    },
    create: {
      email: 'admin@georoute.com',
      password: hashed,
      name: 'Admin GeoRoute',
      role: 'admin'
    }
  });

  console.log(`Seed completo. Usuário admin@georoute.com / ${adminPassword}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
