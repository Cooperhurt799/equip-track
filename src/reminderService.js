import emailjs from 'emailjs-com';
import Airtable from 'airtable';

const EMAILJS_SERVICE_ID = "service_fimxodg";
const EMAILJS_TEMPLATE_ID = "template_bxx6jfh";
const EMAILJS_USER_ID = "wyfCLJgbJeNcu3092";

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('appWJ4F5x70p3NMms');

const EMAILJS_SERVICE_ID_SUMMARY = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_SUMMARY = import.meta.env.VITE_EMAILJS_DAILY_SUMMARY_TEMPLATE_ID;
const EMAILJS_USER_ID_SUMMARY = import.meta.env.VITE_EMAILJS_USER_ID;

export const checkForDueReturns = async () => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const records = await base('Checkouts').select({
      filterByFormula: `AND(returnDate <= '${today.toISOString()}', status = 'active')`
    }).all();

    const promises = records.map(record => {
      const checkout = record.fields;
      return sendReminderEmail(checkout).catch(err => {
        console.error(`Failed to send reminder for checkout ${record.id}:`, err);
      });
    });

    await Promise.all(promises);
    console.log(`Processed ${records.length} due returns`);
  } catch (error) {
    console.error('Error checking for due returns:', error);
    throw error;
  }
};

const sendReminderEmail = async (checkout) => {
  if (!checkout.customerEmail || !checkout.customerName || !checkout.unit || !checkout.returnDate) {
    const error = new Error('Missing required fields for email');
    error.checkout = checkout;
    throw error;
  }

  const templateParams = {
    to_email: checkout.customerEmail.trim(),
    customer_name: checkout.customerName.trim(),
    unit: checkout.unit.trim(),
    return_date: new Date(checkout.returnDate).toLocaleDateString(),
    job_site: checkout.jobSite?.trim() || 'N/A'
  };

  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    console.log(`Email sent successfully to ${templateParams.to_email}`);
    return result;
  } catch (err) {
    console.error('Failed to send reminder email:', err);
    throw err;
  }
};

export async function sendDailySummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const checkoutsRecords = await base('Checkouts').select({
      filterByFormula: `AND(
        createdAt >= '${startOfDay.toISOString()}',
        createdAt <= '${endOfDay.toISOString()}'
      )`
    }).all();

    const todayCheckouts = checkoutsRecords.map(record => record.fields);

    const checkinsRecords = await base('Checkins').select({
      filterByFormula: `DATESTR(createdAt) = '${today.toISOString().split('T')[0]}'`
    }).all();

    const todayCheckins = checkinsRecords.map(record => record.fields);

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

    const emailParams = {
      ...summaryParams,
      to_email: import.meta.env.VITE_SUMMARY_EMAIL_RECIPIENT,
      subject: `Equipment Daily Summary - ${today.toLocaleDateString()}`
    };

    if (!EMAILJS_SERVICE_ID_SUMMARY || !EMAILJS_TEMPLATE_ID_SUMMARY || !EMAILJS_USER_ID_SUMMARY) {
      throw new Error('Missing required EmailJS configuration');
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID_SUMMARY,
      EMAILJS_TEMPLATE_ID_SUMMARY,
      emailParams,
      EMAILJS_USER_ID_SUMMARY
    );

    console.log('Daily summary sent successfully');
  } catch (error) {
    console.error("Error sending daily summary:", error);
    setTimeout(() => sendDailySummary(), 5 * 60 * 1000);
  }
}

// Run summary at 11:59 PM every day
const MINUTE = 60000;
let lastSummaryDate = null;

setInterval(() => {
  const now = new Date();
  const currentDate = now.toDateString();

  if (now.getHours() === 23 && now.getMinutes() === 59 && currentDate !== lastSummaryDate) {
    lastSummaryDate = currentDate;
    sendDailySummary().catch(err => {
      console.error('Failed to send daily summary:', err);
      lastSummaryDate = null;
    });
  }
}, MINUTE);

// Check for due returns every day
setInterval(checkForDueReturns, 24 * 60 * 60 * 1000);