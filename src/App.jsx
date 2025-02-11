// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Pre-uploaded list of unit numbers.
const preUploadedUnits = ["Unit 101", "Unit 102", "Unit 103", "Unit 104"];

// Pre-programmed job sites for the drop-down menu (alphabetically sorted)
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
  /*** CHECKOUT FORM STATE & HANDLERS ***/
  // List of checkout transactions (from Firestore)
  const [equipmentList, setEquipmentList] = useState([]);

  // Checkout form fields (using Customer instead of Employee)
  const [selectedUnit, setSelectedUnit] = useState(preUploadedUnits[0]);
  const [checkoutHoursMiles, setCheckoutHoursMiles] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState(""); // User-selected return date
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [jobSite, setJobSite] = useState(preProgrammedJobSites[0]);

  // Save new checkout record to Firestore and update local state.
  const addEquipment = async (e) => {
    e.preventDefault();
    if (
      selectedUnit &&
      checkoutHoursMiles &&
      checkoutDate &&
      returnDate &&
      customerName &&
      customerEmail &&
      jobSite
    ) {
      const newCheckout = {
        unit: selectedUnit,
        hoursMiles: checkoutHoursMiles,
        checkoutDate,
        returnDate,
        customerName,
        customerEmail,
        jobSite,
        createdAt: new Date()
      };

      try {
        // Save the new record to the "checkouts" collection in Firestore.
        await addDoc(collection(db, "checkouts"), newCheckout);
        // Optionally update local state so your UI shows the new record.
        setEquipmentList([...equipmentList, newCheckout]);

        // Reset the checkout form fields.
        setSelectedUnit(preUploadedUnits[0]);
        setCheckoutHoursMiles("");
        setCheckoutDate("");
        setReturnDate("");
        setCustomerName("");
        setCustomerEmail("");
        setJobSite(preProgrammedJobSites[0]);
      } catch (error) {
        console.error("Error adding checkout document: ", error);
      }
    } else {
      alert("Please fill in all checkout fields.");
    }
  };

  // Retrieve existing checkout records from Firestore on load.
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

  // Handler to remove a checkout record from local state.
  // (Note: For full deletion from Firestore, you would use deleteDoc.)
  const removeEquipment = (id) => {
    const updatedList = equipmentList.filter((item) => item.id !== id);
    setEquipmentList(updatedList);
  };

  /*** CHECK-IN FORM STATE & HANDLERS ***/
  // List of check-in transactions (from Firestore)
  const [checkinList, setCheckinList] = useState([]);

  // Check-in form fields
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [checkinUnit, setCheckinUnit] = useState(preUploadedUnits[0]);
  const [checkinHoursMiles, setCheckinHoursMiles] = useState("");
  const [checkinJobSite, setCheckinJobSite] = useState(preProgrammedJobSites[0]);
  const [checkinDuration, setCheckinDuration] = useState(""); // Automatically computed
  const [checkinCustomerName, setCheckinCustomerName] = useState("");
  const [checkinCustomerPhone, setCheckinCustomerPhone] = useState("");
  const [checkinInspectionNotes, setCheckinInspectionNotes] = useState("");

  // Automatically compute the duration (in days) when check-in date or unit changes.
  useEffect(() => {
    if (checkinDateTime && checkinUnit) {
      // Find the matching checkout record for the selected unit.
      const checkoutRecord = equipmentList.find(
        (record) => record.unit === checkinUnit
      );
      if (checkoutRecord && checkoutRecord.checkoutDate) {
        const diffMs =
          new Date(checkinDateTime) - new Date(checkoutRecord.checkoutDate);
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setCheckinDuration(diffDays > 0 ? diffDays : 0);
      } else {
        setCheckinDuration("");
      }
    } else {
      setCheckinDuration("");
    }
  }, [checkinDateTime, checkinUnit, equipmentList]);

  // Save new check-in record to Firestore and update local state.
  const addCheckin = async (e) => {
    e.preventDefault();
    if (
      checkinDateTime &&
      checkinUnit &&
      checkinHoursMiles &&
      checkinJobSite &&
      checkinDuration !== "" && // Ensure duration has been computed
      checkinCustomerName &&
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
        customerPhone: checkinCustomerPhone,
        inspectionNotes: checkinInspectionNotes,
        createdAt: new Date()
      };

      try {
        // Save the new record to the "checkins" collection in Firestore.
        await addDoc(collection(db, "checkins"), newCheckin);
        setCheckinList([...checkinList, newCheckin]);

        // Reset the check-in form fields.
        setCheckinDateTime("");
        setCheckinUnit(preUploadedUnits[0]);
        setCheckinHoursMiles("");
        setCheckinJobSite(preProgrammedJobSites[0]);
        setCheckinDuration("");
        setCheckinCustomerName("");
        setCheckinCustomerPhone("");
        setCheckinInspectionNotes("");
      } catch (error) {
        console.error("Error adding checkin document: ", error);
      }
    } else {
      alert("Please fill in all check‑in fields.");
    }
  };

  // Retrieve existing check-in records from Firestore on load.
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

  // Handler to remove a check-in record from local state.
  const removeCheckin = (id) => {
    const updatedList = checkinList.filter((item) => item.id !== id);
    setCheckinList(updatedList);
  };

  return (
    <div className="App">
      <header>
        <h1>Equipment Tracker</h1>
      </header>

      {/* Container for both forms */}
      <div className="forms">
        {/* Checkout Form Section */}
        <section className="checkout">
          <h2>Equipment Check-Out</h2>
          <form onSubmit={addEquipment}>
            <div>
              <label>
                Unit Number:
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  {preUploadedUnits.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Hours/Miles input immediately below Unit Number */}
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
                Job Site:
                <select
                  value={jobSite}
                  onChange={(e) => setJobSite(e.target.value)}
                >
                  {preProgrammedJobSites.map((site, index) => (
                    <option key={index} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button type="submit">Checkout Equipment</button>
          </form>

          <h3>Checked Out Equipment</h3>
          <ul>
            {equipmentList.map((item, index) => (
              <li key={index}>
                <strong>Unit:</strong> {item.unit} |{" "}
                <strong>Hours/Miles:</strong> {item.hoursMiles} |{" "}
                <strong>Checkout Date:</strong> {item.checkoutDate} |{" "}
                <strong>Return Date:</strong> {item.returnDate} |{" "}
                <strong>Customer:</strong> {item.customerName} |{" "}
                <strong>Customer Email:</strong> {item.customerEmail} |{" "}
                <strong>Job Site:</strong> {item.jobSite}
                <button onClick={() => removeEquipment(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Check-In Form Section */}
        <section className="checkin">
          <h2>Equipment Check-In</h2>
          <form onSubmit={addCheckin}>
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
                Unit Number:
                <select
                  value={checkinUnit}
                  onChange={(e) => setCheckinUnit(e.target.value)}
                >
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
                Job Site:
                <select
                  value={checkinJobSite}
                  onChange={(e) => setCheckinJobSite(e.target.value)}
                >
                  {preProgrammedJobSites.map((site, index) => (
                    <option key={index} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Duration is automatically computed and is read-only */}
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

          <h3>Checked In Equipment</h3>
          <ul>
            {checkinList.map((item, index) => (
              <li key={index}>
                <strong>Date/Time Returned:</strong> {item.dateTimeReturned} |{" "}
                <strong>Unit:</strong> {item.unit} |{" "}
                <strong>Hours/Miles:</strong> {item.hoursMiles} |{" "}
                <strong>Job Site:</strong> {item.jobSite} |{" "}
                <strong>Duration:</strong> {item.duration} |{" "}
                <strong>Customer:</strong> {item.customerName} |{" "}
                <strong>Phone:</strong> {item.customerPhone} |{" "}
                <strong>Inspection Notes:</strong> {item.inspectionNotes}
                <button onClick={() => removeCheckin(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App; 
