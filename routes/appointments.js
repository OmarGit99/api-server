const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const authenticate = require('../middleware/authenticate');

// POST Booking route. Remove availability slot for professor
router.post('/book', authenticate, async (req, res) => {
    const { professor_id, student_id, time_slot } = req.body;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can book appointments' });
    }

    try {
        const db = getDB();
        const availabilityCollection = db.collection('availability');
        const appointmentsCollection = db.collection('appointments');

        await availabilityCollection.deleteOne({ professor_id, time_slot });
        await appointmentsCollection.insertOne({ professor_id, student_id, time_slot });

        res.json({ message: 'Booked' });
    } catch (err) {
        res.status(500).json({ message: 'Error booking appointment', error: err });
    }
});

// POST cancel appointment route
router.post('/cancel', authenticate, async (req, res) => {
    const { professor_id, student_id, time_slot } = req.body;

    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Only professors can cancel appointments' });
    }

    try {
        const db = getDB();
        const appointmentsCollection = db.collection('appointments');

        await appointmentsCollection.deleteOne({ professor_id, student_id, time_slot });

        res.json({ message: 'Appointment canceled' });
    } catch (err) {
        res.status(500).json({ message: 'Error canceling appointment', error: err });
    }
});

// GET all your appointments (student)
router.get('/mine', authenticate, async (req, res) => {
    const { student_id } = req.query;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can view their booked appointments' });
    }

    try {
        const db = getDB();
        const appointmentsCollection = db.collection('appointments');

        const appointments = await appointmentsCollection
            .find({ student_id })
            .project({ time_slot: 1, _id: 0 })
            .toArray();

        res.json({ appointments: appointments.map(a => a.time_slot) });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching appointments', error: err });
    }
});

module.exports = router;
