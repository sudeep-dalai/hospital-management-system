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

let allPatients = [];
let allDoctors = [];

async function checkUser() {
  try {
    const res = await fetch("/me");
    if (!res.ok) {
      window.location.href = "/";
      return;
    }
    const user = await res.json();
    userName.textContent = user.full_name || "Admin";
    userEmail.textContent = user.email || "admin@email.com";
  } catch (error) {
    window.location.href = "/";
  }
}

async function loadStats() {
  try {
    const res = await fetch("/stats");
    if (!res.ok) return;
    const data = await res.json();
    totalPatients.textContent = data.totalPatients ?? 0;
    totalDoctors.textContent = data.totalDoctors ?? 0;
    totalAppointments.textContent = data.totalAppointments ?? 0;
    totalUsers.textContent = data.totalUsers ?? 0;
  } catch (error) {
    console.error(error);
  }
}

function resetPatientForm() {
  patientForm.reset();
  document.getElementById("patientId").value = "";
  document.getElementById("patientFormTitle").textContent = "Add Patient";
  document.getElementById("patientSubmitBtn").textContent = "Add Patient";
  document.getElementById("patientCancelBtn").classList.add("hidden");
}

function resetDoctorForm() {
  doctorForm.reset();
  document.getElementById("doctorId").value = "";
  document.getElementById("doctorFormTitle").textContent = "Add Doctor";
  document.getElementById("doctorSubmitBtn").textContent = "Add Doctor";
  document.getElementById("doctorCancelBtn").classList.add("hidden");
}

if (patientForm) {
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("patientId").value.trim();
    const payload = {
      name: document.getElementById("patientName").value.trim(),
      age: document.getElementById("patientAge").value.trim(),
      gender: document.getElementById("patientGender").value,
      disease: document.getElementById("patientDisease").value.trim(),
      phone: document.getElementById("patientPhone").value.trim(),
      address: document.getElementById("patientAddress").value.trim()
    };

    const url = id ? `/patients/${id}` : "/patients";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      dashboardMessage.textContent = result.message;

      if (res.ok) {
        resetPatientForm();
        await loadPatients();
        await loadStats();
      }
    } catch (error) {
      dashboardMessage.textContent = "Failed to save patient.";
    }
  });
}

if (doctorForm) {
  doctorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("doctorId").value.trim();
    const payload = {
      name: document.getElementById("doctorName").value.trim(),
      specialization: document.getElementById("doctorSpecialization").value.trim(),
      experience: document.getElementById("doctorExperience").value.trim(),
      phone: document.getElementById("doctorPhone").value.trim()
    };

    const url = id ? `/doctors/${id}` : "/doctors";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      dashboardMessage.textContent = result.message;

      if (res.ok) {
        resetDoctorForm();
        await loadDoctors();
        await loadStats();
      }
    } catch (error) {
      dashboardMessage.textContent = "Failed to save doctor.";
    }
  });
}

if (appointmentForm) {
  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      patient_name: document.getElementById("appointmentPatient").value.trim(),
      doctor_name: document.getElementById("appointmentDoctor").value.trim(),
      appointment_date: document.getElementById("appointmentDate").value,
      appointment_time: document.getElementById("appointmentTime").value
    };

    try {
      const res = await fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      dashboardMessage.textContent = result.message;

      if (res.ok) {
        appointmentForm.reset();
        await loadAppointments();
        await loadStats();
      }
    } catch (error) {
      dashboardMessage.textContent = "Failed to book appointment.";
    }
  });
}

