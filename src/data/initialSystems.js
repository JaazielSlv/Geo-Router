import database from '../../db/db.json';

export const initialSystems = Array.isArray(database.autonomousSystems)
  ? database.autonomousSystems.map(item => ({
      ...item,
      prefixes: Array.isArray(item.prefixes) ? [...item.prefixes] : [],
      upstreams: Array.isArray(item.upstreams) ? [...item.upstreams] : [],
      peers: Array.isArray(item.peers) ? [...item.peers] : []
    }))
  : [];