import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const EditPasswordConfirmSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: "10m" },
    },
  },
  {
    versionKey: false,
  }
);

EditPasswordConfirmSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(this.code, salt);
    this.code = hashedCode;
    next();
  } catch (error) {
    console.log(error);
  }
});

EditPasswordConfirmSchema.methods.isCodeValid = async function (code) {
  try {
    const isCodeValid = await bcrypt.compare(code, this.code);
    return isCodeValid;
  } catch (error) {
    console.log(error);
  }
};

export default model("EditPasswordConfirms", EditPasswordConfirmSchema);
