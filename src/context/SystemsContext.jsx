import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialSystems } from '../data/initialSystems';
import { normalizeAsn, normalizeSystem, parseAsNumber } from '../lib/as';

const STORAGE_KEY = 'georoute-systems-v1';

const SystemsContext = createContext(null);

function loadStoredSystems() {
  if (typeof window === 'undefined') {
    return initialSystems.map(normalizeSystem);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeSystem);
      }
    }
  } catch {
    return initialSystems.map(normalizeSystem);
  }

  return initialSystems.map(normalizeSystem);
}

export function SystemsProvider({ children }) {
  const [systems, setSystems] = useState(loadStoredSystems);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  }, [systems]);

  const helpers = useMemo(() => ({
    systems,
    getSystemByAsn: asn => systems.find(system => normalizeAsn(system.asn) === normalizeAsn(asn)),
    createSystem: payload => {
      const normalized = normalizeSystem({
        ...payload,
        asn: parseAsNumber(payload.asn),
        id: parseAsNumber(payload.asn)
      });

      const exists = systems.some(system => normalizeAsn(system.asn) === normalizeAsn(normalized.asn));

      if (exists) {
        throw new Error('Já existe um AS com esse ASN.');
      }

      setSystems(current => {
        return [...current, normalized].sort((left, right) => left.asn - right.asn);
      });
    },
    updateSystem: (asn, payload) => {
      const targetAsn = normalizeAsn(asn);

      setSystems(current => current.map(system => {
        if (normalizeAsn(system.asn) !== targetAsn) {
          return system;
        }

        return normalizeSystem({
          ...system,
          ...payload,
          asn: parseAsNumber(payload.asn ?? system.asn),
          id: parseAsNumber(payload.asn ?? system.asn)
        });
      }).sort((left, right) => left.asn - right.asn));
    },
    deleteSystem: asn => {
      const targetAsn = normalizeAsn(asn);
      setSystems(current => current.filter(system => normalizeAsn(system.asn) !== targetAsn));
    },
    resetSystems: () => {
      setSystems(initialSystems.map(normalizeSystem));
    }
  }), [systems]);

  return <SystemsContext.Provider value={helpers}>{children}</SystemsContext.Provider>;
}

export function useSystems() {
  const value = useContext(SystemsContext);

  if (!value) {
    throw new Error('useSystems deve ser usado dentro de SystemsProvider.');
  }

  return value;
}