function renderPatients(data) {
  if (!data.length) {
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
      <div class="action-row">
        <button type="button" class="edit-btn" onclick="editPatient(${patient.id})">Edit</button>
        <button type="button" class="delete-btn" onclick="deletePatient(${patient.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

async function loadPatients() {
  try {
    const res = await fetch("/patients");
    if (!res.ok) return;
    allPatients = await res.json();
    renderPatients(allPatients);
  } catch (error) {
    console.error(error);
  }
}

function renderDoctors(data) {
  if (!data.length) {
    doctorsList.innerHTML = "<p>No doctors found.</p>";
    return;
  }

  doctorsList.innerHTML = data.map(doctor => `
    <div class="record-card">
      <h4>${doctor.name}</h4>
      <p><strong>Specialization:</strong> ${doctor.specialization}</p>
      <p><strong>Experience:</strong> ${doctor.experience}</p>
      <p><strong>Phone:</strong> ${doctor.phone}</p>
      <div class="action-row">
        <button type="button" class="edit-btn" onclick="editDoctor(${doctor.id})">Edit</button>
        <button type="button" class="delete-btn" onclick="deleteDoctor(${doctor.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

async function loadDoctors() {
  try {
    const res = await fetch("/doctors");
    if (!res.ok) return;
    allDoctors = await res.json();
    renderDoctors(allDoctors);
  } catch (error) {
    console.error(error);
  }
}

async function loadAppointments() {
  try {
    const res = await fetch("/appointments");
    if (!res.ok) return;
    const data = await res.json();

    if (!data.length) {
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
  } catch (error) {
    console.error(error);
  }
}

window.editPatient = function (id) {
  const patient = allPatients.find(item => item.id === id);
  if (!patient) return;

  document.getElementById("patientId").value = patient.id;
  document.getElementById("patientName").value = patient.name;
  document.getElementById("patientAge").value = patient.age;
  document.getElementById("patientGender").value = patient.gender;
  document.getElementById("patientDisease").value = patient.disease;
  document.getElementById("patientPhone").value = patient.phone;
  document.getElementById("patientAddress").value = patient.address;

  document.getElementById("patientFormTitle").textContent = "Edit Patient";
  document.getElementById("patientSubmitBtn").textContent = "Update Patient";
  document.getElementById("patientCancelBtn").classList.remove("hidden");

  document.getElementById("patientsSection").scrollIntoView({ behavior: "smooth" });
};

window.deletePatient = async function (id) {
  const ok = confirm("Delete this patient?");
  if (!ok) return;

  try {
    const res = await fetch(`/patients/${id}`, { method: "DELETE" });
    const result = await res.json();
    dashboardMessage.textContent = result.message;

    if (res.ok) {
      await loadPatients();
      await loadStats();
      resetPatientForm();
    }
  } catch (error) {
    dashboardMessage.textContent = "Failed to delete patient.";
  }
};

window.editDoctor = function (id) {
  const doctor = allDoctors.find(item => item.id === id);
  if (!doctor) return;

  document.getElementById("doctorId").value = doctor.id;
  document.getElementById("doctorName").value = doctor.name;
  document.getElementById("doctorSpecialization").value = doctor.specialization;
  document.getElementById("doctorExperience").value = doctor.experience;
  document.getElementById("doctorPhone").value = doctor.phone;

  document.getElementById("doctorFormTitle").textContent = "Edit Doctor";
  document.getElementById("doctorSubmitBtn").textContent = "Update Doctor";
  document.getElementById("doctorCancelBtn").classList.remove("hidden");

  document.getElementById("doctorsSection").scrollIntoView({ behavior: "smooth" });
};

window.deleteDoctor = async function (id) {
  const ok = confirm("Delete this doctor?");
  if (!ok) return;

  try {
    const res = await fetch(`/doctors/${id}`, { method: "DELETE" });
    const result = await res.json();
    dashboardMessage.textContent = result.message;

    if (res.ok) {
      await loadDoctors();
      await loadStats();
      resetDoctorForm();
    }
  } catch (error) {
    dashboardMessage.textContent = "Failed to delete doctor.";
  }
};

document.getElementById("patientCancelBtn").addEventListener("click", resetPatientForm);
document.getElementById("doctorCancelBtn").addEventListener("click", resetDoctorForm);

document.getElementById("patientSearch").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  const filtered = allPatients.filter(item =>
    item.name.toLowerCase().includes(value) ||
    item.disease.toLowerCase().includes(value) ||
    item.phone.toLowerCase().includes(value)
  );
  renderPatients(filtered);
});

document.getElementById("doctorSearch").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  const filtered = allDoctors.filter(item =>
    item.name.toLowerCase().includes(value) ||
    item.specialization.toLowerCase().includes(value) ||
    item.phone.toLowerCase().includes(value)
  );
  renderDoctors(filtered);
});

function setupMenu() {
  const menuButtons = document.querySelectorAll(".menu-btn");
  const sections = document.querySelectorAll(".content-section");

  menuButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-section");

      menuButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      sections.forEach((section) => {
        section.classList.remove("active-section");
      });

      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active-section");
      }
    });
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/";
  });
}

async function initDashboard() {
  await checkUser();
  setupMenu();
  setupLogout();
  await loadStats();
  await loadPatients();
  await loadDoctors();
  await loadAppointments();
}

document.addEventListener("DOMContentLoaded", initDashboard);