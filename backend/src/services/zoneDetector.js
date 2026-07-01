const { ZoneArea } = require('../models');

async function detectZone(address) {
  if (!address) return null;
  const areas = await ZoneArea.findAll();
  const lowerAddress = address.toLowerCase();
  
  for (const area of areas) {
    if (lowerAddress.includes(area.area_keyword.toLowerCase())) {
      return area.zone_id;
    }
  }
  return null;
}

module.exports = { detectZone };
