import User from "../models/User";
import Verification from "../models/Verification";
import RecoverPassword from "../models/RecoverPassword";
import ChangePassword from "../models/ChangePassword";
import Announcement from "../models/Announcement";
import {
  sendRecoverPasswordEmail,
  sendVerificationEmail,
} from "../handlers/email";
import jwt from "jsonwebtoken";
import validator from "validator";
import { isAdmin } from "../utils/utils";
import fs from "fs";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isUsernameValid = validator.isLength(username, { min: 4, max: 16 });
  const isEmailValid = validator.isEmail(email);
  const isPasswordValid = validator.isLength(password, { min: 6, max: 50 });
  if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const isUsernameRepeated = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    });
    const isEmailRepeated = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
      verificated: true,
    });
    if (isUsernameRepeated && isEmailRepeated) {
      res.json({
        error: true,
        message: "Repeated information",
      });
      return;
    }
    if (isUsernameRepeated) {
      res.json({
        error: true,
        message: "Repeated username",
      });
      return;
    }
    if (isEmailRepeated) {
      res.json({
        error: true,
        message: "Repeated email",
      });
      return;
    }
    const nonVerificatedUser = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    if (nonVerificatedUser) {
      await User.deleteOne(nonVerificatedUser);
    }
    await new User({
      username: username,
      email: email,
      password: password,
    }).save();
    const isVerificationCodeActive = await Verification.findOne({
      email: email,
    });
    if (isVerificationCodeActive) {
      await Verification.deleteOne({ email: email });
    }
    await sendVerificationEmail(email, username);
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const userByUsername = await User.findOne({ username: usernameOrEmail });
    const userByEmail = await User.findOne({ email: usernameOrEmail });
    if (!userByUsername && !userByEmail) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    const user = userByUsername ? userByUsername : userByEmail;
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      res.json({
        error: true,
        message: "Invalid password",
      });
      return;
    }
    const isUserVerificating = !user.verificated;
    if (isUserVerificating) {
      const email = user.email;
      const isVerificationCodeActive = await Verification.findOne({
        email: email,
      });
      if (isVerificationCodeActive) {
        await Verification.deleteOne({ email: email });
      }
      await sendVerificationEmail(user.email, user.username);
      res.json({
        error: true,
        message: "User is verificating",
        email: email,
      });
      return;
    }
    let avatarFile;
    const avatarFileExists = fs.existsSync(`media/users/avatars/${user.uuid}`);
    if (avatarFileExists) {
      avatarFile = await fs.promises.readFile(
        `media/users/avatars/${user.uuid}`
      );
    } else {
      avatarFile = await fs.promises.readFile("media/utils/transparent");
    }
    const newAnnouncements = await Announcement.count({
      views: { $ne: user.uuid },
    });
    const formattedUser = {
      uuid: user.uuid,
      avatar: avatarFile,
      username: user.username,
      email: user.email,
      passwordLength: user.passwordLength,
      plan: user.plan,
      isAdmin: isAdmin(user),
      newAnnouncements: newAnnouncements,
    };
    const payload = {
      uuid: user.uuid,
      password: user.password,
    };
    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      {
        expiresIn: 31556926,
      },
      (_, authToken) => {
        res.json({
          success: true,
          authToken: `Bearer ${authToken}`,
          user: formattedUser,
        });
      }
    );
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const verificate = async (req, res) => {
  const { mode, email, code } = req.body;
  if (!mode || !email || !code) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isModeValid = mode === "REGISTER" || mode === "RECOVER_PASSWORD";
  if (!isModeValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    if (mode === "REGISTER") {
      const isUserVerificating = !user.verificated;
      if (!isUserVerificating) {
        res.json({
          error: true,
          message: "User already verificated",
        });
        return;
      }
      const verification = await Verification.findOne({ email: email });
      if (!verification) {
        res.json({
          error: true,
          message: "Verification not found",
        });
        return;
      }
      const isVerificationCodeValid = await verification.isCodeValid(code);
      if (!isVerificationCodeValid) {
        res.json({
          error: true,
          message: "Invalid code",
        });
        return;
      }
      await Verification.deleteOne({ email: email });
      await User.updateOne({ email: email }, { verificated: true });
      user = await User.findOne({ uuid: user.uuid });
      let avatarFile;
      const avatarFileExists = fs.existsSync(
        `media/users/avatars/${user.uuid}`
      );
      if (avatarFileExists) {
        avatarFile = await fs.promises.readFile(
          `media/users/avatars/${user.uuid}`
        );
      } else {
        avatarFile = await fs.promises.readFile("media/utils/transparent");
      }
      const newAnnouncements = await Announcement.count({
        views: { $ne: user.uuid },
      });
      const formattedUser = {
        uuid: user.uuid,
        avatar: avatarFile,
        username: user.username,
        email: user.email,
        passwordLength: user.passwordLength,
        plan: user.plan,
        isAdmin: isAdmin(user),
        newAnnouncements: newAnnouncements,
      };
      const payload = {
        uuid: user.uuid,
        password: user.password,
      };
      jwt.sign(
        payload,
        process.env.SECRET_KEY,
        {
          expiresIn: 31556926,
        },
        (_, authToken) => {
          res.json({
            success: true,
            authToken: `Bearer ${authToken}`,
            user: formattedUser,
          });
        }
      );
    }
    if (mode === "RECOVER_PASSWORD") {
      const verification = await RecoverPassword.findOne({ email: email });
      if (!verification) {
        res.json({
          error: true,
          message: "Verification not found",
        });
        return;
      }
      const isVerificationCodeValid = await verification.isCodeValid(code);
      if (!isVerificationCodeValid) {
        res.json({
          error: true,
          message: "Invalid code",
        });
        return;
      }
      await RecoverPassword.deleteOne({ email: email });
      await new ChangePassword({ email: email, code: code }).save();
      res.json({
        success: true,
      });
    }
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const recoverPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    const isUserChangingPassword = await ChangePassword.findOne({
      email: email,
    });
    if (isUserChangingPassword) {
      await ChangePassword.deleteOne({ email: email });
    }
    const isUserRecoveringPassword = await RecoverPassword.findOne({
      email: email,
    });
    if (isUserRecoveringPassword) {
      await RecoverPassword.deleteOne({ email: email });
    }
    await sendRecoverPasswordEmail(email, user.username);
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const changePassword = async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isPasswordValid = validator.isLength(password, { min: 6, max: 50 });
  if (!isPasswordValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    const isUserChangingPassword = await ChangePassword.findOne({
      email: email,
    });
    if (!isUserChangingPassword) {
      res.json({
        error: true,
        message: "User not changing password",
      });
      return;
    }
    const verification = await ChangePassword.findOne({ email: email });
    if (!verification) {
      res.json({
        error: true,
        message: "Verification not found",
      });
      return;
    }
    const isVerificationCodeValid = await verification.isCodeValid(code);
    if (!isVerificationCodeValid) {
      res.json({
        error: true,
        message: "Invalid code",
      });
      return;
    }
    await ChangePassword.deleteOne({ email: email });
    await User.updateOne({ email: email }, { password: password });
    user = await User.findOne({ uuid: user.uuid });
    let avatarFile;
    const avatarFileExists = fs.existsSync(`media/users/avatars/${user.uuid}`);
    if (avatarFileExists) {
      avatarFile = await fs.promises.readFile(
        `media/users/avatars/${user.uuid}`
      );
    } else {
      avatarFile = await fs.promises.readFile("media/utils/transparent");
    }
    const newAnnouncements = await Announcement.count({
      views: { $ne: user.uuid },
    });
    const formattedUser = {
      uuid: user.uuid,
      avatar: avatarFile,
      username: user.username,
      email: user.email,
      passwordLength: user.passwordLength,
      plan: user.plan,
      isAdmin: isAdmin(user),
      newAnnouncements: newAnnouncements,
    };
    const payload = {
      uuid: user.uuid,
      password: user.password,
    };
    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      {
        expiresIn: 31556926,
      },
      (_, authToken) => {
        res.json({
          success: true,
          authToken: `Bearer ${authToken}`,
          user: formattedUser,
        });
      }
    );
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { mode, email } = req.body;
  if (!mode || !email) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isModeValid = mode === "REGISTER" || mode === "RECOVER_PASSWORD";
  if (!isModeValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    res.json({
      error: true,
      message: "User not found",
    });
    return;
  }
  if (mode === "REGISTER") {
    const isUserVerificating = !user.verificated;
    if (!isUserVerificating) {
      res.json({
        error: true,
        message: "User already verificated",
      });
      return;
    }
    const verification = await Verification.findOne({
      email: email,
    });
    if (!verification) {
      res.json({
        error: true,
        message: "Verification not found",
      });
      return;
    }
    const isResendEmailCooldownExpired =
      Date.now() - verification.expireAt >= 5 * 60 * 1000;
    if (!isResendEmailCooldownExpired) {
      res.json({
        error: true,
        message: "Resend email cooldown not expired",
      });
      return;
    }
    await Verification.deleteOne({ email: email });
    await sendVerificationEmail(email, user.username);
    res.json({
      success: true,
    });
  }
  if (mode === "RECOVER_PASSWORD") {
    const isUserChangingPassword = await ChangePassword.findOne({
      email: email,
    });
    if (isUserChangingPassword) {
      res.json({
        error: true,
        message: "User changing password",
      });
      return;
    }
    const recoverPassword = await RecoverPassword.findOne({
      email: email,
    });
    if (!recoverPassword) {
      res.json({
        error: true,
        message: "Verification not found",
      });
      return;
    }
    const isResendEmailCooldownExpired =
      Date.now() - recoverPassword.expireAt >= 5 * 60 * 1000;
    if (!isResendEmailCooldownExpired) {
      res.json({
        error: true,
        message: "Resend email cooldown not expired",
      });
      return;
    }
    await RecoverPassword.deleteOne({ email: email });
    await sendRecoverPasswordEmail(email, username);
    res.json({
      success: true,
    });
  }
};

export const checkAuthToken = async (req, res) => {
  const { authToken } = req.body;
  if (!authToken) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const { uuid, password } = jwt.verify(authToken, process.env.SECRET_KEY);
    const user = await User.findOne({ uuid: uuid });
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    if (password !== user.password) {
      res.json({
        error: true,
        message: "Passwords not match",
      });
      return;
    }
    let avatarFile;
    const avatarFileExists = fs.existsSync(`media/users/avatars/${uuid}`);
    if (avatarFileExists) {
      avatarFile = await fs.promises.readFile(`media/users/avatars/${uuid}`);
    } else {
      avatarFile = await fs.promises.readFile("media/utils/transparent");
    }
    const newAnnouncements = await Announcement.count({
      views: { $ne: user.uuid },
    });
    const formattedUser = {
      uuid: user.uuid,
      avatar: avatarFile,
      username: user.username,
      email: user.email,
      passwordLength: user.passwordLength,
      plan: user.plan,
      isAdmin: isAdmin(user),
      newAnnouncements: newAnnouncements,
    };
    res.json({
      success: true,
      isValid: true,
      user: formattedUser,
    });
  } catch (error) {
    const isAuthTokenExpired = error.name === "TokenExpiredError";
    if (isAuthTokenExpired) {
      res.json({
        error: true,
        message: "Auth Token expired",
      });
      return;
    }
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const checkAccess = async (req, res) => {
  const { path } = req.body;
  if (!path) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const user = req.user;
  const roles = user.roles;
  const staffRoutes = "/panel/staff";
  const userRoutes = "/panel";
  let isStaffRoute = path.toLowerCase().startsWith(staffRoutes);
  let isUserRoute = path.toLowerCase().startsWith(userRoutes);
  const canAccess =
    roles.includes("ADMIN") ||
    roles.includes(
      isStaffRoute ? "ADMIN" || "STAFF" : isUserRoute ? "USER" : false
    );
  res.json({
    canAccess: canAccess,
  });
};

export const checkStaff = async (req, res) => {
  const user = req.user;
  const roles = user.roles;
  const isStaff = roles.includes("STAFF");
  res.json({
    isStaff: isStaff,
  });
};

export const checkAdmin = async (req, res) => {
  const user = req.user;
  const roles = user.roles;
  const isAdmin = roles.includes("ADMIN");
  res.json({
    isAdmin: isAdmin,
  });
};
