import Airtable from 'airtable';
import emailjs from 'emailjs-com';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_DAILY_SUMMARY_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('EquipTracker');

export async function sendDailySummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's checkouts from Airtable
    const checkoutsRecords = await base('Checkouts').select({
      filterByFormula: `DATESTR(createdAt) = '${today.toISOString().split('T')[0]}'`
    }).all();

    const todayCheckouts = checkoutsRecords.map(record => record.fields);

    // Fetch today's checkins from Airtable
    const checkinsRecords = await base('Checkins').select({
      filterByFormula: `DATESTR(createdAt) = '${today.toISOString().split('T')[0]}'`
    }).all();

    const todayCheckins = checkinsRecords.map(record => record.fields);

    // Format the summary
    const summaryParams = {
      date: today.toLocaleDateString(),
      checkouts: todayCheckouts.map(c => 
        `Unit: ${c.unit} - Customer: ${c.customerName} - Job Site: ${c.jobSite}`
      ).join('\n'),
      checkins: todayCheckins.map(c => 
        `Unit: ${c.unit} - Hours/Miles: ${c.hoursMiles}`
      ).join('\n'),
      total_checkouts: todayCheckouts.length,
      total_checkins: todayCheckins.length
    };

    // Add recipient email to the summary parameters
    const emailParams = {
      ...summaryParams,
      to_email: import.meta.env.VITE_SUMMARY_EMAIL_RECIPIENT,
      subject: `Equipment Daily Summary - ${today.toLocaleDateString()}`
    };

    // Send summary email
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams,
      EMAILJS_USER_ID
    );

    console.log('Daily summary sent successfully');
  } catch (error) {
    console.error("Error sending daily summary:", error);
  }
}

// Run summary at 11:59 PM every day
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 23 && now.getMinutes() === 59) {
    sendDailySummary();
  }
}, 60000); // Check every minute