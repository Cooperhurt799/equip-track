
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import emailjs from 'emailjs-com';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

export async function checkAndSendReminders() {
  try {
    const checkoutsRef = collection(db, "checkouts");
    const querySnapshot = await getDocs(checkoutsRef);
    
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    querySnapshot.forEach(async (doc) => {
      const checkout = doc.data();
      const returnDate = new Date(checkout.returnDate);
      
      // Check if return date is in 2 days
      if (returnDate.toDateString() === twoDaysFromNow.toDateString()) {
        // Send reminder email
        const emailParams = {
          to_email: checkout.customerEmail,
          customer_name: checkout.customerName,
          unit: checkout.unit,
          return_date: checkout.returnDate,
          job_site: checkout.jobSite
        };

        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            emailParams,
            EMAILJS_USER_ID
          );
          console.log(`Reminder sent to ${checkout.customerEmail}`);
        } catch (error) {
          console.error("Error sending reminder:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error checking reminders:", error);
  }
}

// Run reminder check every 24 hours
setInterval(checkAndSendReminders, 24 * 60 * 60 * 1000);
