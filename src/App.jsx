// App.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import Select, { components } from "react-select"; // Ensure react-select is installed
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "emailjs-com";
import './reminderService'; // Import the reminder service if used

// ---------------- EmailJS Configuration ----------------
const EMAILJS_SERVICE_ID = "service_fimxodg";
const EMAILJS_TEMPLATE_ID_CHECKOUT = "template_bxx6jfh";
const EMAILJS_TEMPLATE_ID_CHECKIN = "template_oozid5v";
const EMAILJS_USER_ID = "wyfCLJgbJeNcu3092";

// ---------------- Custom Styles for react-select ----------------
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    minHeight: "40px",
    fontSize: "16px",
    border: state.isFocused ? "2px solid #34495e" : "2px solid #34495e",
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
  "James Cook Hanger"
];

const validateForm = (formData) => {
  const errors = {};
  if (!formData.hoursMiles.match(/^\d+$/)) {
    errors.hoursMiles = "Please enter a valid number";
  }
  if (!formData.customerPhone.match(/^\d{10}$/)) {
    errors.customerPhone = "Please enter a valid 10-digit phone number";
  }
  return errors;
};

const rentalEquipmentList = ["Excavator X100", "Bulldozer B200", "Crane C300"];

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
  "6BAR.WTR"
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
  "RM 2300 Wildlife"
];

