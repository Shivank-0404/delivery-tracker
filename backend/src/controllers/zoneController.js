const { Zone, ZoneArea } = require('../models');

async function listZones(req, res) {
  try {
    const zones = await Zone.findAll({
      include: [{ model: ZoneArea, as: 'areas' }]
    });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createZone(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Zone name is required.' });
    }
    const zone = await Zone.create({ name, description });
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateZone(req, res) {
  try {
    const { name, description } = req.body;
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }
    await zone.update({ name, description });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteZone(req, res) {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }
    await zone.destroy();
    res.json({ message: 'Zone deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addArea(req, res) {
  try {
    const { area_keyword } = req.body;
    if (!area_keyword) {
      return res.status(400).json({ error: 'Area keyword is required.' });
    }
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }
    const area = await ZoneArea.create({
      zone_id: zone.id,
      area_keyword
    });
    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function removeArea(req, res) {
  try {
    const area = await ZoneArea.findOne({
      where: {
        id: req.params.areaId,
        zone_id: req.params.id
      }
    });
    if (!area) {
      return res.status(404).json({ error: 'Zone area association not found.' });
    }
    await area.destroy();
    res.json({ message: 'Area keyword removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listZones,
  createZone,
  updateZone,
  deleteZone,
  addArea,
  removeArea
};
