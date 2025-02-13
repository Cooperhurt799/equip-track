
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import emailjs from 'emailjs-com';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_DAILY_SUMMARY_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

export async function sendDailySummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch today's checkouts
    const checkoutsRef = collection(db, "checkouts");
    const checkoutsSnapshot = await getDocs(checkoutsRef);
    const todayCheckouts = [];
    
    checkoutsSnapshot.forEach(doc => {
      const checkout = doc.data();
      const checkoutDate = new Date(checkout.createdAt);
      checkoutDate.setHours(0, 0, 0, 0);
      
      if (checkoutDate.getTime() === today.getTime()) {
        todayCheckouts.push(checkout);
      }
    });
    
    // Fetch today's checkins
    const checkinsRef = collection(db, "checkins");
    const checkinsSnapshot = await getDocs(checkinsRef);
    const todayCheckins = [];
    
    checkinsSnapshot.forEach(doc => {
      const checkin = doc.data();
      const checkinDate = new Date(checkin.createdAt);
      checkinDate.setHours(0, 0, 0, 0);
      
      if (checkinDate.getTime() === today.getTime()) {
        todayCheckins.push(checkin);
      }
    });
    
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
