// Performance Form Schema
const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  date: { type: String, required: true },
  employeeId: { type: String, required: true },
  location: { type: String, required: true },
  department: { type: String, required: true },

  // Reservations
  reservations: {
    bookingRequestsProcessed: Number,
    confirmationsUpdated: Number,
    cancellations: Number,
    amendmentsMade: Number,
    reconfirmationsMade: Number,
    remarks: String,
  },

  // Taj/Bhutan
  tajBhutan: {
    bhutanAirBookingProcessed: Number,
    confirmedBhutanAirTickets: Number,
    tajHotelsBookingProcessed: Number,
    confirmedBookings: Number,
    cancellations: Number,
    amendmentsMade: Number,
    reconfirmationsMade: Number,
    remarks: String,
  },

  // Sales Online
  salesOnline: {
    enquiriesReceived: Number,
    conversions: Number,
    followUpsTaken: Number,
    cancellations: Number,
    remarks: String,
  },

  // Sales Group
  salesGroup: {
    enquiriesReceived: Number,
    conversionsMade: Number,
    followUpsTaken: Number,
    cancellations: Number,
    amendmentsMade: Number,
    remarks: String,
  },

  // IT
  it: {
    entriesMade: Number,
    amendmentsMade: Number,
    callsOrEmailsMade: Number,
    creativesMade: Number,
    remarks: String,
  },

  // HR
  hr: {
    interviewsTaken: Number,
    jobOffersExtended: Number,
    leaveRequestsReceived: Number,
    grievancesAddressed: Number,
    salaryProcessing: Number,
    payrollProcessing: Number,
    exitInterviewsConducted: String,
    retentionEffortsMade: String,
    remarks: String,
  },

  // Accounts
  accounts: {
    customerPaymentsProcessed: Number,
    taxFilingsPreparedReviewed: Number,
    transactionsRecorded: Number,
    vendorInvoicesProcessed: Number,
    remarks: String,
  },

  // Graphic Designer
  graphicDesignerSummary: String,

  // Others
  othersSummary: String,
});

module.exports = mongoose.model('Performance', performanceSchema);
