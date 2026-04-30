const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the Tic Tac Toe AI server!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
