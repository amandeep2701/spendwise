const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  amount: { type: Number, required: true, min: 0.01 },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Travel", "Books", "Entertainment", "Bills", "Other"]
  },
  date: { type: Date, required: true },
  note: { type: String, default: "", maxlength: 240 }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
