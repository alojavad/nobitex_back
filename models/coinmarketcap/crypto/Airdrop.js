const mongoose = require('mongoose');

const AirdropSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Airdrop Unique ID from CoinMarketCap
  projectName: { type: String, required: true }, // Project name of the airdrop
  description: { type: String, required: true }, // Description of the airdrop
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'ENDED'], required: true }, // Status of the airdrop
  coin: {
    id: { type: Number, required: true }, // CoinMarketCap coin ID
    name: { type: String, required: true }, // Name of the coin
    slug: { type: String, required: true }, // Slug of the coin
    symbol: { type: String, required: true }, // Symbol of the coin
  },
  startDate: { type: Date, required: true }, // Start date of the airdrop
  endDate: { type: Date, required: true }, // End date of the airdrop
  totalPrize: { type: Number, required: true }, // Total prize of the airdrop
  winnerCount: { type: Number, required: true }, // Number of winners
  link: { type: String, required: true }, // Link to the airdrop details
  lastUpdated: { type: Date, default: Date.now }, // Last updated timestamp
});

// Indexes for faster queries
AirdropSchema.index({ id: 1 }); // Index for the unique ID
AirdropSchema.index({ status: 1 });
AirdropSchema.index({ 'coin.id': 1 });
AirdropSchema.index({ 'coin.slug': 1 });
AirdropSchema.index({ 'coin.symbol': 1 });
AirdropSchema.index({ startDate: 1 });
AirdropSchema.index({ endDate: 1 });

// Method to format the response
AirdropSchema.methods.toJSON = function () {
  const airdrop = this.toObject();
  delete airdrop._id;
  delete airdrop.__v;
  return airdrop;
};

module.exports = mongoose.model('Airdrop', AirdropSchema);