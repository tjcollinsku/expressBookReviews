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

// Get the book list available in the shop - Task 10: async/await with Promise
public_users.get('/', async function (req, res) {
  try {
    const bookList = await new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject(new Error("No books found"));
      }
    });
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN - Task 10: async/await with Promise
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      const foundBook = books[isbn];
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject(new Error("Book not found"));
      }
    });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book details based on author - Task 10: async/await with Promise
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const filtered = {};
      Object.keys(books).forEach(key => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          filtered[key] = books[key];
        }
      });
      if (Object.keys(filtered).length > 0) {
        resolve(filtered);
      } else {
        reject(new Error("No books found for this author"));
      }
    });
    return res.status(200).json({ booksByAuthor });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title - Task 10: async/await with Promise
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const filtered = {};
      Object.keys(books).forEach(key => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          filtered[key] = books[key];
        }
      });
      if (Object.keys(filtered).length > 0) {
        resolve(filtered);
      } else {
        reject(new Error("No books found with this title"));
      }
    });
    return res.status(200).json({ booksByTitle });
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