function App() {
  useEffect(() => {
    document.title = "Daugherty Ranches Equipment Tracker";
  }, []);

  // ---------------- Section Navigation State ----------------
  // currentSection: null (landing page), "checkout", or "checkin"
  const [currentSection, setCurrentSection] = useState(null);

  // ---------------- Message States ----------------
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");

  // ---------------- Checkout Form State ----------------
  // equipmentList stores checkout records fetched from Firestore.
  const [equipmentList, setEquipmentList] = useState([]);
  // availableUnits is used so that rental equipment can be added dynamically.
  const [availableUnits, setAvailableUnits] = useState(preUploadedUnits);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobSite, setJobSite] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  // New fields for checkout
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
  // New fields for check-in
  const [checkinProjectCode, setCheckinProjectCode] = useState("");
  const [checkinDepartmentID, setCheckinDepartmentID] = useState("");

  // ---------------- Rental Equipment Drop-Down Handler ----------------
  const handleRentalEquipmentSelect = (selectedOption) => {
    const selectedRental = selectedOption.value;
    if (selectedRental && !availableUnits.includes(selectedRental)) {
      setAvailableUnits((prevUnits) => [...prevUnits, selectedRental]);
    }
    setSelectedUnit(selectedRental);
  };

  const addEquipment = async (e) => {
    e.preventDefault();

    if (!window.confirm(`Are you sure you want to check out ${selectedUnit}?`)) {
      return;
    }
    if (
      selectedUnit &&
      checkoutHoursMiles &&
      checkoutDate &&
      returnDate &&
      customerName &&
      customerEmail &&
      customerPhone &&
      jobSite &&
      projectCode &&
      departmentID
    ) {
      const newCheckout = {
        unit: selectedUnit,
        hoursMiles: checkoutHoursMiles,
        checkoutDate,
        returnDate,
        customerName,
        customerEmail,
        customerPhone,
        jobSite,
        projectCode,       // new field
        departmentID,      // new field
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, "checkouts"), newCheckout);
        setCheckoutMessage("Checkout successful!");
        emailjs
          .send(
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
          )
          .catch((err) => console.error("Failed to send email:", err));
        // Reset checkout form fields.
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
        setTimeout(() => setCheckoutMessage(""), 3000);
      } catch (error) {
        console.error("Error adding checkout document: ", error);
      }
    } else {
      alert("Please fill in all checkout fields.");
    }
  };

  // ---------------- Retrieve Checkout Records ----------------
  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "checkouts"));
        const checkouts = [];
        querySnapshot.forEach((doc) => {
          checkouts.push({ id: doc.id, ...doc.data() });
        });
        setEquipmentList(checkouts);
      } catch (error) {
        console.error("Error fetching checkouts: ", error);
      }
    };
    fetchCheckouts();
  }, []);

  // ---------------- Calculate Check-In Duration ----------------
  // Use checkout records (equipmentList) to compute the duration.
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

  const addCheckin = async (e) => {
    e.preventDefault();
    if (
      checkinDateTime &&
      checkinUnit &&
      checkinHoursMiles &&
      checkinJobSite &&
      checkinDuration !== "" &&
      checkinCustomerName &&
      checkinCustomerEmail &&
      checkinCustomerPhone &&
      checkinInspectionNotes &&
      checkinProjectCode &&
      checkinDepartmentID
    ) {
      const newCheckin = {
        dateTimeReturned: checkinDateTime,
        unit: checkinUnit,
        hoursMiles: checkinHoursMiles,
        jobSite: checkinJobSite,
        duration: checkinDuration,
        customerName: checkinCustomerName,
        customerEmail: checkinCustomerEmail,
        customerPhone: checkinCustomerPhone,
        inspectionNotes: checkinInspectionNotes,
        projectCode: checkinProjectCode,      // new field
        departmentID: checkinDepartmentID,    // new field
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, "checkins"), newCheckin);
        setCheckinMessage("Check-in successful!");
        emailjs
          .send(
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
          )
          .catch((err) => console.error("Failed to send email:", err));
        // Reset check-in form fields.
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
        setTimeout(() => setCheckinMessage(""), 3000);
      } catch (error) {
        console.error("Error adding checkin document: ", error);
      }
    } else {
      alert("Please fill in all check-in fields.");
    }
  };

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "checkins"));
        const checkins = [];
        querySnapshot.forEach((doc) => {
          checkins.push({ id: doc.id, ...doc.data() });
        });
        setCheckinList(checkins);
      } catch (error) {
        console.error("Error fetching checkins: ", error);
      }
    };
    fetchCheckins();
  }, []);

  // ---------------- Active Checkouts Section ----------------
  const getActiveUnitNumbers = () => {
    if (!availableUnits.length || !checkinList.length) return [];
    const latestCheckout = {};
    availableUnits.forEach((unit) => {
      equipmentList.forEach((checkout) => {
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
      const correspondingCheckin = checkinList.find(
        (checkin) =>
          checkin.unit === unit &&
          checkin.createdAt &&
          new Date(checkin.createdAt) > latestCheckout[unit]
      );
      if (!correspondingCheckin) {
        activeUnits.push(unit);
      }
    }
    return activeUnits;
  };

  


  return (
    <div className="App">
      <header className="app-header">
        <h1>Daugherty Ranches Equipment Tracker</h1>
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
          <button className="back-button" onClick={() => setCurrentSection(null)}>
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
                          }))
                        },
                      ]}
                      components={{
                        Input: ({ children, ...props }) => (
                          <components.Input {...props}>
                            <input 
                              {...props.innerProps}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                outline: 'none',
                                width: '100%'
                              }}
                            />
                            {children}
                          </components.Input>
                        )
                      }}
                        {
                          label: "Rental Equipment",
                          options: rentalEquipmentList.map((item) => ({
                            value: item,
                            label: item,
                          }))
                        }
                      ]}
                      value={selectedUnit ? { value: selectedUnit, label: selectedUnit } : null}
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
              <form onSubmit={addEquipment}>
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
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Project Code Dropdown */}
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({ value: code, label: code }))}
                      value={projectCode ? { value: projectCode, label: projectCode } : null}
                      onChange={(option) => setProjectCode(option.value)}
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
                      options={departmentIDs.map((dept) => ({ value: dept, label: dept }))}
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
                <button type="submit">Checkout Equipment</button>
              </form>
              {checkoutMessage && <p className="message">{checkoutMessage}</p>}
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
                        }))
                      },
                      {
                        label: "Ranch Equipment",
                        options: availableUnits.map((unit) => ({
                          value: unit,
                          label: unit,
                        }))
                      },
                      {
                        label: "Rental Equipment",
                        options: rentalEquipmentList.map((item) => ({
                          value: item,
                          label: item,
                        }))
                      }
                    ]}
                    value={checkinUnit ? { value: checkinUnit, label: checkinUnit } : null}
                    onChange={(option) => setCheckinUnit(option.value)}
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
                      onChange={(e) => setCheckinHoursMiles(e.target.value)}
                      placeholder="Enter hours or miles"
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
                      styles={customSelectStyles}
                    />
                  </label>
                </div>
                {/* New Project Code Dropdown for Check-In */}
                <div>
                  <label>
                    Project Code:
                    <Select
                      options={projectCodes.map((code) => ({ value: code, label: code }))}
                      value={
                        checkinProjectCode ? { value: checkinProjectCode, label: checkinProjectCode } : null
                      }
                      onChange={(option) => setCheckinProjectCode(option.value)}
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
                      options={departmentIDs.map((dept) => ({ value: dept, label: dept }))}
                      value={
                        checkinDepartmentID ? { value: checkinDepartmentID, label: checkinDepartmentID } : null
                      }
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
                    <input type="number" value={checkinDuration} readOnly />
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