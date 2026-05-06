export function normalizeText(value) {
  return String(value || '').trim().toUpperCase();
}

export function getCountryLabel(country) {
  const labels = {
    BR: 'Brasil',
    US: 'Estados Unidos',
    SE: 'Suécia',
    JP: 'Japão'
  };

  return labels[country] || country || 'Desconhecido';
}

export function normalizeAsn(value) {
  const rawValue = String(value || '').trim().toUpperCase();

  if (!rawValue) {
    return 'AS1';
  }

  return rawValue.startsWith('AS') ? rawValue : `AS${rawValue}`;
}

export function parseAsNumber(value) {
  const rawValue = String(value || '').trim().toUpperCase();
  return Number(rawValue.startsWith('AS') ? rawValue.slice(2) : rawValue);
}