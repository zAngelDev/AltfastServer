import Verification from "../models/Verification";
import RecoverPassword from "../models/RecoverPassword";
import EditEmailConfirm from "../models/EditEmailConfirm";
import EditPasswordConfirm from "../models/EditPasswordConfirm";
import nodemailer from "nodemailer";
import randomize from "randomatic";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, username) => {
  const code = generateRandomCode();
  await new Verification({ email: email, code: code }).save();
  await transporter.sendMail({
    from: "Altfast <info@altfast.net>",
    to: email,
    subject: "Verifify your account",
    html: getVerificationEmail(username, code),
  });
};

export const sendRecoverPasswordEmail = async (email, username) => {
  const code = generateRandomCode();
  await new RecoverPassword({ email: email, code: code }).save();
  await transporter.sendMail({
    from: "Altfast <info@altfast.net>",
    to: email,
    subject: "Recover your password",
    html: getRecoverPasswordEmail(username, code),
  });
};

export const sendEditEmailConfirmEmail = async (uuid, email, username) => {
  const code = generateRandomCode();
  await new EditEmailConfirm({ user: uuid, code: code, email: email }).save();
  await transporter.sendMail({
    from: "Altfast <info@altfast.net>",
    to: email,
    subject: "Confirm email change",
    html: getEditEmailConfirmEmail(username, code),
  });
};

export const sendEditPasswordConfirmEmail = async (
  uuid,
  email,
  password,
  username
) => {
  const code = generateRandomCode();
  await new EditPasswordConfirm({
    user: uuid,
    code: code,
    password: password,
  }).save();
  await transporter.sendMail({
    from: "Altfast <info@altfast.net>",
    to: email,
    subject: "Confirm password change",
    html: getEditPasswordConfirmEmail(username, code),
  });
};

const getVerificationEmail = (username, code) => {
  return `Hi <strong>${username}</strong>, to complete the activation of your account you must verify your email
  <br>
  <br>
  Your verification code is <strong>${code}</strong> which will expire in 10 minutes
  <br>
  <i>Do not share this code with anyone!</i>`;
};

const getRecoverPasswordEmail = (username, code) => {
  return `Hi <strong>${username}</strong>, to recover your password you must verify that it is you
  <br>
  <br>
  Your recover code is <strong>${code}</strong> which will expire in 10 minutes
  <br>
  <i>Do not share this code with anyone!</i>`;
};

const getEditEmailConfirmEmail = (username, code) => {
  return `Hi <strong>${username}</strong>, to confirm your email change you must verify that it is you
  <br>
  <br>
  Your confirmation code is <strong>${code}</strong> which will expire in 10 minutes
  <br>
  <i>Do not share this code with anyone!</i>`;
};

const getEditPasswordConfirmEmail = (username, code) => {
  return `Hi <strong>${username}</strong>, to confirm your password change you must verify that it is you
  <br>
  <br>
  Your confirmation code is <strong>${code}</strong> which will expire in 10 minutes
  <br>
  <i>Do not share this code with anyone!</i>`;
};

const generateRandomCode = () => {
  const code = randomize("*", 10);
  return code;
};
