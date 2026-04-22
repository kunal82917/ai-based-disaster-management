const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      default: () => `DS-${Date.now()}`
    },
    type: {
      type: String,
      required: true,
      enum: ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Drought', 'Other'],
      default: 'Other'
    },
    location: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'investigating'],
      default: 'active'
    },
    contact: { type: String, default: '' },
    people: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    reportedBy: { type: String, default: 'Anonymous' },
    reportedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true  // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
