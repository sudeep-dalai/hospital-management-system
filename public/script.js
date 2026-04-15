const patientForm = document.getElementById("patientForm");
const doctorForm = document.getElementById("doctorForm");
const appointmentForm = document.getElementById("appointmentForm");
const output = document.getElementById("output");

// Add patient
patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("patientName").value,
    age: document.getElementById("patientAge").value,
    gender: document.getElementById("patientGender").value,
    disease: document.getElementById("patientDisease").value,
    phone: document.getElementById("patientPhone").value
  };

  const res = await fetch("/add-patient", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
  patientForm.reset();
});

// Add doctor
doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("doctorName").value,
    specialization: document.getElementById("doctorSpecialization").value,
    phone: document.getElementById("doctorPhone").value
  };

  const res = await fetch("/add-doctor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
  doctorForm.reset();
});

// Add appointment
appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    patient_name: document.getElementById("appointmentPatient").value,
    doctor_name: document.getElementById("appointmentDoctor").value,
    appointment_date: document.getElementById("appointmentDate").value,
    appointment_time: document.getElementById("appointmentTime").value
  };

  const res = await fetch("/add-appointment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
  appointmentForm.reset();
});

// Load patients
async function loadPatients() {
  const res = await fetch("/patients");
  const data = await res.json();

  if (data.length === 0) {
    output.innerHTML = "<p>No patients found.</p>";
    return;
  }

  output.innerHTML = data.map(patient => `
    <div class="record-item">
      <strong>ID:</strong> ${patient.id}<br>
      <strong>Name:</strong> ${patient.name}<br>
      <strong>Age:</strong> ${patient.age}<br>
      <strong>Gender:</strong> ${patient.gender}<br>
      <strong>Disease:</strong> ${patient.disease}<br>
      <strong>Phone:</strong> ${patient.phone}
    </div>
  `).join("");
}

// Load doctors
async function loadDoctors() {
  const res = await fetch("/doctors");
  const data = await res.json();

  if (data.length === 0) {
    output.innerHTML = "<p>No doctors found.</p>";
    return;
  }

  output.innerHTML = data.map(doctor => `
    <div class="record-item">
      <strong>ID:</strong> ${doctor.id}<br>
      <strong>Name:</strong> ${doctor.name}<br>
      <strong>Specialization:</strong> ${doctor.specialization}<br>
      <strong>Phone:</strong> ${doctor.phone}
    </div>
  `).join("");
}

// Load appointments
async function loadAppointments() {
  const res = await fetch("/appointments");
  const data = await res.json();

  if (data.length === 0) {
    output.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  output.innerHTML = data.map(app => `
    <div class="record-item">
      <strong>ID:</strong> ${app.id}<br>
      <strong>Patient Name:</strong> ${app.patient_name}<br>
      <strong>Doctor Name:</strong> ${app.doctor_name}<br>
      <strong>Date:</strong> ${app.appointment_date}<br>
      <strong>Time:</strong> ${app.appointment_time}
    </div>
  `).join("");
}