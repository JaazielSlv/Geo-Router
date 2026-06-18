import prisma from '../services/prismaClient.js';

export async function getDashboardSummary(req, res) {
  const totalAS = await prisma.autonomousSystem.count();
  const records = await prisma.autonomousSystem.findMany({ select: { prefixes: true, upstreams: true, peers: true, status: true } });

  const totalPrefixes = records.reduce((sum, record) => sum + (Array.isArray(record.prefixes) ? record.prefixes.length : 0), 0);
  const totalUpstreams = records.reduce((sum, record) => sum + (Array.isArray(record.upstreams) ? record.upstreams.length : 0), 0);
  const totalPeers = records.reduce((sum, record) => sum + (Array.isArray(record.peers) ? record.peers.length : 0), 0);
  const activeAlerts = 5;
  const totalEvents = 42;
  const statusCounts = records.reduce((counts, record) => {
    const status = record.status || 'Desconhecido';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  res.json({
    totalAS,
    totalPrefixes,
    totalUpstreams,
    totalPeers,
    activeAlerts,
    totalEvents,
    statusCounts
  });
}
