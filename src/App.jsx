import React, { useState, useEffect } from "react";
import "./App.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "emailjs-com";

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID_CHECKOUT = "YOUR_CHECKOUT_TEMPLATE_ID";
const EMAILJS_TEMPLATE_ID_CHECKIN = "YOUR_CHECKIN_TEMPLATE_ID";
const EMAILJS_USER_ID = "YOUR_USER_ID";

// Pre-defined arrays
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
  "18", "6bar", "Apache Canyon Road", "Apache Screen Site",
  "Babb Canyon Road", "Babb HQ", "Baylor", "Big Tank HQ",
  "Chico", "Clock", "Delaware Basin", "DOD", "Fenceline East",
  "Fenceline West", "Figure 2", "Highline Road", "Hogue Canyon",
  "Honeycutt HQ", "Honeycutt Rim North", "Houge Pump Jack",
  "James Cook Hanger", "Lower Puett", "Mule Pasture", "North Baylor",
  "North VMB HQ", "Old West Town", "Pipeline (East)", "Pipeline (West)",
  "Prison Camp", "Puckett", "Puett HQ", "Red Pens", "Roberts HQ",
  "Roberts Quarry", "Rock House", "Roller Coaster Road",
  "Sanford N Sons", "Shortcut", "Sierra Diablo", "South Baylor",
  "Space World", "Stockyard", "Victorio Canyon", "VMB",
  "Wind Tower Road (Bottom)", "Windtower Road (Top)", "Wilson HQ",
  "Welding Shop"
];

// Helper function to send a checkout email alert
const sendCheckoutEmail = (checkoutData) => {
  const templateParams = {
    to_email: "recipient@example.com",
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
    .send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_CHECKOUT,
      templateParams,
      EMAILJS_USER_ID
    )
    .then(
      (response) => {
        console.log("Checkout email sent successfully!", response.status, response.text);
      },
      (error) => {
        console.error("Checkout email sending failed:", error);
      }
    );
};

// Helper function to send a check-in email alert
const sendCheckinEmail = (checkinData) => {
  const templateParams = {
    to_email: "recipient@example.com",
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
    .send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_CHECKIN,
      templateParams,
      EMAILJS_USER_ID
    )
    .then(
      (response) => {
        console.log("Checkin email sent successfully!", response.status, response.text);
      },
      (error) => {
        console.error("Checkin email sending failed:", error);
      }
    );
};

// Helper function to send an SMS alert via Twilio
const sendSmsAlert = async (toPhone, message) => {
  try {
    const response = await fetch("https://YOUR_TWILIO_FUNCTION_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toPhone,
        message
      })
    });
    const data = await response.json();
    console.log("SMS alert sent successfully:", data);
  } catch (error) {
    console.error("Error sending SMS alert:", error);
  }
};

function App() {
  // Message states
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // Equipment list state
  const [equipmentList, setEquipmentList] = useState([]);
  const [checkinList, setCheckinList] = useState([]);

  // Checkout form states
  const [selectedUnit, setSelectedUnit] = useState(preUploadedUnits[0]);
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobSite, setJobSite] = useState(preProgrammedJobSites[0]);
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Check-in form states
  const [checkinUnit, setCheckinUnit] = useState(preUploadedUnits[0]);
  const [checkinHoursMiles, setCheckinHoursMiles] = useState("");
  const [checkinCustomerName, setCheckinCustomerName] = useState("");
  const [checkinCustomerEmail, setCheckinCustomerEmail] = useState("");
  const [checkinCustomerPhone, setCheckinCustomerPhone] = useState("");
  const [checkinJobSite, setCheckinJobSite] = useState(preProgrammedJobSites[0]);
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [checkinDuration, setCheckinDuration] = useState("");
  const [checkinInspectionNotes, setCheckinInspectionNotes] = useState("");

  // Active checkouts state
  const [selectedActiveUnit, setSelectedActiveUnit] = useState("");

  // Helper function to get active unit numbers
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

  // Helper function to get the latest checkout by unit
  const getLatestCheckoutByUnit = (unit) => {
    let latest = null;
    equipmentList.forEach((record) => {
      if (record.unit === unit) {
        const time = new Date(record.createdAt);
        if (!latest || time > new Date(latest.createdAt)) {
          latest = record;
        }
      }
    });
    return latest;
  };

  // Effect to fetch checkouts
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

  // Effect to fetch checkins
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

  // Effect to compute duration for check-in
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

  // Handle checkout submission
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

        // Reset form
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

  // Handle check-in submission
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

        // Reset form
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

  // Handle SMS alert
  const handleSendSmsAlert = () => {
    if (!selectedActiveUnit) {
      alert("Please select an active unit.");
      return;
    }
    const record = getLatestCheckoutByUnit(selectedActiveUnit);
    if (record) {
      const message = `Dear ${record.customerName}, this is a reminder to return the unit "${record.unit}" that you checked out on ${record.checkoutDate}. The unit is due back by ${record.returnDate}. Please contact us if you have any questions.`;
      sendSmsAlert(record.customerPhone, message);
      setSmsMessage("SMS alert sent!");
      setTimeout(() => setSmsMessage(""), 3000);
    } else {
      alert("No checkout record found for the selected unit.");
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Equipment Tracker</h1>
      </header>

      <div className="forms-row">
        <section className="checkout">
          <h2>Equipment Check-Out</h2>
          <form onSubmit={addEquipment}>
            <div>
              <label>
                Unit Number:
                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                  {preUploadedUnits.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
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
                    <option key={index} value={site}>
                      {site}
                    </option>
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

        <section className="checkin">
          <h2>Equipment Check-In</h2>
          <form onSubmit={addCheckin}>
            <div>
              <label>
                Unit Number:
                <select value={checkinUnit} onChange={(e) => setCheckinUnit(e.target.value)}>
                  {preUploadedUnits.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
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
                    <option key={index} value={site}>
                      {site}
                    </option>
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

      <section className="active-checkouts">
        <h2>Active Checkouts</h2>
        <label>
          Currently Checked Out Units:
          <select
            value={selectedActiveUnit}
            onChange={(e) => setSelectedActiveUnit(e.target.value)}
          >
            <option value="">Select a unit</option>
            {getActiveUnitNumbers().map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleSendSmsAlert}>Send Return Alert</button>
        {smsMessage && <p className="message">{smsMessage}</p>}
      </section>
    </div>
  );
}

export default App;