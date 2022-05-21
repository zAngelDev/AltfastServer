import { Router } from "express";
import * as adminController from "../controllers/admin";

const adminRouter = Router();

adminRouter.post("/getUsers", adminController.getUsers);

adminRouter.post("/getUser", adminController.getUser);

adminRouter.get("/getStats", adminController.getStats);

adminRouter.post("/getPayments", adminController.getPayments);

adminRouter.post("/searchUsers", adminController.searchUsers);

adminRouter.post("/editUser", adminController.editUser);

adminRouter.post("/deleteUser", adminController.deleteUser);

adminRouter.post("/createAnnouncement", adminController.createAnnouncement);

adminRouter.post("/editAnnouncement", adminController.editAnnouncement);

adminRouter.post("/deleteAnnouncement", adminController.deleteAnnouncement);

adminRouter.post("/completePayment", adminController.completePayment);

adminRouter.post("/deletePayment", adminController.deletePayment);

export default adminRouter;
