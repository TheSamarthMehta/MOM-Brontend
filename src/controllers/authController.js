import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'user', mobileNo } = req.body;

    // Check if user already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Create new user in database
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role,
      mobileNo
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      success: true,
      message: "User registered successfully", 
      data: {
        token, 
        user: {
          _id: user._id,
          firstName: firstName,
          lastName: lastName,
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: "Error registering user", 
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate that all required fields are provided
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Email, password, and role are required" 
      });
    }

    // Find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Email not found" 
      });
    }

    // Check if the account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account is deactivated" 
      });
    }

    // Verify password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Password is incorrect" 
      });
    }

    // Verify that role matches
    if (user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: "Role is incorrect for this account" 
      });
    }

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate JWT token for session
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: "1d" }
    );

    // Split name into first and last name for response
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({ 
      success: true,
      message: "Login successful", 
      data: {
        token, 
        user: {
          _id: user._id,
          firstName: firstName,
          lastName: lastName,
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email already in use" 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true,
      message: "Profile updated successfully", 
      data: user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: "Error updating profile", 
      error: error.message 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: "Error changing password", 
      error: error.message 
    });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    res.json({ 
      success: true,
      message: "Token is valid",
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
