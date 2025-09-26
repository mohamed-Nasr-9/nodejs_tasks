const express = require("express");
const accountRouter = express.Router();
const fileOps = require("fs/promises");
const sysPath = require("path");
const { query } = require("../helpers/DB");
const hashLib = require("bcrypt");
const jwtTool = require("jsonwebtoken");
const Joi = require("joi");


const signupValidator = Joi.object({
  fullname: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  pass: Joi.string().min(8).required(),
  age: Joi.number().integer().min(13).max(120).required(),
});

const signinValidator = Joi.object({
  email: Joi.string().email().required(),
  pass: Joi.string().required(),
});

// User registration
accountRouter.post("/auth/signup", async (req, res) => {
  try {
    const { error } = signupValidator.validate(req.body);
    if (error) return res.status(400).json({ issue: error.details[0].message });

    const { fullname, email, pass, age } = req.body;

    const existingUser = await query("SELECT * FROM users WHERE email=?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ issue: "Email already taken" });
    }

    const passwordDigest = await hashLib.hash(pass, 12);

    const result = await query(
      "INSERT INTO users (name, email, password_hash, age) VALUES (?, ?, ?, ?)",
      [fullname, email, passwordDigest, age]
    );

    res.status(201).json({
      userId: result.insertId,
      fullname,
      email,
      age,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ issue: "Internal failure" });
  }
});


accountRouter.post("/auth/signin", async (req, res) => {
  try {
    const { error } = signinValidator.validate(req.body);
    if (error) return res.status(400).json({ issue: error.details[0].message });

    const { email, pass } = req.body;
    const foundUsers = await query("SELECT * FROM users WHERE email=?", [email]);

    if (foundUsers.length === 0) {
      return res.status(401).json({ issue: "Invalid credentials" });
    }

    const account = foundUsers[0];
    const validPass = await hashLib.compare(pass, account.password_hash);
    if (!validPass) return res.status(401).json({ issue: "Invalid credentials" });

    const authToken = jwtTool.sign({ uid: account.id, email: account.email }, "superSecretKey2025", { expiresIn: "2h" });

    res.json({ authToken });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ issue: "Internal failure" });
  }
});


accountRouter.get("/account/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ issue: "No token provided" });

    const rawToken = authHeader.split(" ")[1];
    if (!rawToken) return res.status(401).json({ issue: "No token provided" });

    let decoded;
    try {
      decoded = jwtTool.verify(rawToken, "superSecretKey2025");
    } catch (err) {
      return res.status(401).json({ issue: "Token invalid" });
    }

    const profileData = await query("SELECT id, name, email, age, created_at FROM users WHERE id=?", [decoded.uid]);
    if (profileData.length === 0) return res.status(404).json({ issue: "User not found" });

    res.json(profileData[0]);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ issue: "Internal failure" });
  }
});

module.exports = accountRouter;