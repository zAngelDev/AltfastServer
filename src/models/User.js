import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const UserSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid,
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
    passwordLength: {
      type: Number,
    },
    plan: {
      type: String,
      default: "BASIC",
    },
    roles: {
      type: [String],
      default: ["USER"],
    },
    balance: {
      type: Number,
      default: 0,
    },
    paymentMethods: {
      type: Object,
      default: {},
    },
    files: {
      type: Array,
      default: [],
    },
    verificated: {
      type: Boolean,
      default: false,
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
    this.passwordLength = this.password.length;
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
        this._update.passwordLength = this._update.password.length;
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
