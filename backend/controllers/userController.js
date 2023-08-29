const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../db');

//REGISTER, POST, api/users
const createUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const usernameCheckQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(usernameCheckQuery, [username], (error, results) => {
      if (error) {
        console.error('Error checking username:', error);
        return res.status(500).json({ message: 'Failed to register user' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(emailCheckQuery, [email], (emailCheckError, emailCheckResults) => {
        if (emailCheckError) {
          console.error('Error checking email:', emailCheckError);
          return res.status(500).json({ message: 'Failed to register user' });
        }

        if (emailCheckResults.length > 0) {
          return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash the password
        bcrypt.hash(password, 10)
          .then(hashedPassword => {
            const insertQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, hashedPassword, email], (insertError, insertResult) => {
              if (insertError) {
                console.error('Error registering user:', insertError);
                return res.status(500).json({ message: 'Failed to register user' });
              }

              return res.status(201).json({ message: 'User registered successfully' });
            });
          });
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};


//LOGIN, POST, api/users/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (error, results) => {
      if (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Failed to log in' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Username does not exist' });
      }

      // Verify the password
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWTSECRET, { expiresIn: '1h' });

      return res.status(200).json({ token, username: user.username });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
};

  //GET, api/users
  const getUserInfo = (req, res) => {
    const { username, email, id } = req;
   
    res.json({ username, id, email });
  };

module.exports = { createUser, loginUser, getUserInfo}