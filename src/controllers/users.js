import Folder from "../models/Folder";
import File from "../models/File";

export const getUserAvatar = async () => {};

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

export const getAnnouncements = async (req, res) => {};

export const getAnnouncementsCount = async (req, res) => {};

export const logAnnouncementVisit = async (req, res) => {};
