const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Electrician',
    },
    status: {
        type: String,
        default: 'open',
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
