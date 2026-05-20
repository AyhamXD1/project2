const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الكتاب مطلوب"],
      trim: true,
    },
    doctor: {
      type: String,
      required: [true, "اسم الدكتور مطلوب"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "التصنيف مطلوب"],
      enum: [
        "هندسة البرمجيات",
        "تكنولوجيا المعلومات",
        "علم الحاسوب",
        "انظمة المعلومات الحاسوبية",
        "علم البيانات والذكاء الاصطناعي",
        "رياضيات",
      ],
    },
    year: {
      type: Number,
      required: [true, "السنة مطلوبة"],
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    pages: {
      type: Number,
      required: [true, "عدد الصفحات مطلوب"],
      min: 1,
    },
    //  Requirement 2: Field reference linking book to the User who created it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
