const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      patients: [],
      doctors: [],
      appointments: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const data = readData();

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const exists = data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    data.users.push({
      id: Date.now(),
      fullName,
      email,
      password
    });

    writeData(data);

    return res.json({ success: true, message: "Registered successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Registration failed." });
  }
});

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const data = readData();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      user: {
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed." });
  }
});

app.get("/stats", (req, res) => {
  const data = readData();
  res.json({
    totalPatients: data.patients.length,
    totalDoctors: data.doctors.length,
    totalAppointments: data.appointments.length,
    totalUsers: data.users.length
  });
});

app.get("/patients", (req, res) => {
  const data = readData();
  res.json(data.patients);
});

app.post("/patients", (req, res) => {
  try {
    const { name, age, gender, disease, phone, address } = req.body;
    const data = readData();

    if (!name || !age || !gender || !disease || !phone || !address) {
      return res.status(400).json({ message: "All patient fields are required." });
    }

    data.patients.push({
      id: Date.now(),
      name,
      age,
      gender,
      disease,
      phone,
      address
    });

    writeData(data);
    res.json({ message: "Patient added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add patient." });
  }
});

app.get("/doctors", (req, res) => {
  const data = readData();
  res.json(data.doctors);
});

app.post("/doctors", (req, res) => {
  try {
    const { name, specialization, experience, phone } = req.body;
    const data = readData();

    if (!name || !specialization || !experience || !phone) {
      return res.status(400).json({ message: "All doctor fields are required." });
    }

    data.doctors.push({
      id: Date.now(),
      name,
      specialization,
      experience,
      phone
    });

    writeData(data);
    res.json({ message: "Doctor added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add doctor." });
  }
});

app.get("/appointments", (req, res) => {
  const data = readData();
  res.json(data.appointments);
});

app.post("/appointments", (req, res) => {
  try {
    const { patient_name, doctor_name, appointment_date, appointment_time } = req.body;
    const data = readData();

    if (!patient_name || !doctor_name || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "All appointment fields are required." });
    }

    data.appointments.push({
      id: Date.now(),
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
      status: "Scheduled"
    });

    writeData(data);
    res.json({ message: "Appointment booked successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to book appointment." });
  }
});

ensureDataFile();

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});