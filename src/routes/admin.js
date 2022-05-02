import { Router } from "express";
import * as adminController from "../controllers/admin";
import passport from "passport";

const adminRouter = Router();

adminRouter.get(
  "/getStats",
  passport.authenticate("jwt", { session: false }),
  adminController.getStats
);

adminRouter.post(
  "/createAnnouncement",
  passport.authenticate("jwt", { session: false }),
  adminController.createAnnouncement
);

adminRouter.post(
  "/editAnnouncement",
  passport.authenticate("jwt", { session: false }),
  adminController.editAnnouncement
);

adminRouter.post(
  "/deleteAnnouncement",
  passport.authenticate("jwt", { session: false }),
  adminController.deleteAnnouncement
);

export default adminRouter;
