import { Router } from "express";
import * as filesController from "../controllers/files";
import passport from "passport";

const filesRouter = Router();

filesRouter.post(
  "/getFolder",
  passport.authenticate("jwt", { session: false }),
  filesController.getFolder
);

export default filesRouter;
