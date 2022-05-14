import { Router } from "express";
import * as filesController from "../controllers/files";

const filesRouter = Router();

filesRouter.post("/getFolder", filesController.getFolder);

export default filesRouter;
