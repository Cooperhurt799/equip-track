// App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import Select from "react-select"; // Ensure react-select is installed
import emailjs from "emailjs-com";
import { init as initEmailJS } from "emailjs-com";
import { initializeApp, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
} from "firebase/firestore";

// Initialize EmailJS with your user ID
initEmailJS("wyfCLJgbJeNcu3092");

const firebaseConfig = {
  apiKey: "AIzaSyDpYCQla2yjxlZHC2h4hPJSPlhYg6y0a5M",
  authDomain: "equipment-tracker-566c5.firebaseapp.com",
  projectId: "equipment-tracker-566c5",
  storageBucket: "equipment-tracker-566c5.firebasestorage.app",
  messagingSenderId: "72142898448",
  appId: "1:72142898448:web:187702fc7a5b5bdad71195",
  measurementId: "G-L58WPXJ4J1",
};

let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);
const CACHE_SIZE = 1000000000; // 1GB cache

enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE
}).catch((err) => {
  console.warn('Persistence failed:', err);
  if (err.code === 'failed-precondition') {
    // Multiple tabs open
    console.warn('Persistence unavailable - multiple tabs');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Persistence unavailable - not supported');
  }
});

import "./reminderService";

// ---------------- EmailJS Configuration ----------------
const EMAILJS_SERVICE_ID = "service_fimxodg";
const EMAILJS_TEMPLATE_ID_CHECKOUT = "template_bxx6jfh";
const EMAILJS_TEMPLATE_ID_CHECKIN = "template_oozid5v";
const EMAILJS_USER_ID = "wyfCLJgbJeNcu3092";
const EMAIL_NOTIFICATIONS_ENABLED = true; // Enable email notifications

// ---------------- Custom Styles for react-select ----------------
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    minHeight: "40px",
    fontSize: "16px",
    border: "2px solid #34495e",
    boxShadow: state.isFocused ? "0 0 0 1px #34495e" : null,
    borderRadius: "10px",
    padding: "2px 5px",
    backgroundColor: "#f8fafc",
  }),
  menu: (provided) => ({
    ...provided,
    width: "100%",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#4b3f2a",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "16px",
  }),
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

const rentalEquipmentList = [
  "Excavator X100",
  "Bulldozer B200",
  "Crane C300",
];

// ---------------- New Data Arrays for Dropdowns ----------------
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

// ---------------- Single Validate Function ----------------
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

