const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const dashboardMessage = document.getElementById("dashboardMessage");

const patientForm = document.getElementById("patientForm");
const doctorForm = document.getElementById("doctorForm");
const appointmentForm = document.getElementById("appointmentForm");

const patientsList = document.getElementById("patientsList");
const doctorsList = document.getElementById("doctorsList");
const appointmentsList = document.getElementById("appointmentsList");

const totalPatients = document.getElementById("totalPatients");
const totalDoctors = document.getElementById("totalDoctors");
const totalAppointments = document.getElementById("totalAppointments");
const totalUsers = document.getElementById("totalUsers");

function checkUser() {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    window.location.href = "/";
    return null;
  }
  return JSON.parse(user);
}

async function loadStats() {
  const res = await fetch("/stats");
  const data = await res.json();

  totalPatients.textContent = data.totalPatients;
  totalDoctors.textContent = data.totalDoctors;
  totalAppointments.textContent = data.totalAppointments;
  totalUsers.textContent = data.totalUsers;
}

async function loadPatients() {
  const res = await fetch("/patients");
  const data = await res.json();

  if (data.length === 0) {
    patientsList.innerHTML = "<p>No patients found.</p>";
    return;
  }

  patientsList.innerHTML = data.map(patient => `
    <div class="record-card">
      <h4>${patient.name}</h4>
      <p><strong>Age:</strong> ${patient.age}</p>
      <p><strong>Gender:</strong> ${patient.gender}</p>
      <p><strong>Disease:</strong> ${patient.disease}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
      <p><strong>Address:</strong> ${patient.address}</p>
    </div>
  `).join("");
}

async function loadDoctors() {
  const res = await fetch("/doctors");
  const data = await res.json();

  if (data.length === 0) {
    doctorsList.innerHTML = "<p>No doctors found.</p>";
    return;
  }

  doctorsList.innerHTML = data.map(doctor => `
    <div class="record-card">
      <h4>${doctor.name}</h4>
      <p><strong>Specialization:</strong> ${doctor.specialization}</p>
      <p><strong>Experience:</strong> ${doctor.experience}</p>
      <p><strong>Phone:</strong> ${doctor.phone}</p>
    </div>
  `).join("");
}

async function loadAppointments() {
  const res = await fetch("/appointments");
  const data = await res.json();

  if (data.length === 0) {
    appointmentsList.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  appointmentsList.innerHTML = data.map(app => `
    <div class="record-card">
      <h4>${app.patient_name} → ${app.doctor_name}</h4>
      <p><strong>Date:</strong> ${app.appointment_date}</p>
      <p><strong>Time:</strong> ${app.appointment_time}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    </div>
  `).join("");
}

patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("patientName").value.trim(),
    age: document.getElementById("patientAge").value.trim(),
    gender: document.getElementById("patientGender").value,
    disease: document.getElementById("patientDisease").value.trim(),
    phone: document.getElementById("patientPhone").value.trim(),
    address: document.getElementById("patientAddress").value.trim()
  };

  const res = await fetch("/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  dashboardMessage.textContent = result.message;
  patientForm.reset();
  loadPatients();
  loadStats();
});

doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("doctorName").value.trim(),
    specialization: document.getElementById("doctorSpecialization").value.trim(),
    experience: document.getElementById("doctorExperience").value.trim(),
    phone: document.getElementById("doctorPhone").value.trim()
  };

  const res = await fetch("/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  dashboardMessage.textContent = result.message;
  doctorForm.reset();
  loadDoctors();
  loadStats();
});

appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    patient_name: document.getElementById("appointmentPatient").value.trim(),
    doctor_name: document.getElementById("appointmentDoctor").value.trim(),
    appointment_date: document.getElementById("appointmentDate").value,
    appointment_time: document.getElementById("appointmentTime").value
  };

  const res = await fetch("/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  dashboardMessage.textContent = result.message;
  appointmentForm.reset();
  loadAppointments();
  loadStats();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/";
});

document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active-section");
    });

    document.getElementById(btn.dataset.section).classList.add("active-section");
  });
});

function initDashboard() {
  const user = checkUser();
  if (!user) return;

  userName.textContent = user.fullName;
  userEmail.textContent = user.email;

  loadStats();
  loadPatients();
  loadDoctors();
  loadAppointments();
}

initDashboard();