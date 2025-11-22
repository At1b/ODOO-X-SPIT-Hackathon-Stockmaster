const bwipjs = require('bwip-js');

const generateBarcode = async (sku) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: sku,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    return `data:image/png;base64,${png.toString('base64')}`;
  } catch (error) {
    console.error('Barcode generation error:', error);
    return null;
  }
};

module.exports = { generateBarcode };
