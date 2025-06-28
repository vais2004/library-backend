const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const { initializeDatabase } = require("./db/db.connect");

const User = require("./models/models.user");
const Borrow = require("./models/models.borrow");
const Book = require("./models/models.book");

app.use(express.json());

initializeDatabase();

// Add User
app.post("/api/users/create", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Add Book (Admin)
app.post("/api/books/add", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.json({ message: "Book added", book });
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Search/Filter Books
app.get("/api/books", async (req, res) => {
  try {
    const { author, category } = req.query;
    const filter = {};
    if (author) filter.author = author;
    if (category) filter.category = category;

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Borrow Book
app.post("/api/books/borrow/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const { userId } = req.body;

    if (!book || !book.available) {
      return res.status(400).json({ error: "Book not available" });
    }

    book.available = false;
    await book.save();

    const borrow = new Borrow({
      userId,
      bookId: book._id,
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days later
    });

    await borrow.save();
    res.json({ message: "Book borrowed", borrow });
  } catch (err) {
    res.status(500).json({ error: "Failed to borrow book" });
  }
});

// Return Book
app.post("/api/books/return/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ error: "Book not found" });

    book.available = true;
    await book.save();

    await Borrow.findOneAndUpdate(
      { userId, bookId: book._id },
      { returnDate: new Date() }
    );

    res.json({ message: "Book returned" });
  } catch (err) {
    res.status(500).json({ error: "Failed to return book" });
  }
});

// Borrow History
app.get("/api/users/:id/history", async (req, res) => {
  try {
    const history = await Borrow.find({ userId: req.params.id })
      .populate("bookId", "title author")
      .sort({ borrowDate: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
