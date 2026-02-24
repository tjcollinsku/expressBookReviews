const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists! Please try another username." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// ===== Internal data endpoints (used by Axios calls below) =====

public_users.get('/api/books', (req, res) => {
  return res.status(200).json(books);
});

public_users.get('/api/books/author/:author', (req, res) => {
  const filtered = {};
  Object.keys(books).forEach(key => {
    if (books[key].author.toLowerCase() === req.params.author.toLowerCase()) {
      filtered[key] = books[key];
    }
  });
  return Object.keys(filtered).length > 0
    ? res.status(200).json(filtered)
    : res.status(404).json({ message: "No books found for this author" });
});

public_users.get('/api/books/title/:title', (req, res) => {
  const filtered = {};
  Object.keys(books).forEach(key => {
    if (books[key].title.toLowerCase() === req.params.title.toLowerCase()) {
      filtered[key] = books[key];
    }
  });
  return Object.keys(filtered).length > 0
    ? res.status(200).json(filtered)
    : res.status(404).json({ message: "No books found with this title" });
});

public_users.get('/api/books/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ message: "Book not found" });
});

// ===== Public routes using async/await with Axios (Task 10) =====

// Task 10.1: Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 10.2: Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5000/api/books/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 10.3: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5000/api/books/author/${req.params.author}`);
    return res.status(200).json({ booksByAuthor: response.data });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 10.4: Get book details based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5000/api/books/title/${req.params.title}`);
    return res.status(200).json({ booksByTitle: response.data });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
