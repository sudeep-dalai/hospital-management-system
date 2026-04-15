const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Read data
function readData() {
  const data = fs.readFileSync("data.json");
  return JSON.parse(data);
}

// Write data
function writeData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// Register
app.post("/register", (req, res) => {
  const { fullName, email, password } = req.body;
  let data = readData();

  const exists = data.users.find(u => u.email === email);
  if (exists) return res.send("User already exists");

  data.users.push({ fullName, email, password });
  writeData(data);

  res.send("Registered successfully");
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let data = readData();

  const user = data.users.find(
    u => u.email === email && u.password === password
  );

  if (user) {
    res.redirect("/dashboard.html");
  } else {
    res.send("Invalid login");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});