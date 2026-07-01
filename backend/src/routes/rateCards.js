const express = require('express');
const router = express.Router();
const rateCardController = require('../controllers/rateCardController');
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * @swagger
 * tags:
 *   name: Rate Cards
 *   description: Delivery Rate Card Management APIs
 */

router.use(auth, roleGuard('admin'));

/**
 * @swagger
 * /api/rate-cards:
 *   get:
 *     summary: Get all rate cards
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
 *               - zone_id
 *               - order_type
 *               - weight_min
 *               - weight_max
 *               - price
 *             properties:
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3d671553-07f2-4975-b3e3-23cb65a98b81
 *               order_type:
 *                 type: string
 *                 enum: [B2B, B2C]
 *                 example: B2C
 *               weight_min:
 *                 type: number
 *                 example: 0
 *               weight_max:
 *                 type: number
 *                 example: 5
 *               price:
 *                 type: number
 *                 example: 110
 *     responses:
 *       201:
 *         description: Rate card created successfully
 */
router.post('/', rateCardController.createRateCard);

/**
 * @swagger
 * /api/rate-cards/{id}:
 *   put:
 *     summary: Update an existing rate card
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