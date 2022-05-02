import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import passport from "passport";
import "./handlers/auth";
import authRoute from "./routes/auth";
import usersRoute from "./routes/users";
import filesRoute from "./routes/files";
import adminRoute from "./routes/admin";

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV !== "development" ? "https://altfast.net" : "*",
  })
);
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(passport.initialize());

app.use("/auth", authRoute);

app.use("/users", usersRoute);

app.use("/files", filesRoute);

app.use("/admin", adminRoute);

export default app;
