const mongoose = require('mongoose');

const udfHistorySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  resolution: {
    type: String,
    required: true,
  },
  from: {
    type: Number, // Use Number for Unix timestamps
    required: true,
  },
  to: {
    type: Number, // Use Number for Unix timestamps
    required: true,
  },
  timestamps: [
    {
      type: Number, // Array of Unix timestamps
      required: true,
    },
  ],
  open: [
    {
      type: Number, // Array of open prices
      required: true,
    },
  ],
  high: [
    {
      type: Number, // Array of high prices
      required: true,
    },
  ],
  low: [
    {
      type: Number, // Array of low prices
      required: true,
    },
  ],
  close: [
    {
      type: Number, // Array of close prices
      required: true,
    },
  ],
  volume: [
    {
      type: Number, // Array of volumes
      required: true,
    },
  ],
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Index for faster queries
udfHistorySchema.index({ symbol: 1, resolution: 1, from: -1, to: -1 });

module.exports = mongoose.model('UDFHistory', udfHistorySchema);