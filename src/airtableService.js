import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('EquipTracker');

export const getCheckouts = async () => {
  try {
    const records = await base('Checkouts').select().all();
    return records.map(record => record.fields);
  } catch (error) {
    console.error('Error fetching checkouts from Airtable:', error);
    throw error;
  }
};

export const getCheckins = async () => {
  try {
    const records = await base('Checkins').select().all();
    return records.map(record => record.fields);
  } catch (error) {
    console.error('Error fetching checkins from Airtable:', error);
    throw error;
  }
};

export const addCheckoutToAirtable = async (checkoutData) => {
  console.log('Attempting to add checkout to Airtable:', checkoutData);
  try {
    if (!checkoutData) {
      throw new Error('No checkout data provided');
    }
    console.log('Creating Airtable record with data:', checkoutData);
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
    console.log('Airtable record created successfully:', record);
    return record;
  } catch (error) {
    console.error('Error adding to Airtable:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.statusCode,
      details: error.response ? error.response.data : null
    });
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
    console.error('Error details:', {
      message: error.message,
      status: error.statusCode,
      details: error.response ? error.response.data : null
    });
    throw error;
  }
};