const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../model");
const { use } = require("../routes/todoRoutes");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );
    return res.status(200).json({ token, user: user._id, user_name: user.email.split('@')[0]  });
  } catch (err) {
    console.log("errrr", err);
    return res.status(500).json({ message: "Error logging in", error: err });
  }
};
