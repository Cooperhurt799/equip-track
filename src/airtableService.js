import Airtable from 'airtable';

const AIRTABLE_PAT = import.meta.env.VITE_AIRTABLE_PAT;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

const base = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);

export const syncCheckout = async (checkoutData) => {
  try {
    console.log('Starting Airtable sync with config:', {
      apiKey: AIRTABLE_PAT ? 'Present' : 'Missing',
      baseId: AIRTABLE_BASE_ID ? 'Present' : 'Missing'
    });
    
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable configuration');
    }

    console.log('Attempting to create Airtable record with data:', {
      unit: checkoutData.unit,
      customerName: checkoutData.customerName,
      jobSite: checkoutData.jobSite
    });

    const record = await base('Checkouts').create({
      unit: checkoutData.unit,
      hoursMiles: checkoutData.hoursMiles,
      checkoutDate: checkoutData.checkoutDate,
      returnDate: checkoutData.returnDate,
      customerName: checkoutData.customerName,
      customerEmail: checkoutData.customerEmail,
      customerPhone: checkoutData.customerPhone,
      jobSite: checkoutData.jobSite,
      projectCode: checkoutData.projectCode,
      departmentID: checkoutData.departmentID,
      createdAt: new Date().toISOString(),
      status: checkoutData.status
    });
    
    console.log('Successfully synced checkout to Airtable:', record.getId());
    return record;
  } catch (error) {
    console.error('Detailed Airtable sync error:', {
      message: error.message,
      error: error,
      data: checkoutData
    });
    throw error;
  }
};

export const syncCheckin = async (checkinData) => {
  try {
    const record = await base('Checkins').create({
      unit: checkinData.unit,
      hoursMiles: checkinData.hoursMiles,
      dateTimeReturned: checkinData.dateTimeReturned,
      customerName: checkinData.customerName,
      customerEmail: checkinData.customerEmail,
      customerPhone: checkinData.customerPhone,
      jobSite: checkinData.jobSite,
      duration: checkinData.duration,
      inspectionNotes: checkinData.inspectionNotes,
      projectCode: checkinData.projectCode,
      departmentID: checkinData.departmentID,
      createdAt: new Date().toISOString()
    });
    console.log('Synced checkin to Airtable:', record.getId());
    return record;
  } catch (error) {
    console.error('Error syncing checkin to Airtable:', error);
    throw error;
  }
};

export default {
  syncCheckout,
  syncCheckin
};