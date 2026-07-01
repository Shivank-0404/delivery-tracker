const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Zone and Area Management APIs
 */

router.use(auth, roleGuard('admin'));

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all delivery zones
 */
router.get('/', zoneController.listZones);

/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Create a new zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: North Zone
 *     responses:
 *       201:
 *         description: Zone created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', zoneController.createZone);

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Update an existing zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated North Zone
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       404:
 *         description: Zone not found
 */
router.put('/:id', zoneController.updateZone);

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Delete a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Zone deleted successfully
 *       404:
 *         description: Zone not found
 */
router.delete('/:id', zoneController.deleteZone);

/**
 * @swagger
 * /api/zones/{id}/areas:
 *   post:
 *     summary: Add an area to a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - area_keyword
 *             properties:
 *               area_keyword:
 *                 type: string
 *                 example: Connaught Place
 *     responses:
 *       201:
 *         description: Area added successfully
 */
router.post('/:id/areas', zoneController.addArea);

/**
 * @swagger
 * /api/zones/{id}/areas/{areaId}:
 *   delete:
 *     summary: Remove an area from a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Area removed successfully
 *       404:
 *         description: Area not found
 */
router.delete('/:id/areas/:areaId', zoneController.removeArea);

module.exports = router;