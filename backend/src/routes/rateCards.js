const express = require('express');
const router = express.Router();
const rateCardController = require('../controllers/rateCardController');
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * @swagger
 * tags:
 *   name: Rate Cards
 *   description: Delivery pricing configuration APIs
 */

router.use(auth, roleGuard('admin'));

/**
 * @swagger
 * /api/rate-cards:
 *   get:
 *     summary: Get all delivery rate cards
 *     description: Returns all configured delivery pricing rules along with source and destination zone names.
 *     tags: [Rate Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all rate cards
 */
router.get('/', rateCardController.listRateCards);

/**
 * @swagger
 * /api/rate-cards:
 *   post:
 *     summary: Create a new rate card
 *     description: Creates a delivery pricing rule for a specific order type and zone pair.
 *     tags: [Rate Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_type
 *               - from_zone_id
 *               - to_zone_id
 *               - base_price
 *               - price_per_kg
 *             properties:
 *               order_type:
 *                 type: string
 *                 enum:
 *                   - B2B
 *                   - B2C
 *                 example: B2C
 *
 *               from_zone_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3d671553-07f2-4975-b3e3-23cb65a98b81
 *
 *               to_zone_id:
 *                 type: string
 *                 format: uuid
 *                 example: a171f69e-82bf-41c7-b5ab-1241cbd8b029
 *
 *               base_price:
 *                 type: number
 *                 example: 60
 *
 *               price_per_kg:
 *                 type: number
 *                 example: 20
 *
 *               cod_surcharge_pct:
 *                 type: number
 *                 example: 5
 *
 *     responses:
 *       201:
 *         description: Rate card created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', rateCardController.createRateCard);

/**
 * @swagger
 * /api/rate-cards/{id}:
 *   put:
 *     summary: Update an existing rate card
 *     description: Updates pricing information for an existing rate card.
 *     tags: [Rate Cards]
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
 *               order_type:
 *                 type: string
 *                 enum:
 *                   - B2B
 *                   - B2C
 *
 *               from_zone_id:
 *                 type: string
 *                 format: uuid
 *
 *               to_zone_id:
 *                 type: string
 *                 format: uuid
 *
 *               base_price:
 *                 type: number
 *
 *               price_per_kg:
 *                 type: number
 *
 *               cod_surcharge_pct:
 *                 type: number
 *
 *     responses:
 *       200:
 *         description: Rate card updated successfully
 *       404:
 *         description: Rate card not found
 */
router.put('/:id', rateCardController.updateRateCard);

/**
 * @swagger
 * /api/rate-cards/{id}:
 *   delete:
 *     summary: Delete a rate card
 *     description: Deletes a delivery pricing rule.
 *     tags: [Rate Cards]
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
 *         description: Rate card deleted successfully
 *       404:
 *         description: Rate card not found
 */
router.delete('/:id', rateCardController.deleteRateCard);

module.exports = router;