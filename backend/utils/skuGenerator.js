const crypto = require('crypto');

/**
 * Generate unique SKU for product
 * Format: CATEGORYCODE-NAMEHASH-XXXX (e.g., ELC-A3F2-0001)
 */
const generateSKU = (category, name, existingCount = 0) => {
  // Generate category code (first 3 letters, uppercase, alphanumeric only)
  const categoryCode = category
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(3, 'X');
  
  // Generate name hash (first 4 characters of MD5 hash)
  const nameHash = crypto
    .createHash('md5')
    .update(name.toLowerCase())
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  
  // Generate sequence number
  const sequence = String(existingCount + 1).padStart(4, '0');
  
  return `${categoryCode}-${nameHash}-${sequence}`;
};

module.exports = { generateSKU };
