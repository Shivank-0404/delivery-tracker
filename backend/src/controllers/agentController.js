const { User, Zone } = require('../models');

async function listAgents(req, res) {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: {
        exclude: ['password_hash', 'createdAt', 'updatedAt']
      },
      include: [
        {
          model: Zone,
          as: 'zone',
          attributes: ['name']
        }
      ]
    });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateAvailability(req, res) {
  try {
    const { is_available } = req.body;
    if (is_available === undefined) {
      return res.status(400).json({ error: 'is_available boolean is required.' });
    }

    const agent = await User.findOne({ where: { id: req.params.id, role: 'agent' } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }

    await agent.update({ is_available });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listAgents,
  updateAvailability
};
