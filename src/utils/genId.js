import crypto from 'crypto';

export const generateId = (
  prefix = '',
  length = 15
) => {

  const random = crypto
    .randomBytes(10)
    .toString('hex')
    .toUpperCase();

  return (
    prefix + random
  ).slice(0, length);

};