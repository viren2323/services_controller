const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Electrician = require('../models/Electrician');

 
 


// Add a complaint and assign to an available electrician of the same category
// router.post('/', async (req, res) => {
//     const { category, text, customerName, address } = req.body;

//     try {
//         const complaint = new Complaint({
//             category,
//             text,
//             customerName,
//             address,
//         });

//         const electricians = await Electrician.find({ category });

//         if (electricians.length === 0) {
//             return res.status(400).json({ msg: 'No electricians available for this category' });
//         }

//         const zeroComplaintElectricians = electricians.filter(e => e.solvedComplaints === 0);
//         let assignedElectrician;
        
//         if (zeroComplaintElectricians.length > 0) {
//             assignedElectrician = zeroComplaintElectricians[0];
//         } else {
//             const electricianComplaints = await Promise.all(electricians.map(async (electrician) => {
//                 const openComplaintsCount = await Complaint.countDocuments({ assignedTo: electrician._id, status: 'open' });
//                 return { ...electrician.toObject(), openComplaintsCount };
//             }));
//             assignedElectrician = electricianComplaints.sort((a, b) => a.openComplaintsCount - b.openComplaintsCount)[0];
//         }

//         complaint.assignedTo = assignedElectrician._id;
//         await complaint.save();

//         res.json(complaint);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });



// Create a new complaint and auto-assign to the available electrician with minimum complaints in the same category
router.post('/', async (req, res) => {
    try {
        const { category, text, customerName, address } = req.body;
        
        // Find electricians in the same category
        const electricians = await Electrician.find({ category });
        
        // Sort electricians by the number of assigned complaints (ascending)
        electricians.sort((a, b) => a.solvedComplaints - b.solvedComplaints);

        let assignedElectrician = null;
        if (electricians.length > 0) {
            assignedElectrician = electricians[0];
        }

        const newComplaint = new Complaint({
            category,
            text,
            customerName,
            address,
            assignedTo: assignedElectrician ? assignedElectrician._id : null,
            status: 'open'
        });

        await newComplaint.save();

        if (assignedElectrician) {
            assignedElectrician.solvedComplaints += 1;
            await assignedElectrician.save();
        }

        res.json(newComplaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all complaints
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('assignedTo', ['name']);
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

 
// Update complaint status to closed and increment solved complaints count for the assigned electrician
router.put('/:id/close', async (req, res) => {
    try {
        let complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ msg: 'Complaint not found' });
        }

        complaint.status = 'closed';
        await complaint.save();

        // Increment solved complaint count for assigned electrician
        const electrician = await Electrician.findById(complaint.assignedTo);
        if (electrician) {
            electrician.solvedComplaints += 1;
            await electrician.save();
        }

        res.json({ msg: 'Complaint closed and solved count updated', complaint, electrician });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

 
// Get complaints assigned to a specific electrician
router.get('/assigned/:electricianId', async (req, res) => {
    try {
        const complaints = await Complaint.find({ assignedTo: req.params.electricianId });
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a complaint
router.delete('/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ msg: 'Complaint not found' });
        }

        await Complaint.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Complaint removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
 
module.exports = router;
