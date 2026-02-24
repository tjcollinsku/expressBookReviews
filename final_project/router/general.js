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

// Internal data endpoint used by Axios calls below
public_users.get('/api/books', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop - Task 10: async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN - Task 10: async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    const book = response.data[isbn];
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on author - Task 10: async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    const allBooks = response.data;
    const filtered = {};
    Object.keys(allBooks).forEach(key => {
      if (allBooks[key].author.toLowerCase() === author.toLowerCase()) {
        filtered[key] = allBooks[key];
      }
    });
    if (Object.keys(filtered).length > 0) {
      return res.status(200).json({ booksByAuthor: filtered });
    }
    return res.status(404).json({ message: "No books found for this author" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get all books based on title - Task 10: async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    const allBooks = response.data;
    const filtered = {};
    Object.keys(allBooks).forEach(key => {
      if (allBooks[key].title.toLowerCase() === title.toLowerCase()) {
        filtered[key] = allBooks[key];
      }
    });
    if (Object.keys(filtered).length > 0) {
      return res.status(200).json({ booksByTitle: filtered });
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
