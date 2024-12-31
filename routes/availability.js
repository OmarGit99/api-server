const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const authenticate = require('../middleware/authenticate');

// POST to add availability slots
router.post('/', authenticate, async (req, res) => {
    const { professor_id, time_slots } = req.body;

    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Only professors can add availability' });
    }

    try {
        const db = getDB();
        const availabilityCollection = db.collection('availability');

        const slots = time_slots.map(slot => ({ professor_id, time_slot: slot }));
        await availabilityCollection.insertMany(slots);

        res.json({ message: 'Availability slots added' });
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err });
    }
});

// GET all availability slots for a professor
router.get('/', authenticate, async (req, res) => {
    const { professor_id } = req.query;

    try {
        const db = getDB();
        const availabilityCollection = db.collection('availability');

        const slots = await availabilityCollection
            .find({ professor_id })
            .project({ time_slot: 1, _id: 0 })
            .toArray();

        res.json({ available_slots: slots.map(s => s.time_slot) });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching availability slots', error: err });
    }
});

module.exports = router;
