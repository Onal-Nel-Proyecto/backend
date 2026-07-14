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

export const formatDateColombia = (fecha, includeTime = false) => {
  if (!fecha) return null;

  const options = {
    timeZone: 'America/Bogota',
  };

  if (includeTime) {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }

  return new Intl.DateTimeFormat('sv-SE', options).format(fecha);
};

export const toTitleCase = (text) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};