
import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn.f6df5c9a242f120e1904d1e5aa8b182992bd6430a88846d24974f8b735345253' })
  .base('EquipTracker');

export const addCheckoutToAirtable = async (checkoutData) => {
  console.log('Attempting to add checkout to Airtable:', checkoutData);
  try {
    if (!checkoutData) {
      throw new Error('No checkout data provided');
    }
    const record = await base('Checkouts').create([
      {
        fields: {
          Unit: checkoutData.unit,
          HoursMiles: checkoutData.hoursMiles,
          CustomerName: checkoutData.customerName,
          CustomerEmail: checkoutData.customerEmail,
          CustomerPhone: checkoutData.customerPhone,
          JobSite: checkoutData.jobSite,
          ProjectCode: checkoutData.projectCode,
          DepartmentID: checkoutData.departmentID,
          CheckoutDate: checkoutData.checkoutDate,
          ReturnDate: checkoutData.returnDate,
          CreatedAt: checkoutData.createdAt
        }
      }
    ]);
    return record;
  } catch (error) {
    console.error('Error adding to Airtable:', error);
    throw error;
  }
};

export const addCheckinToAirtable = async (checkinData) => {
  try {
    const record = await base('Checkins').create([
      {
        fields: {
          Unit: checkinData.unit,
          HoursMiles: checkinData.hoursMiles,
          CustomerName: checkinData.customerName,
          CustomerEmail: checkinData.customerEmail,
          CustomerPhone: checkinData.customerPhone,
          JobSite: checkinData.jobSite,
          ProjectCode: checkinData.projectCode,
          DepartmentID: checkinData.departmentID,
          DateTimeReturned: checkinData.dateTimeReturned,
          Duration: checkinData.duration,
          InspectionNotes: checkinData.inspectionNotes,
          CreatedAt: checkinData.createdAt
        }
      }
    ]);
    return record;
  } catch (error) {
    console.error('Error adding to Airtable:', error);
    throw error;
  }
};
