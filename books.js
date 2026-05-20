const express = require("express");
const Book = require("../models/Book");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

//  GET /api/books 
// Public: anyone can browse books. Supports ?search=, ?genre=, ?sort=
router.get("/", async (req, res) => {
  try {
    const { search, genre, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { doctor: { $regex: search, $options: "i" } },
      ];
    }
    if (genre && genre !== "الكل") {
      query.genre = genre;
    }

    // Build sort object
    const sortMap = {
      "year-desc": { year: -1 },
      "year-asc": { year: 1 },
      "title-asc": { title: 1 },
      "pages-desc": { pages: -1 },
      "pages-asc": { pages: 1 },
    };
    const sortOption = sortMap[sort] || { year: -1 };

    const books = await Book.find(query)
      .sort(sortOption)
      .populate("createdBy", "fullName email"); // join user info

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الكتب" });
  }
});

//  GET /api/books/my 
// Private: only the logged-in user's books
router.get("/my", requireAuth, async (req, res) => {
  try {
    const books = await Book.find({ createdBy: req.session.userId });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//  POST /api/books 
// Private: create a new book (postLogger middleware will log this)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, doctor, genre, year, pages } = req.body;

    const book = await Book.create({
      title,
      doctor,
      genre,
      year,
      pages,
      createdBy: req.session.userId, //  link to logged-in user
    });

    res.status(201).json({ message: "تمت إضافة الكتاب بنجاح", book });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//  PUT /api/books/:id 
//  Requirement 4: Only update if createdBy matches session user
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, doctor, genre, year, pages } = req.body;

    const book = await Book.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.session.userId, //  authorization check in query
      },
      { title, doctor, genre, year, pages },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(403).json({
        message: "الكتاب غير موجود أو ليس لديك صلاحية تعديله",
      });
    }

    res.json({ message: "تم تحديث الكتاب بنجاح", book });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//  DELETE /api/books/:id 
//  Requirement 4: Only delete if createdBy matches session user
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.userId, //  authorization check in query
    });

    if (!book) {
      return res.status(403).json({
        message: "الكتاب غير موجود أو ليس لديك صلاحية حذفه",
      });
    }

    res.json({ message: "تم حذف الكتاب بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

module.exports = router;
