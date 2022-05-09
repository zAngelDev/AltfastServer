import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const UserSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid(),
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    passwordLenght: {
      type: Number,
      required: true,
    },
    plan: {
      type: String,
      default: "BASIC",
      required: true,
    },
    roles: {
      type: [String],
      default: ["USER"],
      required: true,
    },
    files: {
      type: Array,
      default: [],
    },
    verificated: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.passwordLenght = this.password.length;
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log(error);
  }
});

UserSchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  async function (next) {
    if (this._update?.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this._update.password, salt);
        this.passwordLenght = this._update.password.length;
        this._update.password = hashedPassword;
        next();
      } catch (error) {
        console.log(error);
      }
    }
  }
);

UserSchema.methods.isPasswordValid = async function (password) {
  try {
    const isPasswordValid = await bcrypt.compare(password, this.password);
    return isPasswordValid;
  } catch (error) {
    console.log(error);
  }
};

export default model("Users", UserSchema, "users");
