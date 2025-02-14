import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import emailjs from 'emailjs-com';
import Airtable from 'airtable';

const firebaseConfig = {
  apiKey: "AIzaSyBGI1ePIuM8qH-HU7m0KoHWWTelNL8Rw7I",
  authDomain: "ranch-asset-tracker.firebaseapp.com",
  projectId: "ranch-asset-tracker",
  storageBucket: "ranch-asset-tracker.appspot.com",
  messagingSenderId: "599725599196",
  appId: "1:599725599196:web:d70da6968196e0a0e7b593"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EMAILJS_SERVICE_ID = "service_fimxodg";
const EMAILJS_TEMPLATE_ID = "template_bxx6jfh";
const EMAILJS_USER_ID = "wyfCLJgbJeNcu3092";

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('EquipTrackerTest');

const EMAILJS_SERVICE_ID_SUMMARY = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_SUMMARY = import.meta.env.VITE_EMAILJS_DAILY_SUMMARY_TEMPLATE_ID;
const EMAILJS_USER_ID_SUMMARY = import.meta.env.VITE_EMAILJS_USER_ID;


export const checkForDueReturns = async () => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day
    const checkoutsRef = collection(db, 'checkouts');
    const q = query(
      checkoutsRef,
      where('returnDate', '<=', today.toISOString()),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const checkout = doc.data();
      sendReminderEmail(checkout);
    });
  } catch (error) {
    console.error('Error checking for due returns:', error);
  }
};

const sendReminderEmail = (checkout) => {
  if (!checkout.customerEmail || !checkout.customerName || !checkout.unit || !checkout.returnDate) {
    console.error('Missing required fields for email:', checkout);
    return;
  }
  
  const templateParams = {
    to_email: checkout.customerEmail,
    customer_name: checkout.customerName,
    unit: checkout.unit,
    return_date: new Date(checkout.returnDate).toLocaleDateString()
  };

  emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_USER_ID
  ).catch(err => console.error('Failed to send reminder email:', err));
};

// Check for due returns every day
setInterval(checkForDueReturns, 24 * 60 * 60 * 1000);


export async function sendDailySummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's checkouts from Airtable
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

    if (!EMAILJS_SERVICE_ID_SUMMARY || !EMAILJS_TEMPLATE_ID_SUMMARY || !EMAILJS_USER_ID_SUMMARY) {
      throw new Error('Missing required EmailJS configuration');
    }

    // Send summary email
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID_SUMMARY,
        EMAILJS_TEMPLATE_ID_SUMMARY,
        emailParams,
        EMAILJS_USER_ID_SUMMARY
      );
    } catch (error) {
      console.error('Failed to send summary email:', error);
      throw error;
    }

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