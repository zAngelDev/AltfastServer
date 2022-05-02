import Folder from "../models/Folder";
import File from "../models/File";
import User from "../models/User";
import Payment from "../models/Payment";
import Report from "../models/Report";

export const getStats = async (_, res) => {
  try {
    const files = (await Folder.find()).concat(await File.find());
    const users = await User.find();
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

export const createAnnouncement = async (req, res) => {};

export const editAnnouncement = async (req, res) => {};

export const deleteAnnouncement = async (req, res) => {};
