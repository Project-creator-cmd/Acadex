const mongoose = require('mongoose');

const scoringRuleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  basePoints: {
    type: Number,
    required: true
  },
  levelMultipliers: {
    college: { type: Number, default: 1 },
    state: { type: Number, default: 1.5 },
    national: { type: Number, default: 2 },
    international: { type: Number, default: 3 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScoringRule', scoringRuleSchema);
