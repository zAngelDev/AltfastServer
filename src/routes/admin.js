import { Router } from "express";
import * as adminController from "../controllers/admin";
import passport from "passport";

const adminRouter = Router();

adminRouter.post(
  "/getStats",
  passport.authenticate("jwt", { session: false }),
  adminController.getStats
);

export default adminRouter;
