import { Router } from "express";
import * as adminController from "../controllers/admin";

const adminRouter = Router();

adminRouter.post("/getUsers", adminController.getUsers);

adminRouter.post("/getUser", adminController.getUser);

adminRouter.get("/getStats", adminController.getStats);

adminRouter.post("/searchUsers", adminController.searchUsers);

adminRouter.post("/editUser", adminController.editUser);

adminRouter.post("/deleteUser", adminController.deleteUser);

adminRouter.post("/createAnnouncement", adminController.createAnnouncement);

adminRouter.post("/editAnnouncement", adminController.editAnnouncement);

adminRouter.post("/deleteAnnouncement", adminController.deleteAnnouncement);

export default adminRouter;
