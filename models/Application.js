const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  currentAddress: {
    address: String,
    city: String,
    state: String,
    zip: String
  },
  previousAddresses: [
    {
      address: String,
      city: String,
      state: String,
      zip: String
    }
  ],
  medical: {
    isCurrent: Boolean
  },
  currentEmployer: {
    from: String,
    to: String,
    employer: String,
    position: String,
    phone: String,
    address: String,
    reason: String,
    fmcsr: String,
    dotDrugTest: String
  },
  previousEmployers: [
    {
      from: String,
      to: String,
      employer: String,
      position: String,
      phone: String,
      address: String,
      reason: String,
      fmcsr: String,
      dotDrugTest: String
    }
  ],
  drivingExperience: {
    equipment: Object,
    statesOperated: String,
    courses: [String],
    awards: [String]
  },
  accidentRecords: [Object],
  trafficConvictions: [Object],
  licenseHistory: [Object],
  disclosures: [Object],
  references: [Object],
  declaration: {
    signature: String,
    date: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);