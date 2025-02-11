// App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "emailjs-com"; // Import EmailJS

// --- EmailJS Configuration ---
// Replace the placeholder strings with your actual EmailJS values.
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID_CHECKOUT = "YOUR_CHECKOUT_TEMPLATE_ID";
const EMAILJS_TEMPLATE_ID_CHECKIN = "YOUR_CHECKIN_TEMPLATE_ID";
const EMAILJS_USER_ID = "YOUR_USER_ID"; // also known as Public Key

// --- Helper Functions for Sending Emails ---
// Function to send checkout email alert
const sendCheckoutEmail = (checkoutData) => {
  const templateParams = {
    to_email: "recipient@example.com", // Change or make dynamic as needed.
    unit: checkoutData.unit,
    hoursMiles: checkoutData.hoursMiles,
    checkoutDate: checkoutData.checkoutDate,
    returnDate: checkoutData.returnDate,
    customerName: checkoutData.customerName,
    customerEmail: checkoutData.customerEmail,
    customerPhone: checkoutData.customerPhone,
    jobSite: checkoutData.jobSite,
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_CHECKOUT, templateParams, EMAILJS_USER_ID)
    .then(
      (response) => {
        console.log("Checkout email sent successfully!", response.status, response.text);
      },
      (error) => {
        console.error("Checkout email sending failed:", error);
      }
    );
};

// Function to send check-in email alert
const sendCheckinEmail = (checkinData) => {
  const templateParams = {
    to_email: "recipient@example.com", // Change or make dynamic as needed.
    unit: checkinData.unit,
    hoursMiles: checkinData.hoursMiles,
    dateTimeReturned: checkinData.dateTimeReturned,
    duration: checkinData.duration,
    customerName: checkinData.customerName,
    customerEmail: checkinData.customerEmail,
    customerPhone: checkinData.customerPhone,
    jobSite: checkinData.jobSite,
    inspectionNotes: checkinData.inspectionNotes,
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_CHECKIN, templateParams, EMAILJS_USER_ID)
    .then(
      (response) => {
        console.log("Checkin email sent successfully!", response.status, response.text);
      },
      (error) => {
        console.error("Checkin email sending failed:", error);
      }
    );
};

// --- Data Arrays ---
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
  "394 Cat Mini Ex"
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
  "Lower Puett",
  "Mule Pasture",
  "North Baylor",
  "North VMB HQ",
  "Old West Town",
  "Pipeline (East)",
  "Pipeline (West)",
  "Prison Camp",
  "Puckett",
  "Puett HQ",
  "Red Pens",
  "Roberts HQ",
  "Roberts Quarry",
  "Rock House",
  "Roller Coaster Road",
  "Sanford N Sons",
  "Shortcut",
  "Sierra Diablo",
  "South Baylor",
  "Space World",
  "Stockyard",
  "Victorio Canyon",
  "VMB",
  "Wind Tower Road (Bottom)",
  "Windtower Road (Top)",
  "Wilson HQ",
  "Welding Shop"
];

