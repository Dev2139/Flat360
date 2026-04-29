const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['inside', 'left'],
    default: 'inside'
  }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
