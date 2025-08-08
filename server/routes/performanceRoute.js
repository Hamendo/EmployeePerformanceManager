const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');

function flattenSection(section, mapping) {
  const flat = {};
  if (!section) return flat;
  for (const [key, label] of Object.entries(mapping)) {
    flat[label] = section[key] ?? '';
  }
  return flat;
}

router.get('/', async (req, res) => {
  try {
    const { empId, department, date } = req.query;
    const filter = {};
    if (empId) filter.employeeId = empId;
    if (department) filter.department = department;
    if (date) filter.date = date;

    const data = await Performance.find(filter).lean();

    const formatted = data.map(doc => ({
      employeeId: doc.employeeId,
      department: doc.department,
      date: doc.date,
      location: doc.location,
      ...flattenSection(doc.reservations, {
        bookingRequestsProcessed: 'Reservations - No of Booking Requests Processed ',
        confirmationsUpdated: 'Reservations - No of Confirmations Updated',
        cancellations: 'Reservations - No of Cancellations ',
        amendmentsMade: 'Reservations - No. of Amendments Made ',
        reconfirmationsMade: 'Reservations - No of Reconfirmations Made ',
        remarks: 'Reservations - Remarks ',
      }),
      ...flattenSection(doc.tajBhutan, {
        bhutanAirBookingProcessed: 'Taj/Bhutan - No. of Bhutan Air Booking Processed ',
        confirmedBhutanAirTickets: 'Taj/Bhutan - No of Confirmed Bhutan Air Tickets ',
        tajHotelsBookingProcessed: 'Taj/Bhutan - No of Taj Hotels Booking Processed ',
        confirmedBookings: 'Taj/Bhutan - No of Confirmed bookings ',
        cancellations: 'Taj/Bhutan - No of Cancellations ',
        amendmentsMade: 'Taj/Bhutan - No of Amendments made',
        reconfirmationsMade: 'Taj/Bhutan - No of Reconfirmations made',
        remarks: 'Taj/Bhutan - Remarks ',
      }),
      ...flattenSection(doc.salesOnline, {
        enquiriesReceived: 'Sales Online - No of Enquiries Received ',
        conversions: 'Sales Online - No of Conversions ',
        followUpsTaken: 'Sales Online - No of Follow‑Ups Taken ',
        cancellations: 'Sales Online - No of Cancellations ',
        remarks: 'Sales Online - Remarks ',
      }),
      ...flattenSection(doc.salesGroup, {
        enquiriesReceived: 'Sales Group - No of Enquiries Received ',
        conversionsMade: 'Sales Group - No of Conversions Made ',
        followUpsTaken: 'Sales Group - No of Follow‑Ups Taken ',
        cancellations: 'Sales Group - No of Cancellations ',
        amendmentsMade: 'Sales Group - No of Amendments Made ',
        remarks: 'Sales Group - Remarks ',
      }),
      ...flattenSection(doc.it, {
        entriesMade: 'IT - No of Entries Made ',
        amendmentsMade: 'IT - No. of Amendments Made ',
        callsOrEmailsMade: 'IT - No of Calls/Emails Made ',
        creativesMade: 'IT - No of Creatives Made ',
        remarks: 'IT - Remarks ',
      }),
      ...flattenSection(doc.hr, {
        interviewsTaken: 'HR - Number of Interviews Taken ',
        jobOffersExtended: 'HR - Number of Job Offers Extended ',
        leaveRequestsReceived: 'HR - How many Leave Requests Received Today ',
        grievancesAddressed: 'HR - Number of Employee Grievances Addressed ',
        salaryProcessing: 'HR - Number of Salary Processing ',
        payrollProcessing: 'HR - Payroll Processing ',
        exitInterviewsConducted: 'HR - Were any Exit Interviews Conducted Today ',
        retentionEffortsMade: 'HR - Were any Retention Efforts Made (at risk of leaving) ',
        remarks: 'HR - Remarks ',
      }),
      ...flattenSection(doc.accounts, {
        customerPaymentsProcessed: 'Accounts - Number of Customer Payments Processed ',
        taxFilingsPreparedReviewed: 'Accounts - Number of Tax Filings Prepared/Reviewed ',
        transactionsRecorded: 'Accounts - Number of transactions recorded in the accounting system',
        vendorInvoicesProcessed: 'Accounts - Number of vendor invoices processed',
        remarks: 'Accounts - Remarks ',
      }),
      'Graphic Designer - Give a summary for the day': doc.graphicDesignerSummary ?? '',
      'Others - Give a summary for the day': doc.othersSummary ?? '',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
});

module.exports = router;