function App() {
  useEffect(() => {
    document.title = "Daugherty Ranches Equipment Tracker";
  }, []);

  // ---------------- Real-time Data Fetching using onSnapshot ----------------
  useEffect(() => {
    // Load initial data from localStorage
    const savedEquipmentList = localStorage.getItem('equipmentList');
    const savedCheckinList = localStorage.getItem('checkinList');
    
    if (savedEquipmentList) {
      setEquipmentList(JSON.parse(savedEquipmentList));
    }
    if (savedCheckinList) {
      setCheckinList(JSON.parse(savedCheckinList));
    }

    let mounted = true;
    const checkoutsQuery = query(
      collection(db, "checkouts"),
      orderBy("createdAt", "desc")
    );
    const checkinsQuery = query(
      collection(db, "checkins"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeCheckouts = onSnapshot(checkoutsQuery, (snapshot) => {
      if (!mounted) return;
      const checkoutData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.() ||
          new Date(doc.data().createdAt).toISOString(),
      }));
      setEquipmentList(checkoutData);
      localStorage.setItem('equipmentList', JSON.stringify(checkoutData));
    });

    const unsubscribeCheckins = onSnapshot(checkinsQuery, (snapshot) => {
      if (!mounted) return;
      const checkinData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.() ||
          new Date(doc.data().createdAt).toISOString(),
      }));
      setCheckinList(checkinData);
      localStorage.setItem('checkinList', JSON.stringify(checkinData));
    });

    return () => {
      mounted = false;
      unsubscribeCheckouts();
      unsubscribeCheckins();
    };
  }, []);

  // ---------------- Sidebar and Section States ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [filteredDueReturns, setFilteredDueReturns] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);

  // ---------------- Message States ----------------
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");

  // ---------------- Checkout Form State ----------------
  const [equipmentList, setEquipmentList] = useState([]);
  const [availableUnits, setAvailableUnits] = useState(preUploadedUnits);
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

  // ---------------- Check-In Form State ----------------
  const [checkinList, setCheckinList] = useState([]);
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

  const [isLoading, setIsLoading] = useState(false);

  // ---------------- Utility Functions ----------------
  const getDueReturns = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return equipmentList
      .filter((checkout) => {
        const returnDt = new Date(checkout.returnDate);
        const hasCheckin = checkinList.find(
          (checkin) =>
            checkin.unit === checkout.unit &&
            new Date(checkin.createdAt) > new Date(checkout.createdAt)
        );
        return (
          !hasCheckin &&
          returnDt >= today &&
          returnDt <= sevenDaysFromNow
        );
      })
      .sort(
        (a, b) => new Date(a.returnDate) - new Date(b.returnDate)
      );
  };

  const getOverdueUnits = () => {
    const today = new Date();
    return equipmentList
      .filter((checkout) => {
        // Get the most recent checkout for this unit
        const latestCheckout = equipmentList
          .filter((c) => c.unit === checkout.unit)
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
        const isLatestCheckout =
          checkout.createdAt === latestCheckout.createdAt;
        const returnDt = new Date(checkout.returnDate);
        return isLatestCheckout && returnDt < today;
      })
      .map((checkout) => ({
        ...checkout,
        daysOverdue: Math.floor(
          (new Date() - new Date(checkout.returnDate)) /
            (1000 * 60 * 60 * 24)
        ),
      }));
  };

  const getActiveUnitNumbers = () => {
    if (!availableUnits.length) return [];
    const latestCheckout = {};
    const latestCheckin = {};

    // Get latest checkout for each unit
    equipmentList.forEach((checkout) => {
      const time = new Date(checkout.createdAt);
      if (
        !latestCheckout[checkout.unit] ||
        time > new Date(latestCheckout[checkout.unit].createdAt)
      ) {
        latestCheckout[checkout.unit] = checkout;
      }
    });

    // Get latest checkin for each unit
    checkinList.forEach((checkin) => {
      const time = new Date(checkin.createdAt);
      if (
        !latestCheckin[checkin.unit] ||
        time > new Date(latestCheckin[checkin.unit].createdAt)
      ) {
        latestCheckin[checkin.unit] = checkin;
      }
    });

    // Return units that are checked out but not checked in
    return Object.values(latestCheckout)
      .filter((checkout) => {
        const checkin = latestCheckin[checkout.unit];
        return (
          !checkin ||
          new Date(checkin.createdAt) < new Date(checkout.createdAt)
        );
      })
      .map((checkout) => checkout.unit);
  };

  const getActiveCheckouts = () => {
    return getActiveUnitNumbers();
  };

  const getActiveUsers = () => {
    const activeUsersMap = new Map();
    const activeUnits = getActiveUnitNumbers();

    equipmentList.forEach((checkout) => {
      if (activeUnits.includes(checkout.unit)) {
        const currentCount = activeUsersMap.get(checkout.customerName) || 0;
        activeUsersMap.set(checkout.customerName, currentCount + 1);
      }
    });
    return Array.from(activeUsersMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      })
    );
  };

  const getEquipmentStats = () => {
    const total = availableUnits.length;
    const active = getActiveCheckouts().length;
    const available = total - active;

    // Count checkouts per unit
    const checkoutCounts = {};
    equipmentList.forEach((checkout) => {
      checkoutCounts[checkout.unit] =
        (checkoutCounts[checkout.unit] || 0) + 1;
    });
    const mostCheckedOut = Object.entries(checkoutCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { total, active, available, mostCheckedOut };
  };

  const getJobSiteSummary = () => {
    const siteCounts = {};
    getActiveCheckouts().forEach((unit) => {
      const checkout = equipmentList.find(
        (c) => c.unit === unit
      );
      if (checkout) {
        siteCounts[checkout.jobSite] =
          (siteCounts[checkout.jobSite] || 0) + 1;
      }
    });
    return siteCounts;
  };

  // ---------------- Rental Equipment Handler ----------------
  const handleRentalEquipmentSelect = (selectedOption) => {
    const selectedRental = selectedOption.value;
    if (selectedRental && !availableUnits.includes(selectedRental)) {
      setAvailableUnits((prevUnits) => [
        ...prevUnits,
        selectedRental,
      ]);
    }
    setSelectedUnit(selectedRental);
  };

  // ---------------- Checkout Submission ----------------
  const addEquipment = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check for required fields
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
      alert("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Validate form fields
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
      const checkoutWithTimestamp = {
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
        createdAt: serverTimestamp(),
        status: "active",
      };

      const docRef = await addDoc(
        collection(db, "checkouts"),
        checkoutWithTimestamp
      );
      console.log("Document written with ID: ", docRef.id);

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

      // Show success message and clear form fields
      setCheckoutMessage("Checkout successful!");
      setSelectedUnit("");
      setCheckoutHoursMiles("");
      setCheckoutDate("");
      setReturnDate("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setJobSite("");
      setProjectCode("");
      setDepartmentID("");

      // Reset form (if needed)
      const checkoutForm = document.getElementById("checkout-form");
      if (checkoutForm) checkoutForm.reset();

      console.log("Checkout completed successfully");

      setTimeout(() => {
        setCheckoutMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding checkout document: ", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "You don't have permission to perform this action."
          : "An error occurred during checkout. Please try again.";
      setCheckoutMessage(errorMessage);
      setTimeout(() => setCheckoutMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Check-In Submission ----------------
  const addCheckin = async (e) => {
    e.preventDefault();
    if (
      !checkinDateTime ||
      !checkinUnit ||
      !checkinHoursMiles ||
      !checkinJobSite ||
      checkinDuration === "" ||
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
      const checkinWithTimestamp = {
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
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "checkins"),
        checkinWithTimestamp
      );
      console.log("Checkin document written with ID: ", docRef.id);

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
      console.error("Error adding checkin document: ", error);
      alert("Error during check-in. Please try again.");
    }
  };

  // ---------------- Calculate Check-In Duration ----------------
  useEffect(() => {
    if (checkinDateTime && checkinUnit) {
      let latestCheckoutTime = null;
      equipmentList.forEach((record) => {
        if (record.unit === checkinUnit) {
          const time = new Date(record.createdAt);
          if (!latestCheckoutTime || time > latestCheckoutTime) {
            latestCheckoutTime = time;
          }
        }
      });
      if (latestCheckoutTime) {
        const diffMs = new Date(checkinDateTime) - latestCheckoutTime;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setCheckinDuration(diffDays > 0 ? diffDays : 0);
      } else {
        setCheckinDuration("");
      }
    } else {
      setCheckinDuration("");
    }
  }, [checkinDateTime, checkinUnit, equipmentList]);

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
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-buttons">
          <button
            className="sidebar-action-button"
            onClick={() =>
              setActiveTab(activeTab === "checkouts" ? null : "checkouts")
            }
          >
            Active Checkouts ({getActiveCheckouts().length})
          </button>
          <button
            className="sidebar-action-button"
            onClick={() =>
              setActiveTab(activeTab === "users" ? null : "users")
            }
          >
            Active Users ({getActiveUsers().length})
          </button>
          <button
            className="sidebar-action-button"
            onClick={() =>
              setActiveTab(activeTab === "stats" ? null : "stats")
            }
          >
            Equipment Stats
          </button>
          <button
            className="sidebar-action-button"
            onClick={() =>
              setActiveTab(activeTab === "returns" ? null : "returns")
            }
          >
            Due Returns
          </button>
        </div>
        <div className="sidebar-content">
          {activeTab === "checkouts" && (
            <div>
              <h3>Active Checkouts</h3>
              <ul>
                {getActiveCheckouts().map((unit, index) => {
                  const latestCheckout = equipmentList
                    .filter((checkout) => checkout.unit === unit)
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    )[0];
                  return (
                    <li key={index}>
                      {unit}
                      <br />
                      <small>
                        {latestCheckout?.customerName ||
                          "No customer info"}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {activeTab === "users" && (
            <div>
              <h3>Active Users</h3>
              <ul>
                {getActiveUsers().map((user, index) => (
                  <li key={index}>
                    {user.name} ({user.count} unit
                    {user.count !== 1 ? "s" : ""})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === "stats" && (
            <div>
              <h3>Equipment Statistics</h3>
              {(() => {
                const stats = getEquipmentStats();
                return (
                  <div>
                    <p>Total Equipment: {stats.total}</p>
                    <p>Active: {stats.active}</p>
                    <p>Available: {stats.available}</p>
                    <h4>Most Used Equipment:</h4>
                    <ul>
                      {stats.mostCheckedOut.map(([unit, count], i) => (
                        <li key={i}>
                          {unit}: {count} checkouts
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          )}
          {activeTab === "returns" && (
            <div>
              <h3>Due Returns</h3>
              <div className="filter-container">
                <select
                  className="days-filter"
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    const today = new Date();
                    const futureDate = new Date();
                    futureDate.setDate(today.getDate() + days);

                    const filteredByDate = equipmentList
                      .filter((checkout) => {
                        const returnDt = new Date(checkout.returnDate);
                        const hasCheckin = checkinList.find(
                          (checkin) =>
                            checkin.unit === checkout.unit &&
                            new Date(checkin.createdAt) >
                              new Date(checkout.createdAt)
                        );
                        return (
                          !hasCheckin &&
                          returnDt >= today &&
                          returnDt <= futureDate
                        );
                      })
                      .sort(
                        (a, b) =>
                          new Date(a.returnDate) - new Date(b.returnDate)
                      );
                    setFilteredDueReturns(filteredByDate);
                  }}
                >
                  <option value="7">Next 7 days</option>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num} day{num !== 1 ? "s" : ""}
                      </option>
                    )
                  )}
                </select>
                <input
                  type="text"
                  placeholder="Search by unit or customer..."
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const currentList =
                      filteredDueReturns || getDueReturns();
                    const filtered = currentList.filter(
                      (item) =>
                        item.unit
                          .toLowerCase()
                          .includes(searchTerm) ||
                        item.customerName
                          .toLowerCase()
                          .includes(searchTerm)
                    );
                    setFilteredDueReturns(filtered);
                  }}
                  className="search-input"
                />
              </div>
              <ul>
                {(filteredDueReturns || getDueReturns()).map((item, i) => (
                  <li key={i}>
                    {item.unit} - {item.customerName}
                    <br />
                    <small>
                      Due:{" "}
                      {new Date(item.returnDate).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
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
      <div className="top-buttons">
        {getOverdueUnits().length > 0 && (
          <button
            className="overdue-alert-button"
            onClick={() => {
              const overdue = getOverdueUnits();
              const message = overdue
                .map(
                  (unit) =>
                    `Unit: ${unit.unit}\nCustomer: ${unit.customerName}\nDue Date: ${new Date(
                      unit.returnDate
                    ).toLocaleDateString()}\nDays Overdue: ${unit.daysOverdue}`
                )
                .join("\n\n");
              alert("OVERDUE UNITS:\n\n" + message);
            }}
          >
            {getOverdueUnits().length} Overdue Unit
            {getOverdueUnits().length !== 1 ? "s" : ""}!
          </button>
        )}
      </div>
      <header className="app-header">
        <h1>Ranch Asset Checkout Form</h1>
        <p className="tagline">Sanford and Son</p>
      </header>

      {currentSection === null ? (
        <div className="landing">
          <button onClick={() => setCurrentSection("checkout")}>
            Check-Out
          </button>
          <button onClick={() => setCurrentSection("checkin")}>
            Check-In
          </button>
        </div>
      ) : (
        <div className="section-container">
          <button
            className="back-button"
            onClick={() => setCurrentSection(null)}
          >
            ← Back
          </button>
          {currentSection === "checkout" ? (
            <section className="checkout">
              <h2>Equipment Check-Out</h2>
              <div className="section-header">
                <div className="active-checkouts inline">
                  <h3>Select Equipment to Checkout</h3>
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
                    value={
                      selectedUnit
                        ? { value: selectedUnit, label: selectedUnit }
                        : null
                    }
                    onChange={(option) => {
                      setSelectedUnit(option.value);
                      if (rentalEquipmentList.includes(option.value)) {
                        handleRentalEquipmentSelect(option);
                      }
                    }}
                    placeholder="Select Equipment"
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              <form id="checkout-form" onSubmit={addEquipment}>
                <div>
                  <label>
                    Hours/Miles:
                    <input
                      type="text"
                      value={checkoutHoursMiles}
                      onChange={(e) =>
                        setCheckoutHoursMiles(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCustomerEmail(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCustomerPhone(e.target.value)
                      }
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
                      value={
                        jobSite ? { value: jobSite, label: jobSite } : null
                      }
                      onChange={(option) => setJobSite(option.value)}
                      placeholder="Select Job Site"
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Project Code Dropdown */}
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({
                        value: code,
                        label: code,
                      }))}
                      value={
                        projectCode
                          ? { value: projectCode, label: projectCode }
                          : null
                      }
                      onChange={(option) =>
                        setProjectCode(option.value)
                      }
                      placeholder="Select Project Code"
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Department ID Dropdown */}
                <div>
                  <label>
                    Department ID:
                    <Select
                      options={departmentIDs.map((dept) => ({
                        value: dept,
                        label: dept,
                      }))}
                      value={
                        departmentID
                          ? { value: departmentID, label: departmentID }
                          : null
                      }
                      onChange={(option) =>
                        setDepartmentID(option.value)
                      }
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
                      onChange={(e) =>
                        setCheckoutDate(e.target.value)
                      }
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Return Date:
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) =>
                        setReturnDate(e.target.value)
                      }
                    />
                  </label>
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Checkout Equipment"}
                </button>
              </form>
              {checkoutMessage && (
                <p className="message">{checkoutMessage}</p>
              )}
            </section>
          ) : (
            <section className="checkin">
              <h2>Equipment Check-In</h2>
              <div className="section-header">
                <div className="active-checkouts inline">
                  <h3>Select Equipment to Check In</h3>
                  <Select
                    options={[
                      {
                        label: "Active Checkouts",
                        options: getActiveUnitNumbers().map((unit) => ({
                          value: unit,
                          label: unit,
                        })),
                      },
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
                    value={
                      checkinUnit
                        ? { value: checkinUnit, label: checkinUnit }
                        : null
                    }
                    onChange={(option) => {
                      setCheckinUnit(option.value);
                      // Find the latest checkout for this unit
                      const latestCheckout = equipmentList
                        .filter(
                          (checkout) =>
                            checkout.unit === option.value
                        )
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                        )[0];

                      if (latestCheckout) {
                        setCheckinCustomerName(
                          latestCheckout.customerName
                        );
                        setCheckinCustomerEmail(
                          latestCheckout.customerEmail
                        );
                        setCheckinCustomerPhone(
                          latestCheckout.customerPhone
                        );
                      }
                    }}
                    placeholder="Select Unit to Check In"
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              <form onSubmit={addCheckin}>
                <div>
                  <label>
                    Hours/Miles:
                    <input
                      type="text"
                      value={checkinHoursMiles}
                      onChange={(e) =>
                        setCheckinHoursMiles(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCheckinCustomerName(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCheckinCustomerEmail(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCheckinCustomerPhone(e.target.value)
                      }
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
                      value={
                        checkinJobSite
                          ? { value: checkinJobSite, label: checkinJobSite }
                          : null
                      }
                      onChange={(option) =>
                        setCheckinJobSite(option.value)
                      }
                      placeholder="Select Job Site"
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Project Code Dropdown for Check-In */}
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({
                        value: code,
                        label: code,
                      }))}
                      value={
                        checkinProjectCode
                          ? {
                              value: checkinProjectCode,
                              label: checkinProjectCode,
                            }
                          : null
                      }
                      onChange={(option) =>
                        setCheckinProjectCode(option.value)
                      }
                      placeholder="Select Project Code"
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Department ID Dropdown for Check-In */}
                <div>
                  <label>
                    Department ID:
                    <Select
                      options={departmentIDs.map((dept) => ({
                        value: dept,
                        label: dept,
                      }))}
                      value={
                        checkinDepartmentID
                          ? {
                              value: checkinDepartmentID,
                              label: checkinDepartmentID,
                            }
                          : null
                      }
                      onChange={(option) =>
                        setCheckinDepartmentID(option.value)
                      }
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
                      onChange={(e) =>
                        setCheckinDateTime(e.target.value)
                      }
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
                      onChange={(e) =>
                        setCheckinInspectionNotes(e.target.value)
                      }
                      placeholder="Enter inspection notes"
                    ></textarea>
                  </label>
                </div>
                <button type="submit">Check-In Equipment</button>
              </form>
              {checkinMessage && (
                <p className="message">{checkinMessage}</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

