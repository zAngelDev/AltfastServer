import { Router } from "express";
import * as authController from "../controllers/auth";
import passport from "passport";

const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/verificate", authController.verificate);

authRouter.post("/recoverPassword", authController.recoverPassword);

authRouter.post(
  "/recoverPassword/changePassword",
  authController.changePassword
);

authRouter.post(
  "/resendVerificationEmail",
  authController.resendVerificationEmail
);

authRouter.post("/checkAuthToken", authController.checkAuthToken);

authRouter.post(
  "/checkAccess",
  passport.authenticate("jwt", { session: false }),
  authController.checkAccess
);

authRouter.get(
  "/checkStaff",
  passport.authenticate("jwt", { session: false }),
  authController.checkStaff
);

authRouter.get(
  "/checkAdmin",
  passport.authenticate("jwt", { session: false }),
  authController.checkAdmin
);

export default authRouter;
