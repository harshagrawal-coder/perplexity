import usermodel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../services/mail.services.js";

function getCookieMaxAge(expiresIn = "7d") {
  const match = String(expiresIn).match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMap = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitMap[unit];
}

export async function register(req, res) {
  try {
    const { email, password, username } = req.body;

    const existingUser = await usermodel.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: username?.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email or username already exists",
        success: false,
      });
    }

    const user = await usermodel.create({
      username,
      password,
      email,
    });

    const token = user.generateAuthToken();

    try {
      const mailInfo = await sendMail({
        to: user.email,

        subject: "Welcome to Perplexity Clone",

        text: `Hello ${user.username}, your account has been created successfully. Please verify your email.`,

        html: `
    <h2>Hello ${user.username}</h2>

    <p>Your account has been created successfully.</p>

    <p>Please verify your email:</p>

    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}">
      Verify Email
    </a>
  `,
      });

      console.log({
        from: process.env.GOOGLE_USER,
        to: user.email,
        subject: "Welcome to Perplexity Clone",
        sentAt: new Date().toISOString(),
        response: mailInfo.response,
        messageId: mailInfo.messageId,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error.message);
    }

    // Auto-verify in development so users can log in immediately
    if (process.env.NODE_ENV !== "production") {
      user.verified = true;
      await user.save();
    }

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email or username already exists",
        success: false,
      });
    }

    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
        success: false,
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
      });
    }
    const user = await usermodel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.verified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    user.verified = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Email verification error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
} 

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const user = await usermodel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email before logging in.",
        success: false,
      });
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getCookieMaxAge(process.env.JWT_EXPIRES_IN),
    });
    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

export async function getUser(req, res) {
  const userid = req.user.id;
  
  try {
    const user = await usermodel.findById(userid);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

export async function logout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logout successful",
    success: true,
  });
}
