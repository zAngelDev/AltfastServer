import { Router } from "express";
import * as filesController from "../controllers/files";

const filesRouter = Router();

filesRouter.post("/getFiles", filesController.getFiles);

filesRouter.post("/createFolder", filesController.createFolder);

filesRouter.post("/uploadFiles", filesController.uploadFiles);

filesRouter.post("/uploadFolder", filesController.uploadFolder);

filesRouter.post("/toggleFolderLink", filesController.toggleFolderLink);

filesRouter.post("/toggleFileLink", filesController.toggleFileLink);

filesRouter.post(
  "/disableFoldersAndFilesLinks",
  filesController.disableFoldersAndFilesLinks
);

filesRouter.post("/deleteFolder", filesController.deleteFolder);

filesRouter.post("/deleteFile", filesController.deleteFile);

filesRouter.post(
  "/deleteFoldersAndFiles",
  filesController.deleteFoldersAndFiles
);

filesRouter.post("/emptyTrash", filesController.emptyTrash);

filesRouter.post("/recoverFolder", filesController.recoverFolder);

filesRouter.post("/recoverFile", filesController.recoverFile);

filesRouter.post(
  "/recoverFoldersAndFiles",
  filesController.recoverFoldersAndFiles
);

export default filesRouter;
