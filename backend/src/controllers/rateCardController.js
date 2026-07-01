const { RateCard, Zone } = require('../models');

async function listRateCards(req, res) {
  try {
    const rateCards = await RateCard.findAll({
      include: [
        { model: Zone, as: 'fromZone', attributes: ['name'] },
        { model: Zone, as: 'toZone', attributes: ['name'] }
      ]
    });
    res.json(rateCards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createRateCard(req, res) {
  try {
    const { order_type, from_zone_id, to_zone_id, base_price, price_per_kg, cod_surcharge_pct } = req.body;
    
    if (!order_type || !from_zone_id || !to_zone_id || base_price === undefined || price_per_kg === undefined) {
      return res.status(400).json({ error: 'order_type, from_zone_id, to_zone_id, base_price, and price_per_kg are required.' });
    }

    const rateCard = await RateCard.create({
      order_type,
      from_zone_id,
      to_zone_id,
      base_price,
      price_per_kg,
      cod_surcharge_pct: cod_surcharge_pct || 0
    });
    res.status(201).json(rateCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateRateCard(req, res) {
  try {
    const { order_type, from_zone_id, to_zone_id, base_price, price_per_kg, cod_surcharge_pct } = req.body;
    const rateCard = await RateCard.findByPk(req.params.id);
    if (!rateCard) {
      return res.status(404).json({ error: 'Rate card not found.' });
    }
    await rateCard.update({
      order_type,
      from_zone_id,
      to_zone_id,
      base_price,
      price_per_kg,
      cod_surcharge_pct
    });
    res.json(rateCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteRateCard(req, res) {
  try {
    const rateCard = await RateCard.findByPk(req.params.id);
    if (!rateCard) {
      return res.status(404).json({ error: 'Rate card not found.' });
    }
    await rateCard.destroy();
    res.json({ message: 'Rate card deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listRateCards,
  createRateCard,
  updateRateCard,
  deleteRateCard
};
