import User from "../models/User";
import Folder from "../models/Folder";
import File from "../models/File";
import Announcement from "../models/Announcement";
import EditEmailConfirm from "../models/EditEmailConfirm";
import EditPasswordConfirm from "../models/EditPasswordConfirm";
import {
  sendEditEmailConfirmEmail,
  sendEditPasswordConfirmEmail,
} from "../handlers/email";
import jwt from "jsonwebtoken";
import validator from "validator";

export const getStats = async (req, res) => {
  const user = req.user;
  try {
    const files = await Promise.all(
      user.files
        .map(async (folderOrFileUUID) => {
          const folderOrFile =
            (await Folder.findOne({ uuid: folderOrFileUUID })) ||
            (await File.findOne({ uuid: folderOrFileUUID }));
          return folderOrFile;
        })
        .filter((file) => file)
    );
    const todayVisits = files
      .filter((file) => file.createdAt >= new Date() - 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) =>
          previousValue + currentValue.visits.length,
        0
      );
    const todayVisitsGrowing =
      todayVisits >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.visits.length,
          0
        );
    const yesterdayVisits = files
      .filter(
        (file) =>
          file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 24 * 60 * 60 * 1000
      )
      .reduce(
        (previousValue, currentValue) =>
          previousValue + currentValue.visits.length,
        0
      );
    const yesterdayVisitsGrowing =
      yesterdayVisits >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 48 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.visits.length,
          0
        );
    const lastWeekVisits = files
      .filter((file) => file.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) =>
          previousValue + currentValue.visits.length,
        0
      );
    const lastWeekVisitsGrowing =
      lastWeekVisits >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.visits.length,
          0
        );
    const lastMonthVisits = files
      .filter((file) => file.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) =>
          previousValue + currentValue.visits.length,
        0
      );
    const lastMonthVisitsGrowing =
      lastMonthVisits >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.visits.length,
          0
        );
    const todayFiles = files.filter(
      (file) => file.createdAt >= new Date() - 24 * 60 * 60 * 1000
    ).length;
    const todayFilesGrowing =
      todayFiles >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 24 * 60 * 60 * 1000
      ).length;
    const yesterdayFiles = files.filter(
      (file) =>
        file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
        file.createdAt < new Date() - 24 * 60 * 60 * 1000
    ).length;
    const yesterdayFilesGrowing =
      yesterdayVisits >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 48 * 60 * 60 * 1000
      ).length;
    const lastWeekFiles = files.filter(
      (file) => file.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const lastWeekFilesGrowing =
      lastWeekVisits >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
      ).length;
    const lastMonthFiles = files.filter(
      (file) => file.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000
    ).length;
    const lastMonthFilesGrowing =
      lastMonthVisits >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
      ).length;
    const todayLinks = files.filter(
      (file) => file.createdAt >= new Date() - 24 * 60 * 60 * 1000 && file.link
    ).length;
    const todayLinksGrowing =
      todayLinks >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 24 * 60 * 60 * 1000 &&
          file.link
      ).length;
    const yesterdayLinks = files.filter(
      (file) =>
        file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
        file.createdAt < new Date() - 24 * 60 * 60 * 1000 &&
        file.link
    ).length;
    const yesterdayLinksGrowing =
      yesterdayLinks >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 48 * 60 * 60 * 1000 &&
          file.link
      ).length;
    const lastWeekLinks = files.filter(
      (file) =>
        file.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000 && file.link
    ).length;
    const lastWeekLinksGrowing =
      lastWeekLinks >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000 &&
          file.link
      ).length;
    const lastMonthLinks = files.filter(
      (file) => file.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000
    ).length;
    const lastMonthLinksGrowing =
      lastMonthLinksGrowing >=
      files.filter(
        (file) =>
          file.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000 &&
          file.link
      ).length;
    const todayDownloads = files
      .filter((file) => file.createdAt >= new Date() - 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue.downloads,
        0
      );
    const todayDownloadsGrowing =
      todayDownloads >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads,
          0
        );
    const yesterdayDownloads = files
      .filter(
        (file) =>
          file.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          file.createdAt < new Date() - 24 * 60 * 60 * 1000
      )
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue.downloads,
        0
      );
    const yesterdayDownloadsGrowing =
      yesterdayDownloads >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 48 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads,
          0
        );
    const lastWeekDownloads = files
      .filter((file) => file.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue.downloads,
        0
      );
    const lastWeekDownloadsGrowing =
      lastWeekDownloads >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads,
          0
        );
    const lastMonthDownloads = files
      .filter((file) => file.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue.downloads,
        0
      );
    const lastMonthDownloadsGrowing =
      lastMonthDownloads >=
      files
        .filter(
          (file) =>
            file.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
            file.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
        )
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads,
          0
        );
    res.json({
      success: true,
      stats: {
        visits: {
          todayVisits: todayVisits,
          todayVisitsGrowing: todayVisitsGrowing,
          yesterdayVisits: yesterdayVisits,
          yesterdayVisitsGrowing: yesterdayVisitsGrowing,
          lastWeekVisits: lastWeekVisits,
          lastWeekVisitsGrowing: lastWeekVisitsGrowing,
          lastMonthVisits: lastMonthVisits,
          lastMonthVisitsGrowing: lastMonthVisitsGrowing,
        },
        files: {
          todayFiles: todayFiles,
          todayFilesGrowing: todayFilesGrowing,
          yesterdayFiles: yesterdayFiles,
          yesterdayFilesGrowing: yesterdayFilesGrowing,
          lastWeekFiles: lastWeekFiles,
          lastWeekFilesGrowing: lastWeekFilesGrowing,
          lastMonthFiles: lastMonthFiles,
          lastMonthFilesGrowing: lastMonthFilesGrowing,
        },
        links: {
          todayLinks: todayLinks,
          todayLinksGrowing: todayLinksGrowing,
          yesterdayLinks: yesterdayLinks,
          yesterdayLinksGrowing: yesterdayLinksGrowing,
          lastWeekLinks: lastWeekLinks,
          lastWeekLinksGrowing: lastWeekLinksGrowing,
          lastMonthLinks: lastMonthLinks,
          lastMonthLinksGrowing: lastMonthLinksGrowing,
        },
        downloads: {
          todayDownloads: todayDownloads,
          todayDownloadsGrowing: todayDownloadsGrowing,
          yesterdayDownloads: yesterdayDownloads,
          yesterdayDownloadsGrowing: yesterdayDownloadsGrowing,
          lastWeekDownloads: lastWeekDownloads,
          lastWeekDownloadsGrowing: lastWeekDownloadsGrowing,
          lastMonthDownloads: lastMonthDownloads,
          lastMonthDownloadsGrowing: lastMonthDownloadsGrowing,
        },
      },
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const getAnnouncements = async (req, res) => {
  const { page } = req.body;
  if (!page) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const skipResults = (page - 1) * 50;
    let announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .skip(skipResults)
      .limit(50);
    announcements = announcements.map((announcement) =>
      announcement.toObject()
    );
    const formattedAnnouncements = announcements.map((announcement) => ({
      uuid: announcement.uuid,
      title: announcement.title,
      announcement: announcement.announcement,
      views: announcement.views.length,
      createdAt: announcement.createdAt,
    }));
    res.json({
      success: true,
      announcements: formattedAnnouncements,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const getAnnouncement = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const announcement = await Announcement.findOne({ uuid: uuid });
    if (!announcement) {
      res.json({
        error: true,
        message: "Announcement not found",
      });
      return;
    }
    const formattedAnnouncement = {
      uuid: announcement.uuid,
      title: announcement.title,
      announcement: announcement.announcement,
      views: announcement.views.length,
      createdAt: announcement.createdAt,
    };
    res.json({
      success: true,
      announcement: formattedAnnouncement,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const logAnnouncementVisit = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const announcementExists = await Announcement.findOne({ uuid: uuid });
    if (!announcementExists) {
      res.json({
        error: true,
        message: "Announcement not found",
      });
      return;
    }
    const user = req.user.uuid;
    await Announcement.updateOne({ uuid: uuid }, { $push: { views: user } });
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      error: true,
      messgae: error,
    });
    console.log(error);
  }
};

export const editUser = async (req, res) => {
  const { uuid, username, email, password } = req.body;
  const avatar = req.files?.avatar;
  if (!avatar && !username && !email && !password) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  if (avatar) {
    const isAvatarValid =
      (avatar.mimetype === "image/jpeg" ||
        avatar.mimetype === "image/jpg" ||
        avatar.mimetype === "image/png" ||
        avatar.mimetype === "image/webp" ||
        avatar.mimetype === "image/gif") &&
      avatar.size / 1024 / 1024 <= 10;
    if (!isAvatarValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
  }
  if (username) {
    const isUsernameValid = validator.isLength(username, { min: 4, max: 16 });
    if (!isUsernameValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
  }
  if (email) {
    const isEmailValid = validator.isEmail(email);
    if (!isEmailValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
  }
  if (password) {
    const isPasswordValid = validator.isLength(password, { min: 6, max: 50 });
    if (!isPasswordValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
  }
  try {
    let user = uuid ? await User.findOne({ uuid: uuid }) : req.user;
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
      });
      return;
    }
    const isUsernameRepeated =
      username &&
      (await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
      }));
    const isEmailRepeated =
      email &&
      (await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
        verificated: true,
      }));
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
    if (isUsernameRepeated && isEmailRepeated) {
      res.json({
        error: true,
        message: "Repeated information",
      });
      return;
    }
    if (avatar) {
      await avatar.mv(`media/users/avatars/${user.uuid}`);
    }
    if (username) {
      await User.updateOne({ uuid: user.uuid }, { username: username });
    }
    if (email) {
      const isEditEmailConfirming = await EditEmailConfirm.findOne({
        user: user.uuid,
      });
      if (isEditEmailConfirming) {
        await EditEmailConfirm.deleteOne({ user: user.uuid });
      }
      await sendEditEmailConfirmEmail(user.uuid, email, user.username);
      res.json({
        success: true,
      });
      return;
    }
    if (password) {
      const isEditPasswordConfirming = await EditPasswordConfirm.findOne({
        user: user.uuid,
      });
      if (isEditPasswordConfirming) {
        await EditPasswordConfirm.deleteOne({ user: user.uuid });
      }
      await sendEditPasswordConfirmEmail(
        user.uuid,
        user.email,
        password,
        user.username
      );
      res.json({
        success: true,
      });
      return;
    }
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

export const confirmEditEmail = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const editEmailConfirmation = await EditEmailConfirm.findOne({
      user: user,
    });
    if (!editEmailConfirmation) {
      res.json({
        error: true,
        message: "Email edit confirmation not found",
      });
      return;
    }
    const isCodeValid = await editEmailConfirmation.isCodeValid(code);
    if (!isCodeValid) {
      res.json({
        error: true,
        message: "Invalid code",
      });
      return;
    }
    const email = editEmailConfirmation.email;
    await User.updateOne({ uuid: user }, { email: email });
    res.json({
      success: true,
      email: email,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const confirmEditPassword = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    let user = req.user;
    const editPasswordConfirmation = await EditPasswordConfirm.findOne({
      user: user.uuid,
    });
    if (!editPasswordConfirmation) {
      res.json({
        error: true,
        message: "Password edit confirmation not found",
      });
      return;
    }
    const isCodeValid = await editPasswordConfirmation.isCodeValid(code);
    if (!isCodeValid) {
      res.json({
        error: true,
        message: "Invalid code",
      });
      return;
    }
    const password = editPasswordConfirmation.password;
    const passwordLength = password.length;
    await User.updateOne({ uuid: user.uuid }, { password: password });
    user = await User.findOne({ uuid: user.uuid });
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
          passwordLength: passwordLength,
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

export const resendConfirmEditEmailEmail = async (req, res) => {
  try {
    const user = req.user;
    const editEmailConfirmation = await EditEmailConfirm.findOne({
      user: user.uuid,
    });
    if (!editEmailConfirmation) {
      res.json({
        error: true,
        message: "Edit email confirmation not found",
      });
      return;
    }
    const isResendEmailCooldownExpired =
      Date.now() - editEmailConfirmation.expireAt >= 5 * 60 * 1000;
    if (!isResendEmailCooldownExpired) {
      res.json({
        error: true,
        message: "Resend email cooldown not expired",
      });
      return;
    }
    await EditEmailConfirm.deleteOne({ user: user.uuid });
    await sendEditEmailConfirmEmail(
      user.uuid,
      editEmailConfirmation.email,
      user.username
    );
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

export const resendConfirmEditPasswordEmail = async (req, res) => {
  try {
    const user = req.user;
    const editPasswordConfirmation = await EditPasswordConfirm.findOne({
      user: user.uuid,
    });
    if (!editPasswordConfirmation) {
      res.json({
        error: true,
        message: "Edit password confirmation not found",
      });
      return;
    }
    const isResendEmailCooldownExpired =
      Date.now() - editPasswordConfirmation.expireAt >= 5 * 60 * 1000;
    if (!isResendEmailCooldownExpired) {
      res.json({
        error: true,
        message: "Resend email cooldown not expired",
      });
      return;
    }
    await EditPasswordConfirm.deleteOne({ user: user.uuid });
    await sendEditPasswordConfirmEmail(
      user.uuid,
      user.email,
      editPasswordConfirmation.password,
      user.username
    );
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
