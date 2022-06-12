import Folder from "../models/Folder";
import File from "../models/File";
import fs from "fs";
import { getPlanSpace } from "../utils/utils";

export const getFiles = async (req, res) => {
  const { folder } = req.body;
  let trash = req.body?.trash;
  trash = trash ? true : false;
  try {
    const user = req.user.uuid;
    let foundedFolder;
    if (folder) {
      foundedFolder = await Folder.findOne({ uuid: folder, user: user });
      if (!foundedFolder) {
        res.json({
          error: true,
          message: "Folder not found",
        });
        return;
      }
    }
    const folders = await Promise.all(
      (
        await Folder.find({
          parent: !folder ? { $exists: false } : folder,
          user: user,
          trash: trash,
        })
      ).map(async (folder) => {
        folder = folder.toObject();
        const folders = await Folder.count({ parent: folder.uuid, user: user });
        const files = await File.count({ folder: folder.uuid, user: user });
        folder.folders = folders;
        folder.files = files;
        return folder;
      })
    );
    const files = (
      await File.find({
        folder: !folder ? { $exists: false } : folder,
        user: user,
        trash: trash,
      })
    ).map((file) => file.toObject());
    const formattedFolders = folders.map((folder) => ({
      uuid: folder.uuid,
      type: "FOLDER",
      name: folder.name,
      clasification: folder.clasification,
      folders: folder.folders,
      files: folder.files,
      link: folder.link,
      ...(folder.lastModified > folder.createdAt
        ? { lastModified: folder.lastModified }
        : { createdAt: folder.createdAt }),
    }));
    const formattedFiles = files.map((file) => ({
      uuid: file.uuid,
      type: "FILE",
      name: file.name,
      mimetype: file.mimetype,
      size: file.size,
      link: file.link,
      ...(file.lastModified > file.createdAt
        ? { lastModified: file.lastModified }
        : { createdAt: file.createdAt }),
    }));
    res.json({
      success: true,
      folders: formattedFolders,
      files: formattedFiles,
      ...(folder &&
        foundedFolder.parent && { parentFolder: foundedFolder.parent }),
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const createFolder = async (req, res) => {
  const { name, parent } = req.body;
  if (!name && !parent) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isNameValid = name.match(
    /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/
  );
  if (!isNameValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    if (parent) {
      const parentExists = await Folder.findOne({
        uuid: parent,
        user: user,
        trash: false,
      });
      if (!parentExists) {
        res.json({
          error: true,
          message: "Parent not found",
        });
        return;
      }
    }
    const isNameRepeated = await Folder.findOne({
      parent: !parent ? { $exists: false } : parent,
      user: user,
      name: name,
      trash: false,
    });
    if (isNameRepeated) {
      res.json({
        error: true,
        message: "Repeated name",
      });
      return;
    }
    const folder = await new Folder({
      ...(parent && { parent: parent }),
      user: user,
      name: name,
    }).save();
    const folderUUID = folder.uuid;
    await fs.promises.mkdir(`storage/${user}/${folderUUID}`, {
      recursive: true,
    });
    const formattedFolder = {
      uuid: folder.uuid,
      type: "FOLDER",
      name: folder.name,
      clasification: folder.clasification,
      folders: 0,
      files: 0,
      link: folder.link,
      ...(folder.lastModified > folder.createdAt
        ? { lastModified: folder.lastModified }
        : { createdAt: folder.createdAt }),
    };
    res.json({
      success: true,
      folder: formattedFolder,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const uploadFiles = async (req, res) => {
  const { folder } = req.body;
  if (req.files.length === 0) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user;
    if (folder) {
      const folderExists = await Folder.findOne({
        uuid: folder,
        user: user.uuid,
        trash: false,
      });
      if (!folderExists) {
        res.json({
          error: true,
          message: "Folder not found",
        });
        return;
      }
    }
    const fileNames = Object.keys(req.files);
    for (const fileName of fileNames) {
      const file = req.files[fileName];
      const isFileNameValid = fileName.match(
        /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/
      );
      const isFileValid = file.size / 1024 / 1024 <= 20000;
      if (!isFileNameValid || !isFileValid) {
        res.json({
          error: true,
          message: "Invalid information",
        });
        break;
      }
    }
    const planSpace = getPlanSpace(user);
    const hasAvailableSpace =
      (await File.find({ user: user.uuid })).reduce(
        (previousValue, currentValue) => previousValue + currentValue.size,
        0
      ) +
        fileNames.reduce(
          (previousValue, currentValue) =>
            previousValue + req.files[currentValue].size,
          0
        ) <
      planSpace;
    if (!hasAvailableSpace) {
      res.json({
        error: true,
        message: "Insufficient space",
      });
      return;
    }
    const files = [];
    for (let fileName of fileNames) {
      const file = req.files[fileName];
      fileName = await getRepeatedFileName({
        folder: !folder ? { $exists: false } : folder,
        user: user.uuid,
        name: fileName,
        trash: false,
      });
      const newFile = await new File({
        ...(folder && { folder: folder }),
        user: user.uuid,
        name: fileName,
        mimetype: file.mimetype,
        size: file.size,
      }).save();
      await file.mv(
        `storage/${user.uuid}${folder ? `/${folder}` : ""}/${fileName}`
      );
      files.push(newFile);
    }
    const formattedFiles = files.map((file) => ({
      uuid: file.uuid,
      type: "FILE",
      name: file.name,
      mimetype: file.mimetype,
      size: file.size,
      link: file.link,
      ...(file.lastModified > file.createdAt
        ? { lastModified: file.lastModified }
        : { createdAt: file.createdAt }),
    }));
    res.json({
      success: true,
      files: formattedFiles,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const uploadFolder = async (req, res) => {
  const { folder } = req.body;
  let { relativePaths } = req.body;
  relativePaths = relativePaths
    .split(",")
    .filter((relativePath) => relativePath);
  if (req.files.length === 0 || !relativePaths) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isRelativePathsValid = Array.isArray(relativePaths);
  if (!isRelativePathsValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user;
    if (folder) {
      const folderExists = await Folder.findOne({
        uuid: folder,
        user: user.uuid,
        trash: false,
      });
      if (!folderExists) {
        res.json({
          error: true,
          message: "Folder not found",
        });
        return;
      }
    }
    const fileNames = Object.keys(req.files);
    for (const fileName of fileNames) {
      const file = req.files[fileName];
      const isFileNameValid = fileName.match(
        /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/
      );
      const isFileValid = file.size / 1024 / 1024 <= 20000;
      if (!isFileNameValid || !isFileValid) {
        res.json({
          error: true,
          message: "Invalid information",
        });
        break;
      }
    }
    const planSpace = getPlanSpace(user);
    const hasAvailableSpace =
      (await File.find({ user: user.uuid })).reduce(
        (previousValue, currentValue) => previousValue + currentValue.size,
        0
      ) +
        fileNames.reduce(
          (previousValue, currentValue) =>
            previousValue + req.files[currentValue].size,
          0
        ) <
      planSpace;
    if (!hasAvailableSpace) {
      res.json({
        error: true,
        message: "Insufficient space",
      });
      return;
    }
    let firstParentFolderName = relativePaths[0].split("/")[0];
    firstParentFolderName = await getRepeatedFolderName({
      parent: !folder ? { $exists: false } : folder,
      user: user.uuid,
      name: firstParentFolderName,
      trash: false,
    });
    const firstParentFolder = await new Folder({
      ...(folder && { parent: folder }),
      user: user.uuid,
      name: firstParentFolderName,
    }).save();
    await fs.promises.mkdir(`storage/${user.uuid}/${firstParentFolder.uuid}`, {
      recursive: true,
    });
    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      const file = req.files[fileName];
      const parentFoldersNames = relativePaths[i].split("/");
      parentFoldersNames.shift();
      parentFoldersNames.pop();
      let lastParentFolder;
      let previousParentFolder;
      for (let j = 0; j < parentFoldersNames.length; j++) {
        const parentFolderName = parentFoldersNames[j];
        let parentFolder = await Folder.findOne({
          parent: !previousParentFolder
            ? firstParentFolder.uuid
            : previousParentFolder,
          user: user.uuid,
          name: parentFolderName,
        });
        if (!parentFolder) {
          parentFolder = await new Folder({
            parent: !previousParentFolder
              ? firstParentFolder.uuid
              : previousParentFolder,
            user: user.uuid,
            name: parentFolderName,
          }).save();
          await fs.promises.mkdir(`storage/${user.uuid}/${parentFolder.uuid}`, {
            recursive: true,
          });
        }
        if (j !== parentFoldersNames.length - 1) {
          previousParentFolder = parentFolder.uuid;
        } else {
          lastParentFolder = parentFolder.uuid;
        }
      }
      fileName = await getRepeatedFileName({
        folder: lastParentFolder,
        user: user.uuid,
        name: fileName,
        trash: false,
      });
      await new File({
        folder: !lastParentFolder ? firstParentFolder.uuid : lastParentFolder,
        user: user.uuid,
        name: fileName,
        mimetype: file.mimetype,
        size: file.size,
      }).save();
      await file.mv(
        `storage/${user.uuid}/${
          !lastParentFolder ? firstParentFolder.uuid : lastParentFolder
        }/${fileName}`
      );
    }
    const formattedFolder = {
      uuid: firstParentFolder.uuid,
      type: "FOLDER",
      name: firstParentFolder.name,
      clasification: firstParentFolder.clasification,
      folders: 0,
      files: 0,
      link: firstParentFolder.link,
      ...(firstParentFolder.lastModified > firstParentFolder.createdAt
        ? { lastModified: firstParentFolder.lastModified }
        : { createdAt: firstParentFolder.createdAt }),
    };
    res.json({
      success: true,
      folder: formattedFolder,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error,
    });
    console.log(error);
  }
};

export const toggleFolderLink = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const folder = await Folder.findOne({
      uuid: uuid,
      user: user,
      trash: false,
    });
    if (!folder) {
      res.json({
        error: true,
        message: "Folder not found",
      });
      return;
    }
    await Folder.updateOne(
      { uuid: uuid, user: user, trash: false },
      { link: !folder.link }
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

export const toggleFileLink = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const file = await File.findOne({
      uuid: uuid,
      user: user,
      trash: false,
    });
    if (!file) {
      res.json({
        error: true,
        message: "File not found",
      });
      return;
    }
    await File.updateOne(
      { uuid: uuid, user: user, trash: false },
      { link: !file.link }
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

export const disableFoldersAndFilesLinks = async (req, res) => {
  const { uuids } = req.body;
  if (!uuids) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isUUIDSValid = Array.isArray(uuids);
  if (!isUUIDSValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    await Folder.updateMany(
      { uuid: { $in: uuids }, user: user, link: true, trash: false },
      { link: false }
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

export const deleteFolder = async (req, res) => {
  const { uuid, mode } = req.body;
  if (!uuid || !mode) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isModeValid = mode === "TRASH" || mode === "PERMANENT";
  if (!isModeValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const folder = await Folder.findOne({
      uuid: uuid,
      user: user,
      trash: mode === "TRASH" ? false : mode === "PERMANENT" ? true : null,
    });
    if (!folder) {
      res.json({
        error: true,
        message: "Folder not found",
      });
      return;
    }
    if (mode === "TRASH") {
      const folderName = await getRepeatedFolderName({
        parent: { $exists: false },
        user: user,
        name: folder.name,
        trash: true,
      });
      const hasParent = folder.parent;
      await Folder.updateOne(
        { uuid: uuid, user: user, trash: false },
        {
          ...(hasParent && { $unset: { parent: "" } }),
          name: folderName,
          trash: true,
        }
      );
    }
    if (mode === "PERMANENT") {
      await Folder.deleteOne({ uuid: uuid, user: user, trash: true });
      await fs.promises.rmdir(`storage/${user}/${folder.uuid}`, {
        recursive: true,
      });
    }
    await deleteFolderFoldersAndFiles(uuid, user, mode);
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

export const deleteFile = async (req, res) => {
  const { uuid, mode } = req.body;
  if (!uuid || !mode) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isModeValid = mode === "TRASH" || mode === "PERMANENT";
  if (!isModeValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const file = await File.findOne({
      uuid: uuid,
      user: user,
      trash: mode === "TRASH" ? false : mode === "PERMANENT" ? true : null,
    });
    if (!file) {
      res.json({
        error: true,
        message: "Folder not found",
      });
      return;
    }
    if (mode === "TRASH") {
      const fileName = await getRepeatedFileName({
        folder: { $exists: false },
        user: user,
        name: file.name,
        trash: true,
      });
      const hasFolder = file.folder;
      await File.updateOne(
        { uuid: uuid, user: user, trash: false },
        {
          ...(hasFolder && { $unset: { folder: "" } }),
          name: fileName,
          trash: true,
        }
      );
    }
    if (mode === "PERMANENT") {
      await File.deleteOne({ uuid: uuid, user: user, trash: true });
      const folder = file.folder;
      const fileName = file.name;
      await fs.promises.rm(
        `storage/${user}${folder ? `/${folder}` : ""}/${fileName}`,
        {
          force: true,
        }
      );
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

export const deleteFoldersAndFiles = async (req, res) => {
  const { uuids, mode } = req.body;
  if (!uuids || !mode) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isUUIDSValid = Array.isArray(uuids);
  if (!isUUIDSValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    if (mode === "TRASH") {
      for (const uuid of uuids) {
        const folder = await Folder.findOne({
          uuid: uuid,
          user: user,
          trash: false,
        });
        const file = await File.findOne({
          uuid: uuid,
          user: user,
          trash: false,
        });
        if (folder) {
          const folderName = await getRepeatedFolderName({
            parent: { $exists: false },
            user: user,
            name: folder.name,
            trash: true,
          });
          const hasParent = folder.parent;
          await Folder.updateOne(
            { uuid: uuid, user: user, trash: false },
            {
              ...(hasParent && { $unset: { parent: "" } }),
              name: folderName,
              trash: true,
            }
          );
          await deleteFolderFoldersAndFiles(uuid, user, mode);
        }
        if (file) {
          const fileName = await getRepeatedFileName({
            folder: { $exists: false },
            user: user,
            name: file.name,
            trash: true,
          });
          const hasFolder = file.folder;
          await File.updateOne(
            { uuid: uuid, user: user, trash: false },
            {
              ...(hasFolder && { $unset: { folder: "" } }),
              name: fileName,
              trash: true,
            }
          );
        }
      }
    }
    if (mode === "PERMANENT") {
      for (const uuid of uuids) {
        const folder = await Folder.findOneAndDelete({
          uuid: uuid,
          user: user,
          trash: true,
        });
        const file = await File.findOneAndDelete({
          uuid: uuid,
          user: user,
          trash: true,
        });
        if (folder) {
          await fs.promises.rmdir(`storage/${user}/${uuid}`, {
            recursive: true,
          });
          await deleteFolderFoldersAndFiles(uuid, user, mode);
        }
        if (file) {
          const fileFolder = file.folder;
          const fileName = file.name;
          await fs.promises.rm(
            `storage/${user}${fileFolder ? `/${fileFolder}` : ""}/${fileName}`,
            {
              force: true,
            }
          );
        }
      }
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

export const recoverFolder = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const folder = await Folder.findOne({
      uuid: uuid,
      user: user,
      trash: true,
    });
    if (!folder) {
      res.json({
        error: true,
        message: "Folder not found",
      });
      return;
    }
    const folderName = await getRepeatedFolderName({
      parent: { $exists: false },
      user: user,
      name: folder.name,
      trash: false,
    });
    const hasParent = folder.parent;
    await Folder.updateOne(
      { uuid: uuid, user: user, trash: true },
      {
        ...(hasParent && { $unset: { parent: "" } }),
        name: folderName,
        trash: false,
      }
    );
    await recoverFolderFoldersAndFiles(uuid, user);
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

export const recoverFile = async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    const file = await File.findOne({ uuid: uuid, user: user, trash: true });
    if (!file) {
      res.json({
        error: true,
        message: "File not found",
      });
      return;
    }
    const fileName = await getRepeatedFileName({
      folder: { $exists: false },
      user: user,
      name: file.name,
      trash: false,
    });
    const hasFolder = file.folder;
    await File.updateOne(
      { uuid: uuid, user: user, trash: true },
      {
        ...(hasFolder && { $unset: { folder: "" } }),
        name: fileName,
        trash: false,
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

export const recoverFoldersAndFiles = async (req, res) => {
  const { uuids } = req.body;
  if (!uuids) {
    res.json({
      error: true,
      message: "Insufficient information",
    });
    return;
  }
  const isUUIDSValid = Array.isArray(uuids);
  if (!isUUIDSValid) {
    res.json({
      error: true,
      message: "Invalid information",
    });
    return;
  }
  try {
    const user = req.user.uuid;
    for (const uuid of uuids) {
      const folder = await Folder.findOne({
        uuid: uuid,
        user: user,
        trash: true,
      });
      const file = await File.findOne({ uuid: uuid, user: user, trash: true });
      if (folder) {
        const folderName = await getRepeatedFolderName({
          parent: { $exists: false },
          user: user,
          name: folder.name,
          trash: false,
        });
        const hasParent = folder.parent;
        await Folder.updateOne(
          { uuid: uuid, user: user, trash: true },
          {
            ...(hasParent && { $unset: { parent: "" } }),
            name: folderName,
            trash: false,
          }
        );
        await recoverFolderFoldersAndFiles(uuid, user);
      }
      if (file) {
        const fileName = await getRepeatedFileName({
          folder: { $exists: false },
          user: user,
          name: file.name,
          trash: false,
        });
        const hasFolder = file.folder;
        await File.updateOne(
          { uuid: uuid, user: user, trash: true },
          {
            ...(hasFolder && { $unset: { folder: "" } }),
            name: fileName,
            trash: false,
          }
        );
      }
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

export const emptyTrash = async (req, res) => {
  try {
    const user = req.user.uuid;
    const folders = await Folder.find({ user: user, trash: true });
    const files = await File.find({
      folder: { $exists: false },
      user: user,
      trash: true,
    });
    for (const folder of folders) {
      await Folder.deleteOne({ uuid: folder.uuid, user: user, trash: true });
      await fs.promises.rmdir(`storage/${user}/${folder.uuid}`, {
        recursive: true,
      });
    }
    for (const file of files) {
      await File.deleteOne({ uuid: file.uuid, user: user, trash: true });
      await fs.promises.rm(`storage/${user}/${file.name}`, { force: true });
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

const deleteFolderFoldersAndFiles = async (uuid, user, mode) => {
  const folders = await Folder.find({
    parent: uuid,
    user: user,
    trash: mode === "TRASH" ? false : mode === "PERMANENT" ? true : null,
  });
  const files = await File.find({
    folder: uuid,
    user: user,
    trash: mode === "TRASH" ? false : mode === "PERMANENT" ? true : null,
  });
  if (mode === "TRASH") {
    for (const folder of folders) {
      const folderUUID = folder.uuid;
      const childFolders = (
        await Folder.find({
          parent: folderUUID,
          user: user,
          trash: false,
        })
      ).map((childFolder) => childFolder.uuid);
      const folderName = await getRepeatedFolderName({
        parent: { $exists: false },
        user: user,
        name: folder.name,
        trash: true,
      });
      const hasParent = folder.parent;
      await Folder.updateOne(
        { uuid: folderUUID, user: user, trash: false },
        {
          ...(hasParent && { $unset: { parent: "" } }),
          name: folderName,
          trash: true,
        }
      );
      for (const childFolder of childFolders) {
        await deleteFolderFoldersAndFiles(childFolder, user, mode);
      }
    }
    for (const file of files) {
      const fileName = await getRepeatedFileName({
        folder: { $exists: false },
        user: user,
        name: file.name,
        trash: true,
      });
      const hasFolder = file.folder;
      await File.updateOne(
        { folder: file.uuid, user: user, trash: false },
        {
          ...(hasFolder && { $unset: { folder: "" } }),
          name: fileName,
          trash: true,
        }
      );
    }
  }
  if (mode === "PERMAMENT") {
    for (const folder of folders) {
      const childFolders = (
        await Folder.find({ parent: folder, user: user, trash: true })
      ).map((folder) => folder.uuid);
      await Folder.deleteOne({ uuid: folder, user: user, trash: true });
      await fs.promises.rmdir(`storage/${user}/${folder}`, {
        recursive: true,
      });
      for (const childFolder of childFolders) {
        await deleteFolderFoldersAndFiles(childFolder, user, mode);
      }
    }
    await File.deleteMany({ folder: uuid, user: user, trash: true });
  }
};

const recoverFolderFoldersAndFiles = async (uuid, user) => {
  const folders = await Folder.find({ parent: uuid, user: user, trash: true });
  const files = await File.find({ folder: uuid, user: user, trash: true });
  for (const folder of folders) {
    const folderUUID = folder.uuid;
    const childFolders = (
      await Folder.find({ parent: folderUUID, user: user, trash: true })
    ).map((childFolder) => childFolder.uuid);
    const folderName = await getRepeatedFolderName({
      parent: { $exists: false },
      user: user,
      name: folder.name,
      trash: false,
    });
    const hasParent = folder.parent;
    await Folder.updateOne(
      { uuid: folderUUID, user: user, trash: true },
      {
        ...(hasParent && { $unset: { parent: "" } }),
        name: folderName,
        trash: false,
      }
    );
    for (const childFolder of childFolders) {
      await recoverFolderFoldersAndFiles(childFolder, user);
    }
  }
  for (const file of files) {
    const fileName = await getRepeatedFileName({
      folder: { $exists: false },
      user: user,
      name: file.name,
      trash: false,
    });
    const hasFolder = file.folder;
    await File.updateOne(
      { uuid: file.uuid, user: user, trash: true },
      {
        ...(hasFolder && { $unset: { folder: "" } }),
        name: fileName,
        trash: false,
      }
    );
  }
};

const getRepeatedFolderName = async (params) => {
  const isFolderNameRepeated = await Folder.findOne(params);
  if (isFolderNameRepeated) {
    const folderName = params.name;
    const repeatedNumber =
      (!isNaN(parseInt(folderName.split("_")[1]))
        ? parseInt(folderName.split("_")[1])
        : 0) + 1;
    params.name = `${folderName.split("_")[0]}_${repeatedNumber}`;
    return getRepeatedFolderName(params);
  }
  return params.name;
};

const getRepeatedFileName = async (params) => {
  const isFileNameRepeated = await File.findOne(params);
  if (isFileNameRepeated) {
    const fileName = params.name;
    const repeatedNumber =
      (!isNaN(parseInt(fileName.split(".")[0].split("_")[1]))
        ? parseInt(fileName.split(".")[0].split("_")[1])
        : 0) + 1;
    params.name = `${fileName.split(".")[0].split("_")[0]}_${repeatedNumber}.${
      fileName.split(".")[1]
    }`;
    return getRepeatedFileName(params);
  }
  return params.name;
};
