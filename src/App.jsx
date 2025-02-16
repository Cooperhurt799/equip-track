import React, { useState, useEffect } from "react";
import "./App.css";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import * as airtableService from "./airtableService";
import emailjs from "emailjs-com";
import "./reminderService"; // Import the reminder service, if used

// ---------------- EmailJS Configuration ----------------
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_CHECKOUT = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CHECKOUT;
const EMAILJS_TEMPLATE_ID_CHECKIN = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CHECKIN;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

// Initialize EmailJS with your user ID
emailjs.init(EMAILJS_USER_ID);

// ---------------- Custom Styles for react-select ----------------
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    minHeight: "45px",
    fontSize: "15px",
    border: state.isFocused ? "2px solid #3b82f6" : "2px solid #34495e",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : null,
    borderRadius: "10px",
    padding: "0",
    backgroundColor: "#f8fafc",
    "&:hover": {
      borderColor: "#8b6c42",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }
  }),
  menu: (provided) => ({
    ...provided,
    width: "100%",
    zIndex: 2
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#4b3f2a",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "15px",
  }),
  input: (provided) => ({
    ...provided,
    fontSize: "15px",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "12px"
  })
};

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
  // Set page title on mount.
  useEffect(() => {
    document.title = "Daugherty Ranches Equipment Tracker";
  }, []);

  // ---------------- Section Navigation and Misc States ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };
  const [currentSection, setCurrentSection] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [daysFilter, setDaysFilter] = useState("7");
  const [activeCheckouts, setActiveCheckouts] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [dueReturns, setDueReturns] = useState([]);
  const [showOverdueAlert, setShowOverdueAlert] = useState(false);
  const [overdueItems, setOverdueItems] = useState([]);
  const [showOverdueDetails, setShowOverdueDetails] = useState(false);
  const [overdueAlertDismissed, setOverdueAlertDismissed] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [showCheckoutDetails, setShowCheckoutDetails] = useState(false);

  // ---------------- Checkout Form States ----------------
  const [selectedUnit, setSelectedUnit] = useState("");
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [company, setCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobSite, setJobSite] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [departmentID, setDepartmentID] = useState("");
  const [availableUnits, setAvailableUnits] = useState(preUploadedUnits);

  // ---------------- Check-In Form States ----------------
  const [checkinUnit, setCheckinUnit] = useState("");
  const [checkinHoursMiles, setCheckinHoursMiles] = useState("");
  const [checkinCustomerName, setCheckinCustomerName] = useState("");
  const [checkinCompany, setCheckinCompany] = useState("");
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
        throw new Error(Object.values(formErrors).join("\n"));
      }

      const checkoutData = {
        unit: selectedUnit,
        hoursMiles: checkoutHoursMiles,
        checkoutDate,
        returnDate,
        customerName,
        customerEmail,
        customerPhone,
        company,
        jobSite,
        projectCode,
        departmentID,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // Sync checkout data to Airtable
      const airtableRecord = await airtableService.syncCheckout(checkoutData);
      console.log("Airtable sync successful:", airtableRecord);

      setCheckoutMessage("Checkout successful!");
      // Send email notification for checkout
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
      console.log("Email sent successfully for checkout.");

      // Reset checkout form fields
      setSelectedUnit("");
      setCheckoutHoursMiles("");
      setCheckoutDate("");
      setReturnDate("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCompany("");
      setJobSite("");
      setProjectCode("");
      setDepartmentID("");
      setTimeout(() => setCheckoutMessage(""), 3000);
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutMessage(error.message || "An error occurred during checkout. Please try again.");
      setTimeout(() => setCheckoutMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Fetch Active Checkouts ----------------
  // Fetch active checkouts whenever the sidebar tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab) {
        try {
          const activeCheckouts = await airtableService.fetchActiveCheckouts();
          setActiveCheckouts(activeCheckouts);
          
          // Calculate active users
          const users = activeCheckouts.reduce((unique, checkout) => {
            if (!unique.some(user => user.email === checkout.customerEmail)) {
              const userCheckouts = activeCheckouts.filter(item => 
                item.status === "active" && 
                item.customerEmail === checkout.customerEmail
              );
              unique.push({
                name: checkout.customerName,
                email: checkout.customerEmail,
                checkouts: userCheckouts
              });
            }
            return unique;
          }, []);
          setActiveUsers(users);
          
          // Calculate due returns
          const today = new Date();
          const dueItems = activeCheckouts.filter(item => {
            const returnDate = new Date(item.returnDate);
            const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
            return diffDays <= parseInt(daysFilter || "7", 10);
          });
          setDueReturns(dueItems);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [activeTab, daysFilter]);

  // Function to fetch a single active checkout
  const fetchActiveCheckout = async (unit) => {
    try {
      const checkout = activeCheckouts.find(item => item.unit === unit);
      return checkout || null;
    } catch (error) {
      console.error("Error fetching active checkout:", error);
      return null;
    }
  };

  // ---------------- Calculate Check-In Duration ----------------
  // Use checkout records (equipmentList) to compute the duration.
  useEffect(() => {
    if (checkinDateTime && checkinUnit) {
      const fetchCheckout = async () => {
        try {
          const checkout = await fetchActiveCheckout(checkinUnit);
          if (checkout) {
            const diffMs = new Date(checkinDateTime) - new Date(checkout.createdAt);
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            setCheckinDuration(diffDays > 0 ? diffDays : 0);
          } else {
            setCheckinDuration("");
          }
        } catch (error) {
          console.error("Error fetching checkout for duration calculation:", error);
          setCheckinDuration("");
        }
      };
      fetchCheckout();
    } else {
      setCheckinDuration("");
    }
  }, [checkinDateTime, checkinUnit]);

  // ---------------- Check-In Submission ----------------
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
        hoursMiles: parseFloat(checkinHoursMiles) || 0,
        jobSite: checkinJobSite,
        duration: checkinDuration,
        customerName: checkinCustomerName,
        customerEmail: checkinCustomerEmail,
        customerPhone: checkinCustomerPhone,
        checkinCompany: checkinCompany, // Added this line
        inspectionNotes: checkinInspectionNotes,
        projectCode: checkinProjectCode,
        departmentID: checkinDepartmentID,
        createdAt: new Date().toISOString(),
      };

      // Find the active checkout record and update its status
      const activeCheckout = activeCheckouts.find(
        item => item.status === "active" && item.unit === checkinUnit
      );
      if (activeCheckout) {
        await airtableService.updateCheckoutStatus(activeCheckout.id, "inactive");
      }

      const record = await airtableService.syncCheckin(checkinData);
      console.log("Checkin synced to Airtable:", record);

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
          hours_miles: checkinHoursMiles,
        },
        EMAILJS_USER_ID
      );
      console.log("Email sent successfully for check-in.");

      // Reset check-in form fields
      setCheckinDateTime("");
      setCheckinUnit("");
      setCheckinHoursMiles("");
      setCheckinJobSite("");
      setCheckinDuration("");
      setCheckinCustomerName("");
      setCheckinCustomerEmail("");
      setCheckinCustomerPhone("");
      setCheckinCompany(""); // Added this line
      setCheckinInspectionNotes("");
      setCheckinProjectCode("");
      setCheckinDepartmentID("");
      setCheckinMessage("Check-in successful!");
      setTimeout(() => setCheckinMessage(""), 3000);
    } catch (error) {
      console.error("Error during check-in:", error);
      setCheckinMessage(`Error during check-in: ${error.message || 'Please try again'}`);
      setTimeout(() => setCheckinMessage(""), 5000);
    }
  };

  // ---------------- Active Checkouts Section ----------------
  const getActiveUnitNumbers = () => {
    if (!availableUnits.length || !activeCheckouts.length) return [];
    const latestCheckout = {};
    availableUnits.forEach((unit) => {
      activeCheckouts.forEach((checkout) => {
        if (checkout.unit === unit) {
          const time = new Date(checkout.createdAt);
          if (!latestCheckout[unit] || time > latestCheckout[unit]) {
            latestCheckout[unit] = time;
          }
        }
      });
    });
    const activeUnits = [];
    for (const unit in latestCheckout) {
      const correspondingRecord = activeCheckouts.find(
        (record) =>
          record.unit === unit &&
          record.createdAt &&
          new Date(record.createdAt) > latestCheckout[unit]
      );
      if (!correspondingRecord) {
        activeUnits.push(unit);
      }
    }
    return activeUnits;
  };

  // Run verification on init
  //verifyAirtableAccess();

  // Check for overdue items
  useEffect(() => {
    const checkOverdue = async () => {
      const today = new Date();
      const activeCheckoutsData = await airtableService.fetchActiveCheckouts();
      const overdue = activeCheckoutsData.filter(item => {
        const returnDate = new Date(item.returnDate);
        return returnDate < today;
      });
      setOverdueItems(overdue);
      setShowOverdueAlert(overdue.length > 0);
    };

    checkOverdue();
    // Check every hour
    const interval = setInterval(checkOverdue, 3600000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="App">
      <div className="main-container"> {/* Added container */}
        {/* Hamburger and sidebar */}
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
        <div 
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="sidebar-header">
          </div>
          <div className="sidebar-content">
            <div className="sidebar-buttons" style={{ paddingTop: "20px" }}>
              <button
                className={`sidebar-action-button ${activeTab === "active-checkouts" ? "active" : ""}`}
                onClick={() => setActiveTab(activeTab === "active-checkouts" ? null : "active-checkouts")}
              >
                Active Checkouts
              </button>
              <button
                className={`sidebar-action-button ${activeTab === "active-users" ? "active" : ""}`}
                onClick={() => setActiveTab(activeTab === "active-users" ? null : "active-users")}
              >
                Active Users
              </button>
              <button
                className={`sidebar-action-button ${activeTab === "due-returns" ? "active" : ""}`}
                onClick={() => setActiveTab(activeTab === "due-returns" ? null : "due-returns")}
              >
                Due Returns
              </button>
              <button
                className={`sidebar-action-button ${activeTab === "equipment-details" ? "active" : ""}`}
                onClick={() => setActiveTab(activeTab === "equipment-details" ? null : "equipment-details")}
              >
                Equipment Details
              </button>
            </div>
            {activeTab === "equipment-details" && (
                <div className="sidebar-list">
                  <div className="equipment-stats">
                    <p><strong>Total Equipment:</strong> {preUploadedUnits.length + rentalEquipmentList.length}</p>
                    <p><strong>Checked Out:</strong> {activeCheckouts.length}</p>
                    <p><strong>Available:</strong> {preUploadedUnits.length + rentalEquipmentList.length - activeCheckouts.length}</p>
                  </div>
                </div>
              )}
              {activeTab === "due-returns" && (
              <div className="days-filter-container">
                <label>Show returns due within:</label>
                <select 
                  className="days-filter-select"
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(e.target.value)}
                >
                  {[1,2,3,4,5,7,10,14,21,30,45,60].map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
            )}
            {activeTab && <div className="sidebar-list">
              {activeTab === "active-checkouts" && activeCheckouts.map((checkout, index) => (
                <li key={index}>
                  <strong>{checkout.unit}</strong>
                  <small style={{ display: 'block', color: '#666', fontSize: '0.8em', marginTop: '2px' }}>
                    {checkout.customerName}
                  </small>
                </li>
              ))}

              {activeTab === "active-users" && activeCheckouts
                .reduce((unique, checkout) => {
                  if (!unique.some(user => user.email === checkout.customerEmail)) {
                    const userCheckouts = activeCheckouts.filter(item => 
                      item.status === "active" && 
                      item.customerEmail === checkout.customerEmail
                    );
                    unique.push({
                      name: checkout.customerName,
                      email: checkout.customerEmail,
                      checkouts: userCheckouts
                    });
                  }
                  return unique;
                }, []).map((user, index) => (
                  <li key={index} className="user-item">
                    <strong>{user.name}</strong>
                    <span> ({user.checkouts.length} units)</span>
                    <div className="user-checkouts">
                      {user.checkouts.map((checkout, checkoutIndex) => (
                        <button
                          key={checkoutIndex}
                          className="unit-button"
                          onClick={() => {
                            setSelectedCheckout(checkout);
                            setShowCheckoutDetails(true);
                          }}
                        >
                          {checkout.unit}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}

              {activeTab === "due-returns" && activeCheckouts.filter(item => {
                const returnDate = new Date(item.returnDate);
                const today = new Date();
                const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= parseInt(daysFilter || "7", 10);
              }).map((checkout, index) => (
                <li key={index}>
                  <strong>{checkout.unit}</strong>
                  <small>Due: {new Date(checkout.returnDate).toLocaleDateString()}</small>
                </li>
              ))}
            </div>}
          </div>
        </div>

        <header className="app-header">
          <h1>Ranch Equipment Checkout Form</h1>
          <p className="tagline">Sanford and Son</p>
        </header>

        {showOverdueAlert && !overdueAlertDismissed && (
          <div className="overdue-alert-container">
            <button 
              className="overdue-alert-button" 
              onClick={() => setShowOverdueDetails(true)}
            >
              {overdueItems.length} Overdue Items
            </button>
            <button 
              className="overdue-alert-close" 
              onClick={() => setOverdueAlertDismissed(true)}
            >
              ×
            </button>
          </div>
        )}

        {/* Overdue Details Modal */}
        {showOverdueDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Overdue Items</h2>
              <div className="overdue-list">
                {overdueItems.map((item, index) => (
                  <div key={index} className="overdue-item">
                    <h3>{item.unit}</h3>
                    <p>Checked out by: {item.customerName}</p>
                    <p>Return Date: {new Date(item.returnDate).toLocaleDateString()}</p>
                    <p><strong>Contact:</strong> {item.phone}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowOverdueDetails(false)}>Close</button>
            </div>
          </div>
        )}

        {currentSection === null ? (
          <div className="landing">
            <button onClick={() => setCurrentSection("checkout")}>Check-Out</button>
            <button onClick={() => setCurrentSection("checkin")}>Check-In</button>
          </div>
        ) : (
          <div className="section-container">
            <div style={{ width: '100%', maxWidth: '800px' }}>
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
                            label: "Available Equipment",
                            options: preUploadedUnits
                              .filter(unit => !activeCheckouts.some(item => 
                                item.unit === unit
                              ))
                              .map((unit) => ({
                                value: unit,
                                label: unit,
                              })),
                          },
                          {
                            label: "Rental Equipment",
                            options: rentalEquipmentList
                              .filter(unit => !activeCheckouts.some(item => 
                                item.unit === unit
                              ))
                              .map((item) => ({
                                value: item,
                                label: item,
                              })),
                          },
                        ]}
                        value={selectedUnit ? { value: selectedUnit, label: selectedUnit } : null}
                        onChange={async (option) => {
                          setSelectedUnit(option.value);
                          const activeCheckout = await fetchActiveCheckout(option.value);
                          if (activeCheckout) {
                            setCompany(activeCheckout.company || '');
                          }
                        }}
                        placeholder="Select Equipment"
                        styles={customSelectStyles}
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
                      Company:
                      <CreatableSelect
                        options={[
                          { value: "Daugherty", label: "Daugherty" },
                          { value: "StoneRidge", label: "StoneRidge" },
                          { value: "Cool Star", label: "Cool Star" },
                          { value: "KBE", label: "KBE" },
                          { value: "JRJ", label: "JRJ" }
                        ]}
                        value={company ? { value: company, label: company } : null}
                        onChange={(option) => setCompany(option?.value || '')}
                        onCreateOption={(inputValue) => setCompany(inputValue)}
                        placeholder="Select or type company name"
                        styles={customSelectStyles}
                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
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
                        styles={customSelectStyles}
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
                        styles={customSelectStyles}
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
                        styles={customSelectStyles}
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
                            label: "Active Checkouts",
                            options: activeCheckouts
                              .map(item => ({
                                value: item.unit,
                                label: `${item.unit} (${item.customerName})`,
                              })),
                          },
                          {
                            label: "Ranch Equipment",
                            options: preUploadedUnits.map((unit) => ({
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
                        onChange={async (option) => {
                          setCheckinUnit(option.value);
                          const activeCheckout = await fetchActiveCheckout(option.value);
                          if (activeCheckout) {
                            setCheckinCustomerName(activeCheckout.customerName || '');
                            setCheckinCustomerEmail(activeCheckout.customerEmail || '');
                            setCheckinCustomerPhone(activeCheckout.phone || ''); // Changed from customerPhone to phone
                            setCheckinCompany(activeCheckout.company || '');
                            setCheckinJobSite(activeCheckout.jobSite || '');
                            setCheckinProjectCode(activeCheckout.projectCode || '');
                            setCheckinDepartmentID(activeCheckout.departmentID || '');
                            setCheckinHoursMiles(activeCheckout.hoursMiles || '');
                            const currentDate = new Date().toISOString().slice(0, 16);
                            setCheckinDateTime(currentDate);
                            //                            // Calculate duration based on checkout date
                            if (activeCheckout.checkoutDate) {
                              const checkoutTime = new Date(activeCheckout.checkoutDate);
                              const now = new Date();
                              const diffDays = Math.ceil((now - checkoutTime) / (1000 * 60 * 60 * 24));
                              setCheckinDuration(diffDays > 0 ? diffDays : 0);
                            }
                          }
                        }}
                        placeholder="Select Equipment"
                        styles={customSelectStyles}
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
                      Company:
                      <Select
                        options={[
                          { value: "Daugherty", label: "Daugherty" },
                          { value: "StoneRidge", label: "StoneRidge" },
                          { value: "Cool Star", label: "Cool Star" },
                          { value: "KBE", label: "KBE" },
                          { value: "JRJ", label: "JRJ" }
                        ]}
                        value={checkinCompany ? { value: checkinCompany, label: checkinCompany } : null}
                        onChange={(option) => setCheckinCompany(option.value)}
                        placeholder="Select Company"
                        styles={customSelectStyles}
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
                    </label>                  </div>
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
                        styles={customSelectStyles}
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
                        styles={customSelectStyles}
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
                        styles={customSelectStyles}
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
                        readOnly
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
          </div>
        )}

        {/* Checkout Details Modal */}
        {showCheckoutDetails && selectedCheckout && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Equipment Details</h2>
              <div className="checkout-details">
                <p><strong>Unit:</strong> {selectedCheckout.unit}</p>
                <p><strong>Customer:</strong> {selectedCheckout.customerName}</p>
                <p><strong>Job Site:</strong> {selectedCheckout.jobSite}</p>
                <p><strong>Checkout Date:</strong> {new Date(selectedCheckout.checkoutDate).toLocaleDateString()}</p>
                <p><strong>Return Date:</strong> {new Date(selectedCheckout.returnDate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowCheckoutDetails(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;