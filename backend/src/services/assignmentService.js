const { User } = require('../models');

// Haversine formula to compute distance between two points in km
function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 999999; // Fallback large distance
  }
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function assignAgent({ pickupZoneId, pickupLat, pickupLng }) {
  // 1. Fetch all available agents
  const availableAgents = await User.findAll({
    where: {
      role: 'agent',
      is_available: true
    }
  });

  if (availableAgents.length === 0) {
    throw new Error('No available delivery agents found.');
  }

  // 2. Priority 1: Agents assigned to the pickup zone
  let candidates = availableAgents.filter(agent => agent.zone_id === pickupZoneId);

  // If no available agents in the same zone, expand search to all available agents
  if (candidates.length === 0) {
    candidates = availableAgents;
  }

  // 3. Compute distance and select the closest agent
  let bestAgent = null;
  let minDistance = Infinity;

  for (const agent of candidates) {
    const dist = haversine(agent.lat, agent.lng, pickupLat, pickupLng);
    if (dist < minDistance) {
      minDistance = dist;
      bestAgent = agent;
    }
  }

  // If still no agent (should not happen if candidates is non-empty), select first candidate
  if (!bestAgent && candidates.length > 0) {
    bestAgent = candidates[0];
  }

  return bestAgent;
}

module.exports = { assignAgent, haversine };
