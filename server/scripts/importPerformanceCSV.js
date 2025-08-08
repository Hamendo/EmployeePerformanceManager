// File: server/scripts/importPerformanceCSV.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Performance = require('../models/Performance'); // adjust path if needed
require('dotenv').config(); // Load DB connection from env

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// CSV File path
const csvFilePath = path.join(__dirname, 'performance_data.csv'); // Replace with your downloaded file

function parseBooleanOrString(input) {
  if (!input) return input;
  const val = input.trim().toLowerCase();
  if (val === 'yes') return 'Yes';
  if (val === 'no') return 'No';
  return input;
}

function parseDate(value) {
  const d = new Date(value);
  return isNaN(d) ? new Date() : d;
}

function parseNumber(value) {
  const n = Number(value);
  return isNaN(n) ? null : n;
}

async function importCSV() {
  const rows = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', async () => {
      console.log(`Read ${rows.length} rows from CSV.`);
      for (const row of rows) {
        try {
          const entry = new Performance({
            timestamp: row['Timestamp'] ? parseDate(row['Timestamp']) : new Date(),
            date: row['Date'],
            employeeId: row['Employee ID'],
            location: row['Location'],
            department: row['Department'],

            reservations: {
              bookingRequestsProcessed: parseNumber(row['Reservations - No of Booking Requests Processed ']),
              confirmationsUpdated: parseNumber(row['Reservations - No of Confirmations Updated']),
              cancellations: parseNumber(row['Reservations - No of Cancellations ']),
              amendmentsMade: parseNumber(row['Reservations - No. of Amendments Made ']),
              reconfirmationsMade: parseNumber(row['Reservations - No of Reconfirmations Made ']),
              remarks: row['Reservations - Remarks '],
            },

            tajBhutan: {
              bhutanAirBookingProcessed: parseNumber(row['Taj/Bhutan - No. of Bhutan Air Booking Processed ']),
              confirmedBhutanAirTickets: parseNumber(row['Taj/Bhutan - No of Confirmed Bhutan Air Tickets ']),
              tajHotelsBookingProcessed: parseNumber(row['Taj/Bhutan - No of Taj Hotels Booking Processed ']),
              confirmedBookings: parseNumber(row['Taj/Bhutan - No of Confirmed bookings ']),
              cancellations: parseNumber(row['Taj/Bhutan - No of Cancellations ']),
              amendmentsMade: parseNumber(row['Taj/Bhutan - No of Amendments made']),
              reconfirmationsMade: parseNumber(row['Taj/Bhutan - No of Reconfirmations made']),
              remarks: row['Taj/Bhutan - Remarks '],
            },

            salesOnline: {
              enquiriesReceived: parseNumber(row['Sales Online - No of Enquiries Received ']),
              conversions: parseNumber(row['Sales Online - No of Conversions ']),
              followUpsTaken: parseNumber(row['Sales Online - No of Follow‑Ups Taken ']),
              cancellations: parseNumber(row['Sales Online - No of Cancellations ']),
              remarks: row['Sales Online - Remarks '],
            },

            salesGroup: {
              enquiriesReceived: parseNumber(row['Sales Group - No of Enquiries Received ']),
              conversionsMade: parseNumber(row['Sales Group - No of Conversions Made ']),
              followUpsTaken: parseNumber(row['Sales Group - No of Follow‑Ups Taken ']),
              cancellations: parseNumber(row['Sales Group - No of Cancellations ']),
              amendmentsMade: parseNumber(row['Sales Group - No of Amendments Made ']),
              remarks: row['Sales Group - Remarks '],
            },

            it: {
              entriesMade: parseNumber(row['IT - No of Entries Made ']),
              amendmentsMade: parseNumber(row['IT - No. of Amendments Made ']),
              callsOrEmailsMade: parseNumber(row['IT - No of Calls/Emails Made ']),
              creativesMade: parseNumber(row['IT - No of Creatives Made ']),
              remarks: row['IT - Remarks '],
            },

            hr: {
              interviewsTaken: parseNumber(row['HR - Number of Interviews Taken ']),
              jobOffersExtended: parseNumber(row['HR - Number of Job Offers Extended ']),
              leaveRequestsReceived: parseNumber(row['HR - How many Leave Requests Received Today ']),
              grievancesAddressed: parseNumber(row['HR - Number of Employee Grievances Addressed ']),
              salaryProcessing: parseNumber(row['HR - Number of Salary Processing ']),
              payrollProcessing: parseNumber(row['HR - Payroll Processing ']),
              exitInterviewsConducted: parseBooleanOrString(row['HR - Were any Exit Interviews Conducted Today ']),
              retentionEffortsMade: parseBooleanOrString(row['HR - Were any Retention Efforts Made (at risk of leaving) ']),
              remarks: row['HR - Remarks '],
            },

            accounts: {
              customerPaymentsProcessed: parseNumber(row['Accounts - Number of Customer Payments Processed ']),
              taxFilingsPreparedReviewed: parseNumber(row['Accounts - Number of Tax Filings Prepared/Reviewed ']),
              transactionsRecorded: parseNumber(row['Accounts - Number of transactions recorded in the accounting system']),
              vendorInvoicesProcessed: parseNumber(row['Accounts - Number of vendor invoices processed']),
              remarks: row['Accounts - Remarks '],
            },

            graphicDesignerSummary: row['Graphic Designer - Give a summary for the day'],
            othersSummary: row['Others - Give a summary for the day'],
          });

          await entry.save();
          console.log(`Imported: ${entry.employeeId} | ${entry.date}`);
        } catch (err) {
          console.error('Error inserting row:', err.message);
        }
      }
      console.log('CSV import completed.');
      mongoose.disconnect();
    });
}

importCSV();
