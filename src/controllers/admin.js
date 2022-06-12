import Folder from "../models/Folder";
import File from "../models/File";
import User from "../models/User";
import Payment from "../models/Payment";
import Report from "../models/Report";
import Announcement from "../models/Announcement";
import { io } from "../handlers/socket";
import validator from "validator";
import fs from "fs";

export const getUsers = async (req, res) => {
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
    const users = (
      await User.find({ username: { $ne: "Admin" } })
        .sort({ createdAt: -1 })
        .skip(skipResults)
        .limit(50)
    ).map((user) => user.toObject());
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
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
        const files =
          (await File.count({ user: user.uuid })) +
          (await Folder.count({ user: user.uuid }));
        const links =
          (await File.count({ user: user.uuid, link: true })) +
          (await Folder.count({ user: user.uuid, link: true }));
        const downloads = [
          ...(await File.find({ user: user.uuid, link: true })),
          ...(await Folder.find({ user: user.uuid, link: true })),
        ].reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads.length,
          0
        );
        return {
          uuid: user.uuid,
          avatar: avatarFile,
          username: user.username,
          email: user.email,
          files: files,
          links: links,
          downloads: downloads,
          createdAt: user.createdAt,
        };
      })
    );
    res.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const getUser = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = await User.findOne({ uuid: uuid, username: { $ne: "Admin" } });
    if (!user) {
      res.json({
        error: true,
        message: "User not found",
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
    const formattedUser = {
      uuid: user.uuid,
      avatar: avatarFile,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
    res.json({
      success: true,
      user: formattedUser,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const getStats = async (_, res) => {
  try {
    const files = (await Folder.find()).concat(await File.find());
    const users = await User.find({
      username: { $ne: "Admin" },
      verificated: true,
    });
    const payments = await Payment.find();
    const reports = await Report.find();
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
    const todayUsers = users.filter(
      (user) => user.createdAt >= new Date() - 24 * 60 * 60 * 1000
    ).length;
    const todayUsersGrowing =
      todayUsers >=
      users.filter(
        (user) =>
          user.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          user.createdAt < new Date() - 24 * 60 * 60 * 1000
      ).length;
    const yesterdayUsers = users.filter(
      (user) =>
        user.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
        user.createdAt < new Date() - 24 * 60 * 60 * 1000
    ).length;
    const yesterdayUsersGrowing =
      yesterdayUsers >=
      users.filter(
        (user) =>
          user.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
          user.createdAt < new Date() - 48 * 60 * 60 * 1000
      ).length;
    const lastWeekUsers = users.filter(
      (user) => user.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const lastWeekUsersGrowing =
      lastWeekUsers >=
      users.filter(
        (user) =>
          user.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
          user.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
      ).length;
    const lastMonthUsers = users.filter(
      (user) => user.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000
    ).length;
    const lastMonthUsersGrowing =
      lastMonthUsers >=
      users.filter(
        (user) =>
          user.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
          user.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
      ).length;
    const todayPayments = payments.filter(
      (payment) => payment.createdAt >= new Date() - 24 * 60 * 60 * 1000
    ).length;
    const todayPaymentsGrowing =
      todayPayments >=
      payments.filter(
        (payment) =>
          payment.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          payment.createdAt < new Date() - 24 * 60 * 60 * 1000
      ).length;
    const yesterdayPayments = payments.filter(
      (payment) =>
        payment.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
        payment.createdAt < new Date() - 24 * 60 * 60 * 1000
    ).length;
    const yesterdayPaymentsGrowing =
      yesterdayPayments >=
      payments.filter(
        (payment) =>
          payment.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
          payment.createdAt < new Date() - 48 * 60 * 60 * 1000
      ).length;
    const lastWeekPayments = payments.filter(
      (payment) => payment.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const lastWeekPaymentsGrowing =
      lastWeekPayments >=
      payments.filter(
        (payment) =>
          payment.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
          payment.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
      ).length;
    const lastMonthPayments = payments.filter(
      (payment) => payment.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000
    ).length;
    const lastMonthPaymentsGrowing =
      lastMonthPayments >=
      payments.filter(
        (payment) =>
          payment.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
          payment.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
      ).length;
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
    const todayReports = reports.filter(
      (report) => report.createdAt >= new Date() - 24 * 60 * 60 * 1000
    ).length;
    const todayReportsGrowing =
      todayReports >=
      reports.filter(
        (report) =>
          report.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
          report.createdAt < new Date() - 24 * 60 * 60 * 1000
      ).length;
    const yesterdayReports = reports.filter(
      (report) =>
        report.createdAt >= new Date() - 48 * 60 * 60 * 1000 &&
        report.createdAt < new Date() - 24 * 60 * 60 * 1000
    ).length;
    const yesterdayReportsGrowing =
      yesterdayReports >=
      reports.filter(
        (report) =>
          report.createdAt >= new Date() - 72 * 60 * 60 * 1000 &&
          report.createdAt < new Date() - 48 * 60 * 60 * 1000
      ).length;
    const lastWeekReports = reports.filter(
      (report) => report.createdAt >= new Date() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const lastWeekReportsGrowing =
      lastWeekReports >=
      reports.filter(
        (report) =>
          report.createdAt >= new Date() - 14 * 24 * 60 * 60 * 1000 &&
          report.createdAt < new Date() - 7 * 24 * 60 * 60 * 1000
      ).length;
    const lastMonthReports = reports.filter(
      (report) => report.createdAt >= new Date() - 30 * 24 * 60 * 60 * 1000
    ).length;
    const lastMonthReportsGrowing =
      lastMonthReports >=
      reports.filter(
        (report) =>
          report.createdAt >= new Date() - 60 * 24 * 60 * 60 * 1000 &&
          report.createdAt < new Date() - 30 * 24 * 60 * 60 * 1000
      ).length;
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
        users: {
          todayUsers: todayUsers,
          todayUsersGrowing: todayUsersGrowing,
          yesterdayUsers: yesterdayUsers,
          yesterdayUsersGrowing: yesterdayUsersGrowing,
          lastWeekUsers: lastWeekUsers,
          lastWeekUsersGrowing: lastWeekUsersGrowing,
          lastMonthUsers: lastMonthUsers,
          lastMonthUsersGrowing: lastMonthUsersGrowing,
        },
        payments: {
          todayPayments: todayPayments,
          todayPaymentsGrowing: todayPaymentsGrowing,
          yesterdayPayments: yesterdayPayments,
          yesterdayPaymentsGrowing: yesterdayPaymentsGrowing,
          lastWeekPayments: lastWeekPayments,
          lastWeekPaymentsGrowing: lastWeekPaymentsGrowing,
          lastMonthPayments: lastMonthPayments,
          lastMonthPaymentsGrowing: lastMonthPaymentsGrowing,
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
        reports: {
          todayReports: todayReports,
          todayReportsGrowing: todayReportsGrowing,
          yesterdayReports: yesterdayReports,
          yesterdayReportsGrowing: yesterdayReportsGrowing,
          lastWeekReports: lastWeekReports,
          lastWeekReportsGrowing: lastWeekReportsGrowing,
          lastMonthReports: lastMonthReports,
          lastMonthReportsGrowing: lastMonthReportsGrowing,
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

export const getPayments = async (req, res) => {
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
    const payments = (
      await Payment.find().sort({ createdAt: -1 }).skip(skipResults).limit(50)
    ).map((payment) => payment.toObject());
    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const user = await User.findOne({ uuid: payment.user });
        return {
          id: payment.id,
          username: user ? user.username : "Deleted user",
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          createdAt: payment.createdAt,
        };
      })
    );
    res.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const searchUsers = async (req, res) => {
  const { search } = req.body;
  if (!search) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isSearchValid = validator.isLength(search, { max: 100 });
  if (!isSearchValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    let users = (
      await User.find({ username: { $ne: "Admin" } }).sort({
        createdAt: -1,
      })
    ).map((user) => user.toObject());
    const searchRegex = new RegExp(search, "i");
    users = users.filter(
      (user) =>
        user.uuid.match(searchRegex) ||
        user.username.match(searchRegex) ||
        user.email.match(searchRegex)
    );
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
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
        const files =
          (await File.count({ user: user.uuid })) +
          (await Folder.count({ user: user.uuid }));
        const links =
          (await File.count({ user: user.uuid, link: true })) +
          (await Folder.count({ user: user.uuid, link: true }));
        const downloads = [
          ...(await File.find({ user: user.uuid, link: true })),
          ...(await Folder.find({ user: user.uuid, link: true })),
        ].reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.downloads.length,
          0
        );
        return {
          uuid: user.uuid,
          avatar: avatarFile,
          username: user.username,
          email: user.email,
          files: files,
          links: links,
          downloads: downloads,
          createdAt: user.createdAt,
        };
      })
    );
    res.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    res.json({
      errror: true,
      message: error,
    });
    console.log(error);
  }
};

export const editUser = async (req, res) => {
  const { uuid, username, email, password } = req.body;
  let { roles } = req.body;
  if (roles) {
    roles = roles.split(",").filter((role) => role);
  }
  const avatar = req.files?.avatar;
  if (!uuid && !avatar && !username && !email && !password && !roles) {
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
  if (roles) {
    const isRolesValid =
      Array.isArray(roles) &&
      roles.length !== 0 &&
      roles.every(
        (role) => role === "USER" || role === "STAFF" || role === "ADMIN"
      );
    if (!isRolesValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
  }
  try {
    const user = await User.findOne({
      uuid: uuid,
      username: { $ne: "Admin" },
      verificated: true,
    });
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
    await User.updateOne(
      { uuid: user.uuid },
      {
        ...(username && { username: username }),
        ...(email && { email: email }),
        ...(password && { password: password }),
        ...(roles && { roles: roles }),
      }
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

export const deleteUser = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const userExists = await User.findOneAndDelete({ uuid: uuid });
    if (!userExists) {
      res.json({
        error: true,
        message: "User not found",
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

export const createAnnouncement = async (req, res) => {
  const { title, announcement } = req.body;
  if (!title || !announcement) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isTitleValid = validator.isLength(title, { min: 5, max: 100 });
  if (!isTitleValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const isTitleRepeated = await Announcement.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });
    if (isTitleRepeated) {
      res.json({
        error: true,
        message: "Repeated title",
      });
      return;
    }
    const announcement = await new Announcement({
      title: title,
      announcement: announcement,
    }).save();
    const formattedAnnouncement = {
      uuid: announcement.uuid,
      title: announcement.title,
      announcement: announcement.announcement,
      views: announcement.views.length,
      createdAt: announcement.createdAt,
    };
    io.emit("newAnnouncement", formattedAnnouncement);
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

export const editAnnouncement = async (req, res) => {
  const { uuid, title, announcement } = req.body;
  if (!uuid || (!title && !announcement)) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  if (title) {
    const isTitleValid = validator.isLength(title, { min: 5, max: 100 });
    if (!isTitleValid) {
      res.json({
        error: true,
        message: "Invalid information",
      });
      return;
    }
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
    if (title) {
      const isTitleRepeated = await Announcement.findOne({
        title: { $regex: `^${title}$`, $options: "i" },
      });
      if (isTitleRepeated) {
        res.json({
          error: true,
          message: "Repeated title",
        });
        return;
      }
    }
    await Announcement.updateOne(
      { uuid: uuid },
      {
        ...(title && { title: title }),
        ...(announcement && { announcement: announcement }),
      }
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

export const deleteAnnouncement = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const announcementExists = await Announcement.findOneAndDelete({
      uuid: uuid,
    });
    if (!announcementExists) {
      res.json({
        error: true,
        message: "Announcement not found",
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

export const completePayment = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const paymentExists = await Payment.findOneAndUpdate(
      { id: id },
      { status: "COMPLETE" }
    );
    if (!paymentExists) {
      res.json({
        error: true,
        message: "Payment not found",
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

export const deletePayment = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const paymentExists = await Payment.findOneAndDelete({ id: id });
    if (!paymentExists) {
      res.json({
        error: true,
        message: "Payment not found",
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
