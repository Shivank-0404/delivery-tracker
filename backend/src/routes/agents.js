const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: Delivery Agent Management APIs
 */

router.use(auth, roleGuard('admin'));

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all delivery agents
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all delivery agents
 */
router.get('/', agentController.listAgents);

/**
 * @swagger
 * /api/agents/{id}/availability:
 *   put:
 *     summary: Update agent availability
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_available
 *             properties:
 *               is_available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Agent availability updated successfully
 *       404:
 *         description: Agent not found
 */
router.put('/:id/availability', agentController.updateAvailability);

module.exports = router;