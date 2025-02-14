import React, { useState, useEffect } from "react";
import "./App.css";
import Select from "react-select";
import emailjs from "emailjs-com";
import { init as initEmailJS } from "emailjs-com";
import * as airtableService from './airtableService';

// Form validation utility
const validateForm = (data) => {
  const errors = {};
  if (!data.hoursMiles?.match(/^\d+$/)) {
    errors.hoursMiles = "Hours/Miles must be a positive number";
  }
  if (!data.customerPhone?.match(/^\d{10}$/)) {
    errors.customerPhone = "Phone number must be exactly 10 digits";
  }
  if (!data.customerEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.customerEmail = "Please enter a valid email address";
  }
  if (!data.jobSite) {
    errors.jobSite = "Job site is required";
  }
  return errors;
};

// Initialize EmailJS
initEmailJS("wyfCLJgbJeNcu3092");

// ---------------- EmailJS Configuration ----------------
const EMAILJS_SERVICE_ID = "service_fimxodg";
const EMAILJS_TEMPLATE_ID_CHECKOUT = "template_bxx6jfh";
const EMAILJS_TEMPLATE_ID_CHECKIN = "template_oozid5v";
const EMAILJS_USER_ID = "wyfCLJgbJeNcu3092";
const EMAIL_NOTIFICATIONS_ENABLED = true;

// ---------------- Data Arrays ----------------
const preUploadedUnits = [
  "374 CAT mini ex",
  "304 Peterbilt Dump Truck",
  "306 int. Dump Truck",
  "326 Cat D6 Dozer",
  "329 Cat 950 Loader",
  "335 Cat 950M Loader",
  "347 Bobcat Skid Steer",
  "357 Cat 140M3 Blade",
  "358 Kubota Mini Ex",
  "359 Kubota Skid Steer",
  "365 Terex Light Tower",
  "372 Allmand Light Tower",
  "375 Amman Roller",
  "380 JLG Telehandler",
  "383 Cat 140M3 Blade",
  "384 Cat 308 Mini Ex",
  "385 Cat 336 Excavator",
  "386 Cat Mini Ex",
  "387 Cat Skid Steer",
  "388 Cat Skid Steer",
  "392 Cat Tik Truck",
  "393 Cat Tik Truck",
  "394 Cat Mini Ex",
];

const preProgrammedJobSites = [
  "18",
  "6bar",
  "Apache Canyon Road",
  "Apache Screen Site",
  "Babb Canyon Road",
  "Babb HQ",
  "Baylor",
  "Big Tank HQ",
  "Chico",
  "Clock",
  "Delaware Basin",
  "DOD",
  "Fenceline East",
  "Fenceline West",
  "Figure 2",
  "Highline Road",
  "Hogue Canyon",
  "Honeycutt HQ",
  "Honeycutt Rim North",
  "Houge Pump Jack",
  "James Cook Hanger",
];

const projectCodes = [
  "F2CP",
  "VHN.6BAPT",
  "VHN.ROCK",
  "VHN.STKADD'24",
  "VHN.PCKLBRN",
  "FIG2.SECCAM",
  "6BAR.MGRHOUS",
  "VHN.PUCKRENO",
  "CORN.GOKART",
  "CORN.TACOPS",
  "PUET.LWRHSRENO",
  "6BAR.WTR",
];

const departmentIDs = [
  "General Management",
  "RM 1100 Administration",
  "RM 1200 Equine Program",
  "RM 1400 Construction",
  "RM 1500 Delaware basin",
  "RM 1600 Electrical",
  "RM 1700 Fabrication",
  "RM 1800 Facilities",
  "RM 1900 Land Management",
  "RM 2000 Secruity",
  "RM 2100 Stockyards",
  "RM 2200 Vehicle Maintinence",
  "RM 2300 Wildlife",
];

const rentalEquipmentList = [
  "Excavator X100",
  "Bulldozer B200",
  "Crane C300",
];

