const crypto = require('crypto');

/**
 * Generate SKU per spec: CATEGORYCODE-NAMEHASH-RANDOM4DIGIT
 */
function generateSKU(category, name) {
  const categoryCode = (category || '')
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(3, 'X');

  const nameHash = crypto
    .createHash('md5')
    .update((name || '').toLowerCase())
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();

  const random4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `${categoryCode}-${nameHash}-${random4}`;
}

module.exports = { generateSKU };
