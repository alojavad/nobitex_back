const mongoose = require('mongoose');

const udfHistorySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  resolution: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  data: [{
    time: {
      type: Date,
      required: true
    },
    open: {
      type: Number,
      required: true
    },
    high: {
      type: Number,
      required: true
    },
    low: {
      type: Number,
      required: true
    },
    close: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('UDFHistory', udfHistorySchema); 