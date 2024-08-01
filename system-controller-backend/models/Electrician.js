const mongoose = require('mongoose');

const ElectricianSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    solvedComplaints: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Electrician', ElectricianSchema);