function App() {
  // --- Message States ---
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");

  // --- Checkout Form State ---
  const [equipmentList, setEquipmentList] = useState([]); // from Firestore

  // Common fields for both forms:
  const [selectedUnit, setSelectedUnit] = useState(preUploadedUnits[0]);
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobSite, setJobSite] = useState(preProgrammedJobSites[0]);

  // Checkout-specific fields:
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // --- Function to Add Checkout ---
  const addEquipment = async (e) => {
    e.preventDefault();
    if (
      selectedUnit &&
      checkoutHoursMiles &&
      checkoutDate &&
      returnDate &&
      customerName &&
      customerEmail &&
      customerPhone &&
      jobSite
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
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, "checkouts"), newCheckout);
        setEquipmentList([...equipmentList, newCheckout]);
        setCheckoutMessage("Checkout successful!");
        sendCheckoutEmail(newCheckout);

        // Reset form fields
        setSelectedUnit(preUploadedUnits[0]);
        setCheckoutHoursMiles("");
        setCheckoutDate("");
        setReturnDate("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setJobSite(preProgrammedJobSites[0]);

        setTimeout(() => setCheckoutMessage(""), 3000);
      } catch (error) {
        console.error("Error adding checkout document: ", error);
      }
    } else {
      alert("Please fill in all checkout fields.");
    }
  };

  // --- Retrieve Checkout Records from Firestore ---
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

  // --- Check-In Form State ---
  const [checkinList, setCheckinList] = useState([]);

  // Check-in common fields (separate from checkout)
  const [checkinUnit, setCheckinUnit] = useState(preUploadedUnits[0]);
  const [checkinHoursMiles, setCheckinHoursMiles] = useState("");
  const [checkinCustomerName, setCheckinCustomerName] = useState("");
  const [checkinCustomerEmail, setCheckinCustomerEmail] = useState("");
  const [checkinCustomerPhone, setCheckinCustomerPhone] = useState("");
  const [checkinJobSite, setCheckinJobSite] = useState(preProgrammedJobSites[0]);

  // Check-in-specific fields:
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [checkinDuration, setCheckinDuration] = useState("");
  const [checkinInspectionNotes, setCheckinInspectionNotes] = useState("");

  // --- Compute Duration for Check-In ---
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

  // --- Function to Add Check-In ---
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
      checkinInspectionNotes
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
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, "checkins"), newCheckin);
        setCheckinMessage("Check-in successful!");
        setCheckinList([...checkinList, newCheckin]);
        sendCheckinEmail(newCheckin);

        // Reset check-in form fields.
        setCheckinDateTime("");
        setCheckinUnit(preUploadedUnits[0]);
        setCheckinHoursMiles("");
        setCheckinJobSite(preProgrammedJobSites[0]);
        setCheckinDuration("");
        setCheckinCustomerName("");
        setCheckinCustomerEmail("");
        setCheckinCustomerPhone("");
        setCheckinInspectionNotes("");

        setTimeout(() => setCheckinMessage(""), 3000);
      } catch (error) {
        console.error("Error adding checkin document: ", error);
      }
    } else {
      alert("Please fill in all check-in fields.");
    }
  };

  // --- Retrieve Check-In Records from Firestore ---
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

  // --- Function to Compute Active (Currently Checked-Out) Units ---
  const getActiveUnitNumbers = () => {
    const latestCheckout = {};
    equipmentList.forEach((checkout) => {
      const unit = checkout.unit;
      const time = new Date(checkout.createdAt);
      if (!latestCheckout[unit] || time > latestCheckout[unit]) {
        latestCheckout[unit] = time;
      }
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
      <header>
        <h1>Equipment Tracker</h1>
      </header>

      {/* Container for Check-Out and Check-In Sections Side by Side */}
      <div className="forms-row">
        {/* Check-Out Form Section */}
        <section className="checkout">
          <h2>Equipment Check-Out</h2>
          <form onSubmit={addEquipment}>
            <div>
              <label>
                Unit Number:
                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                  {preUploadedUnits.map((unit, index) => (
                    <option key={index} value={unit}>{unit}</option>
                  ))}
                </select>
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
                <select value={jobSite} onChange={(e) => setJobSite(e.target.value)}>
                  {preProgrammedJobSites.map((site, index) => (
                    <option key={index} value={site}>{site}</option>
                  ))}
                </select>
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

        {/* Check-In Form Section */}
        <section className="checkin">
          <h2>Equipment Check-In</h2>
          <form onSubmit={addCheckin}>
            <div>
              <label>
                Unit Number:
                <select value={checkinUnit} onChange={(e) => setCheckinUnit(e.target.value)}>
                  {preUploadedUnits.map((unit, index) => (
                    <option key={index} value={unit}>{unit}</option>
                  ))}
                </select>
              </label>
            </div>
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
                <select value={checkinJobSite} onChange={(e) => setCheckinJobSite(e.target.value)}>
                  {preProgrammedJobSites.map((site, index) => (
                    <option key={index} value={site}>{site}</option>
                  ))}
                </select>
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
      </div>

      {/* Active Checkouts Section (Below the forms row) */}
      <section className="active-checkouts">
        <h2>Active Checkouts</h2>
        <label>
          Currently Checked Out Units:
          <select>
            {getActiveUnitNumbers().map((unit, index) => (
              <option key={index} value={unit}>{unit}</option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}

export default App;