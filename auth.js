const express = require("express");
const User = require("../models/User");
const router = express.Router();

//  POST /api/auth/register 
//  Requirement 3: Secure registration with password hashing (done in model)
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "كلمتا المرور غير متطابقتين" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    const user = await User.create({ fullName, email, password });

    // Auto-login after registration
    req.session.userId = user._id;
    req.session.userFullName = user.fullName;

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//  POST /api/auth/login 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "البريد وكلمة المرور مطلوبان" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة" });
    }

    //  Requirement 3: Session-based login
    req.session.userId = user._id;
    req.session.userFullName = user.fullName;

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//  POST /api/auth/logout 
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    res.clearCookie("connect.sid");
    res.json({ message: "تم تسجيل الخروج" });
  });
});

//  GET /api/auth/me 
// Frontend checks this on load to restore session
router.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json({ user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

module.exports = router;
