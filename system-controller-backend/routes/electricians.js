const express = require('express');
const router = express.Router();
const Electrician = require('../models/Electrician');
const Complaint = require('../models/Complaint'); // Make sure to import the Complaint model

// Add an electrician
// Add an electrician
router.post('/', async (req, res) => {
    const { name, mobile, category } = req.body;

    try {
        const newElectrician = new Electrician({ name, mobile, category });
        const electrician = await newElectrician.save();
        res.json(electrician);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Get all electricians
router.get('/', async (req, res) => {
    try {
        const electricians = await Electrician.find();
        res.json(electricians);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all electricians with the count of solved complaints
router.get('/withSolvedCount', async (req, res) => {
    try {
        const electricians = await Electrician.find();
        const electriciansWithSolvedCount = await Promise.all(electricians.map(async electrician => {
            const solvedCount = await Complaint.countDocuments({ assignedTo: electrician._id, status: 'closed' });
            return { ...electrician.toObject(), solvedCount };
        }));
        res.json(electriciansWithSolvedCount);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Assuming this is in your routes file
router.put('/complaints/:id/close', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ msg: 'Complaint not found' });
        }

        // Update the complaint status to 'closed'
        complaint.status = 'closed';
        await complaint.save();

        // Update the solved count for the assigned electrician
        const electrician = await Electrician.findById(complaint.assignedTo);
        if (electrician) {
            electrician.solvedCount = (electrician.solvedCount || 0) + 1;
            await electrician.save();
        }

        res.json({ complaint, electrician });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Delete an electrician
router.delete('/:id', async (req, res) => {
    try {
        const electrician = await Electrician.findById(req.params.id);
        if (!electrician) {
            return res.status(404).json({ msg: 'Electrician not found' });
        }

        await Electrician.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Electrician removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
