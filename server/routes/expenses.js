const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const router = express.Router();
const categories = ["Food", "Travel", "Books", "Entertainment", "Bills", "Other"];

function monthRange(month) {
  if (!month) return null;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    const error = new Error("Month must use YYYY-MM format.");
    error.status = 400;
    throw error;
  }
  const [year, m] = month.split("-").map(Number);
  return { $gte: new Date(Date.UTC(year, m - 1, 1)), $lt: new Date(Date.UTC(year, m, 1)) };
}

function validatePayload(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount = Number(body.amount);
  const category = body.category;
  const date = new Date(body.date);
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!title) return "Expense title is required.";
  if (!Number.isFinite(amount) || amount <= 0) return "Amount must be a number greater than zero.";
  if (!categories.includes(category)) return "Choose a valid expense category.";
  if (!body.date || Number.isNaN(date.getTime())) return "A valid expense date is required.";
  if (title.length > 80 || note.length > 240) return "Title or note is too long.";
  return null;
}

function cleanPayload(body) {
  return {
    title: body.title.trim(),
    amount: Number(body.amount),
    category: body.category,
    date: new Date(`${body.date.slice(0, 10)}T00:00:00.000Z`),
    note: typeof body.note === "string" ? body.note.trim() : ""
  };
}

router.get("/", async (req, res, next) => {
  try {
    const range = monthRange(req.query.month);
    const filter = range ? { date: range } : {};
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json(expenses);
  } catch (error) { next(error); }
});

router.get("/summary", async (req, res, next) => {
  try {
    const range = monthRange(req.query.month);
    const match = range ? { date: range } : {};
    const grouped = await Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const total = grouped.reduce((sum, item) => sum + item.total, 0);
    res.json({
      total,
      transactionCount: grouped.reduce((sum, item) => sum + item.count, 0),
      categories: grouped.map((item) => ({ category: item._id, total: item.total, count: item.count }))
    });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const issue = validatePayload(req.body);
    if (issue) return res.status(400).json({ message: issue });
    const expense = await Expense.create(cleanPayload(req.body));
    res.status(201).json(expense);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid expense ID." });
    const issue = validatePayload(req.body);
    if (issue) return res.status(400).json({ message: issue });
    const updated = await Expense.findByIdAndUpdate(req.params.id, cleanPayload(req.body), {
      new: true, runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Expense not found." });
    res.json(updated);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid expense ID." });
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;
