const express = require("express");
const path = require("path");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "hospital-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

const db = new sqlite3.Database("hospital.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Admin'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      disease TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      experience TEXT,
      phone TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`ALTER TABLE patients ADD COLUMN address TEXT`, () => {});
  db.run(`ALTER TABLE doctors ADD COLUMN experience TEXT`, () => {});
  db.run(`ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'Scheduled'`, () => {});
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }
  next();
}

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error." });
    }

    if (user) {
      return res.status(400).json({ message: "Email already registered." });
    }

    db.run(
      "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
      [fullName, email, password, "Admin"],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Registration failed." });
        }
        res.json({ message: "Registration successful! Please login." });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Login failed." });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      req.session.user = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      };

      res.json({ message: "Login successful!" });
    }
  );
});

app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in." });
  }
  res.json(req.session.user);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully." });
  });
});

app.post("/patients", requireLogin, (req, res) => {
  const { name, age, gender, disease, phone, address } = req.body;

  if (!name || !age || !gender || !disease || !phone || !address) {
    return res.status(400).json({ message: "All patient fields are required." });
  }

  db.run(
    `INSERT INTO patients (name, age, gender, disease, phone, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, age, gender, disease, phone, address],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to add patient." });
      }
      res.json({ message: "Patient added successfully." });
    }
  );
});

app.get("/patients", requireLogin, (req, res) => {
  db.all("SELECT * FROM patients ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch patients." });
    }
    res.json(rows);
  });
});

app.put("/patients/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const { name, age, gender, disease, phone, address } = req.body;

  if (!name || !age || !gender || !disease || !phone || !address) {
    return res.status(400).json({ message: "All patient fields are required." });
  }

  db.run(
    `UPDATE patients
     SET name = ?, age = ?, gender = ?, disease = ?, phone = ?, address = ?
     WHERE id = ?`,
    [name, age, gender, disease, phone, address, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to update patient." });
      }
      res.json({ message: "Patient updated successfully." });
    }
  );
});

app.delete("/patients/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM patients WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Failed to delete patient." });
    }
    res.json({ message: "Patient deleted successfully." });
  });
});

app.post("/doctors", requireLogin, (req, res) => {
  const { name, specialization, experience, phone } = req.body;

  if (!name || !specialization || !experience || !phone) {
    return res.status(400).json({ message: "All doctor fields are required." });
  }

  db.run(
    `INSERT INTO doctors (name, specialization, experience, phone)
     VALUES (?, ?, ?, ?)`,
    [name, specialization, experience, phone],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to add doctor." });
      }
      res.json({ message: "Doctor added successfully." });
    }
  );
});

app.get("/doctors", requireLogin, (req, res) => {
  db.all("SELECT * FROM doctors ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch doctors." });
    }
    res.json(rows);
  });
});

app.put("/doctors/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const { name, specialization, experience, phone } = req.body;

  if (!name || !specialization || !experience || !phone) {
    return res.status(400).json({ message: "All doctor fields are required." });
  }

  db.run(
    `UPDATE doctors
     SET name = ?, specialization = ?, experience = ?, phone = ?
     WHERE id = ?`,
    [name, specialization, experience, phone, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to update doctor." });
      }
      res.json({ message: "Doctor updated successfully." });
    }
  );
});

app.delete("/doctors/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM doctors WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Failed to delete doctor." });
    }
    res.json({ message: "Doctor deleted successfully." });
  });
});

app.post("/appointments", requireLogin, (req, res) => {
  const { patient_name, doctor_name, appointment_date, appointment_time } = req.body;

  if (!patient_name || !doctor_name || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: "All appointment fields are required." });
  }

  db.run(
    `INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time, status)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_name, doctor_name, appointment_date, appointment_time, "Scheduled"],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to book appointment." });
      }
      res.json({ message: "Appointment booked successfully." });
    }
  );
});

app.get("/appointments", requireLogin, (req, res) => {
  db.all("SELECT * FROM appointments ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch appointments." });
    }
    res.json(rows);
  });
});

app.get("/stats", requireLogin, (req, res) => {
  db.get("SELECT COUNT(*) AS count FROM patients", [], (err1, p) => {
    if (err1) return res.status(500).json({ message: "Failed to fetch stats." });

    db.get("SELECT COUNT(*) AS count FROM doctors", [], (err2, d) => {
      if (err2) return res.status(500).json({ message: "Failed to fetch stats." });

      db.get("SELECT COUNT(*) AS count FROM appointments", [], (err3, a) => {
        if (err3) return res.status(500).json({ message: "Failed to fetch stats." });

        db.get("SELECT COUNT(*) AS count FROM users", [], (err4, u) => {
          if (err4) return res.status(500).json({ message: "Failed to fetch stats." });

          res.json({
            totalPatients: p.count,
            totalDoctors: d.count,
            totalAppointments: a.count,
            totalUsers: u.count
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});