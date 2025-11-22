/**
 * Generate unique SKU for product
 * Format: CAT-XXXXX (e.g., ELC-00001)
 */
const generateSKU = (categoryName, existingCount = 0) => {
  const prefix = categoryName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  const number = String(existingCount + 1).padStart(5, '0');
  return `${prefix}-${number}`;
};

module.exports = { generateSKU };
