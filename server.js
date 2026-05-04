const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Path to users JSON file
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }));
}

// In-memory session store
const sessions = {};

// Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE)).users;

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  users.push({ username, password, games: [], stats: {} });
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }));
  res.json({ message: "User registered" });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE)).users;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const sessionToken = uuidv4();
  sessions[sessionToken] = username;
  res.json({ sessionToken, username });
});

// Logout
app.post('/logout', (req, res) => {
  const { sessionToken } = req.body;
  delete sessions[sessionToken];
  res.json({ message: "Logged out" });
});

// Middleware to check auth
const requireAuth = (req, res, next) => {
  const sessionToken = req.headers.authorization;
  if (!sessionToken || !sessions[sessionToken]) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = sessions[sessionToken];
  next();
};

// Example protected route
app.get('/profile', requireAuth, (req, res) => {
  res.json({ username: req.user });
});

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));