function App() {
  useEffect(() => {
    document.title = "Daugherty Ranches Equipment Tracker";
  }, []);

  // ---------------- States ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active-checkouts');
  const [currentSection, setCurrentSection] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [daysFilter, setDaysFilter] = useState("all");
  const [activeCheckouts, setActiveCheckouts] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [dueReturns, setDueReturns] = useState([]);

  // Checkout Form States
  const [selectedUnit, setSelectedUnit] = useState("");
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobSite, setJobSite] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [departmentID, setDepartmentID] = useState("");
  const [availableUnits, setAvailableUnits] = useState(preUploadedUnits);

  // Check-in Form States
  const [checkinUnit, setCheckinUnit] = useState("");
  const [checkinHoursMiles, setCheckinHoursMiles] = useState("");
  const [checkinCustomerName, setCheckinCustomerName] = useState("");
  const [checkinCustomerEmail, setCheckinCustomerEmail] = useState("");
  const [checkinCustomerPhone, setCheckinCustomerPhone] = useState("");
  const [checkinJobSite, setCheckinJobSite] = useState("");
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [checkinDuration, setCheckinDuration] = useState("");
  const [checkinInspectionNotes, setCheckinInspectionNotes] = useState("");
  const [checkinProjectCode, setCheckinProjectCode] = useState("");
  const [checkinDepartmentID, setCheckinDepartmentID] = useState("");

  // ---------------- Form Validation ----------------
  const validateForm = (data) => {
    const errors = {};
    if (!data.hoursMiles?.match(/^\d+$/)) {
      errors.hoursMiles = "Hours/Miles must be a positive number";
    }
    if (!data.customerPhone?.match(/^\d{10}$/)) {
      errors.customerPhone = "Phone number must be exactly 10 digits";
    }
    if (!data.customerEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.customerEmail = "Please enter a valid email address";
    }
    if (!data.jobSite) {
      errors.jobSite = "Job site is required";
    }
    return errors;
  };

  // ---------------- Checkout Submission ----------------
  const addEquipment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setCheckoutMessage("");

    try {
      if (
        !selectedUnit ||
        !checkoutHoursMiles ||
        !checkoutDate ||
        !returnDate ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !jobSite ||
        !projectCode ||
        !departmentID
      ) {
        throw new Error("Please fill in all required fields");
      }

      const formErrors = validateForm({
      hoursMiles: checkoutHoursMiles,
      customerPhone,
      customerEmail,
      jobSite,
    });

    if (Object.keys(formErrors).length > 0) {
      setIsLoading(false);
      alert(Object.values(formErrors).join("\n"));
      return;
    }

    try {
      const checkoutData = {
        unit: selectedUnit,
        hoursMiles: checkoutHoursMiles,
        checkoutDate,
        returnDate,
        customerName,
        customerEmail,
        customerPhone,
        jobSite,
        projectCode,
        departmentID,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // Sync to Airtable
      const airtableRecord = await airtableService.syncCheckout(checkoutData);
      console.log('Airtable sync successful:', airtableRecord);

      if (EMAIL_NOTIFICATIONS_ENABLED) {
        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID_CHECKOUT,
            {
              to_email: customerEmail,
              customer_name: customerName,
              unit: selectedUnit,
              checkout_date: checkoutDate,
              return_date: returnDate,
              job_site: jobSite,
              project_code: projectCode,
              department_id: departmentID,
            },
            EMAILJS_USER_ID
          );
        } catch (err) {
          console.error("Failed to send email:", err);
        }
      }

      // Clear form fields
      setSelectedUnit(null);
      setCheckoutHoursMiles("");
      setCheckoutDate("");
      setReturnDate("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setJobSite(null);
      setProjectCode(null);
      setDepartmentID(null);

      setCheckoutMessage("Checkout successful!");
      setTimeout(() => setCheckoutMessage(""), 3000);
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutMessage(error.message || "An error occurred during checkout. Please try again.");
      setTimeout(() => setCheckoutMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Check-in Submission ----------------
  const addCheckin = async (e) => {
    e.preventDefault();
    if (
      !checkinDateTime ||
      !checkinUnit ||
      !checkinHoursMiles ||
      !checkinJobSite ||
      !checkinCustomerName ||
      !checkinCustomerEmail ||
      !checkinCustomerPhone ||
      !checkinInspectionNotes ||
      !checkinProjectCode ||
      !checkinDepartmentID
    ) {
      alert("Please fill in all check-in fields.");
      return;
    }

    try {
      const checkinData = {
        dateTimeReturned: checkinDateTime,
        unit: checkinUnit,
        hoursMiles: checkinHoursMiles,
        jobSite: checkinJobSite,
        duration: checkinDuration,
        customerName: checkinCustomerName,
        customerEmail: checkinCustomerEmail,
        customerPhone: checkinCustomerPhone,
        inspectionNotes: checkinInspectionNotes,
        projectCode: checkinProjectCode,
        departmentID: checkinDepartmentID,
        createdAt: new Date().toISOString(),
      };

      // Sync to Airtable
      const record = await airtableService.syncCheckin(checkinData);
      console.log('Checkin synced to Airtable:', record);

      if (EMAIL_NOTIFICATIONS_ENABLED) {
        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID_CHECKIN,
            {
              to_email: checkinCustomerEmail,
              customer_name: checkinCustomerName,
              unit: checkinUnit,
              checkin_date: checkinDateTime,
              job_site: checkinJobSite,
              inspection_notes: checkinInspectionNotes,
              project_code: checkinProjectCode,
              department_id: checkinDepartmentID,
            },
            EMAILJS_USER_ID
          );
        } catch (err) {
          console.error("Failed to send email:", err);
        }
      }

      // Clear check-in form fields
      setCheckinDateTime("");
      setCheckinUnit("");
      setCheckinHoursMiles("");
      setCheckinJobSite("");
      setCheckinDuration("");
      setCheckinCustomerName("");
      setCheckinCustomerEmail("");
      setCheckinCustomerPhone("");
      setCheckinInspectionNotes("");
      setCheckinProjectCode("");
      setCheckinDepartmentID("");

      setCheckinMessage("Check-in successful!");
      setTimeout(() => setCheckinMessage(""), 3000);
    } catch (error) {
      console.error("Error during check-in:", error);
      alert("Error during check-in. Please try again.");
    }
  };

  return (
    <div className="App">
      <button 
        className="hamburger-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-buttons" style={{ paddingTop: '20px' }}>
            <button 
              className="sidebar-action-button" 
              onClick={() => setActiveTab('active-checkouts')}
            >
              Active Checkouts
            </button>
            <button 
              className="sidebar-action-button" 
              onClick={() => setActiveTab('active-users')}
            >
              Active Users
            </button>
            <button 
              className="sidebar-action-button" 
              onClick={() => setActiveTab('due-returns')}
            >
              Due Returns
            </button>
          </div>
          
          {activeTab === 'due-returns' && (
            <div className="filter-container">
              <select 
                className="days-filter"
                onChange={(e) => setDaysFilter(e.target.value)}
              >
                <option value="7">Next 7 Days</option>
                <option value="14">Next 14 Days</option>
                <option value="30">Next 30 Days</option>
                <option value="90">Next 90 Days</option>
              </select>
            </div>
          )}

          <div className="sidebar-list">
            {/* Content will be shown here based on selected tab */}
          </div>
        </div>
      </div>

      <header className="app-header">
        <h1>Ranch Asset Checkout Form</h1>
        <p className="tagline">Sanford and Son</p>
      </header>

      {currentSection === null ? (
        <div className="landing">
          <button onClick={() => setCurrentSection("checkout")}>Check-Out</button>
          <button onClick={() => setCurrentSection("checkin")}>Check-In</button>
        </div>
      ) : (
        <div className="section-container">
          <button className="back-button" onClick={() => setCurrentSection(null)}>
            ← Back
          </button>

          {currentSection === "checkout" ? (
            <section className="checkout">
              <h2>Equipment Check-Out</h2>
              <form id="checkout-form" onSubmit={addEquipment}>
                <div>
                  <label>
                    Equipment:
                    <Select
                      options={[
                        {
                          label: "Ranch Equipment",
                          options: availableUnits.map((unit) => ({
                            value: unit,
                            label: unit,
                          })),
                        },
                        {
                          label: "Rental Equipment",
                          options: rentalEquipmentList.map((item) => ({
                            value: item,
                            label: item,
                          })),
                        },
                      ]}
                      value={selectedUnit ? { value: selectedUnit, label: selectedUnit } : null}
                      onChange={(option) => setSelectedUnit(option.value)}
                      placeholder="Select Equipment"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Hours/Miles:
                    <input
                      type="text"
                      value={checkoutHoursMiles}
                      onChange={(e) => setCheckoutHoursMiles(e.target.value)}
                      placeholder="Enter hours or miles"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Name:
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Email:
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter customer email"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Phone #:
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter customer phone number"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Job Site:
                    <Select
                      options={preProgrammedJobSites.map((site) => ({
                        value: site,
                        label: site,
                      }))}
                      value={jobSite ? { value: jobSite, label: jobSite } : null}
                      onChange={(option) => setJobSite(option.value)}
                      placeholder="Select Job Site"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({
                        value: code,
                        label: code,
                      }))}
                      value={projectCode ? { value: projectCode, label: projectCode } : null}
                      onChange={(option) => setProjectCode(option.value)}
                      placeholder="Select Project Code"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Department ID:
                    <Select
                      options={departmentIDs.map((dept) => ({
                        value: dept,
                        label: dept,
                      }))}
                      value={departmentID ? { value: departmentID, label: departmentID } : null}
                      onChange={(option) => setDepartmentID(option.value)}
                      placeholder="Select Department ID"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Checkout Date:
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Return Date:
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </label>
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Checkout Equipment"}
                </button>
              </form>
              {checkoutMessage && <p className="message">{checkoutMessage}</p>}
            </section>
          ) : (
            <section className="checkin">
              <h2>Equipment Check-In</h2>
              <form onSubmit={addCheckin}>
                <div>
                  <label>
                    Equipment:
                    <Select
                      options={[
                        {
                          label: "Ranch Equipment",
                          options: availableUnits.map((unit) => ({
                            value: unit,
                            label: unit,
                          })),
                        },
                        {
                          label: "Rental Equipment",
                          options: rentalEquipmentList.map((item) => ({
                            value: item,
                            label: item,
                          })),
                        },
                      ]}
                      value={checkinUnit ? { value: checkinUnit, label: checkinUnit } : null}
                      onChange={(option) => setCheckinUnit(option.value)}
                      placeholder="Select Equipment"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Hours/Miles:
                    <input
                      type="text"
                      value={checkinHoursMiles}
                      onChange={(e) => setCheckinHoursMiles(e.target.value)}
                      placeholder="Enter hours/miles"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Name:
                    <input
                      type="text"
                      value={checkinCustomerName}
                      onChange={(e) => setCheckinCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Email:
                    <input
                      type="email"
                      value={checkinCustomerEmail}
                      onChange={(e) => setCheckinCustomerEmail(e.target.value)}
                      placeholder="Enter customer email"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Customer Phone #:
                    <input
                      type="text"
                      value={checkinCustomerPhone}
                      onChange={(e) => setCheckinCustomerPhone(e.target.value)}
                      placeholder="Enter customer phone number"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Job Site:
                    <Select
                      options={preProgrammedJobSites.map((site) => ({
                        value: site,
                        label: site,
                      }))}
                      value={checkinJobSite ? { value: checkinJobSite, label: checkinJobSite } : null}
                      onChange={(option) => setCheckinJobSite(option.value)}
                      placeholder="Select Job Site"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({
                        value: code,
                        label: code,
                      }))}
                      value={checkinProjectCode ? { value: checkinProjectCode, label: checkinProjectCode } : null}
                      onChange={(option) => setCheckinProjectCode(option.value)}
                      placeholder="Select Project Code"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Department ID:
                    <Select
                      options={departmentIDs.map((dept) => ({
                        value: dept,
                        label: dept,
                      }))}
                      value={checkinDepartmentID ? { value: checkinDepartmentID, label: checkinDepartmentID } : null}
                      onChange={(option) => setCheckinDepartmentID(option.value)}
                      placeholder="Select Department ID"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Date and Time Returned:
                    <input
                      type="datetime-local"
                      value={checkinDateTime}
                      onChange={(e) => setCheckinDateTime(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Duration (Days checked out):
                    <input
                      type="number"
                      value={checkinDuration}
                      onChange={(e) => setCheckinDuration(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Inspection Notes:
                    <textarea
                      value={checkinInspectionNotes}
                      onChange={(e) => setCheckinInspectionNotes(e.target.value)}
                      placeholder="Enter inspection notes"
                    ></textarea>
                  </label>
                </div>
                <button type="submit">Check-In Equipment</button>
              </form>
              {checkinMessage && <p className="message">{checkinMessage}</p>}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;