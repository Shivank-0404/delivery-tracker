const { RateCard } = require('../models');

async function calculateCharge({
  pickupZoneId,
  dropZoneId,
  length,
  breadth,
  height,
  actualWeight,
  orderType,
  paymentType
}) {
  if (!pickupZoneId || !dropZoneId) {
    throw new Error('Could not calculate charges: pickup and drop zones must be identified.');
  }

  // Volumetric weight calculation: (L x B x H) / 5000
  const volumetricWeight = (parseFloat(length) * parseFloat(breadth) * parseFloat(height)) / 5000;
  const billedWeight = Math.max(parseFloat(actualWeight), volumetricWeight);

  // Retrieve matching rate card
  const rateCard = await RateCard.findOne({
    where: {
      order_type: orderType,
      from_zone_id: pickupZoneId,
      to_zone_id: dropZoneId
    }
  });

  if (!rateCard) {
    throw new Error(`No rate card configured for ${orderType} delivery from pickup zone to drop zone.`);
  }

  const basePrice = parseFloat(rateCard.base_price);
  const pricePerKg = parseFloat(rateCard.price_per_kg);
  const codSurchargePct = parseFloat(rateCard.cod_surcharge_pct);

  const deliveryCharge = basePrice + (billedWeight * pricePerKg);
  const codSurcharge = paymentType === 'COD' ? (deliveryCharge * (codSurchargePct / 100)) : 0;
  const totalCharge = deliveryCharge + codSurcharge;

  return {
    volumetricWeight: parseFloat(volumetricWeight.toFixed(3)),
    billedWeight: parseFloat(billedWeight.toFixed(3)),
    deliveryCharge: parseFloat(deliveryCharge.toFixed(2)),
    codSurcharge: parseFloat(codSurcharge.toFixed(2)),
    totalCharge: parseFloat(totalCharge.toFixed(2)),
    rateCardId: rateCard.id
  };
}

module.exports = { calculateCharge };
