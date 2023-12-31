const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'netflix'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).send('Error hashing password');
      return;
    }
    const insertQuery = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    connection.query(insertQuery, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error signing up');
        return;
      }
      console.log('User registered:', result);
      res.redirect('http://127.0.0.1:5500/netflix-clone/index.html');
    });
  });
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const selectQuery = 'SELECT * FROM Users WHERE email = ?';
  connection.query(selectQuery, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Error logging in');
      return;
    }
    if (results.length === 0) {
      res.status(401).send('Invalid credentials');
      return;
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, passwordMatch) => {
      if (err || !passwordMatch) {
        console.error('Invalid password');
        res.status(401).send('Invalid credentials');
        return;
      }
      res.redirect('http://127.0.0.1:5500/netflix-clone/index.html');
    });
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
