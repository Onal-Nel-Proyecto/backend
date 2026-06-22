export const normalizeEmptyStrings = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === '') {
      obj[key] = null;
    }

    // si viene un objeto anidado
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      normalizeEmptyStrings(obj[key]);
    }
  });

  return obj;
};

export const formatDateColombia = (fecha) => {
  if (!fecha) return null;

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Bogota'
  }).format(fecha);
};

export const toTitleCase = (text) => {
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};