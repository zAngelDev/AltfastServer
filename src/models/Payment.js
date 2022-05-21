import { Schema, model } from "mongoose";
import { generateRandomId } from "../utils/utils";

const PaymentSchema = new Schema(
  {
    id: {
      type: String,
      default: () => generateRandomId(15),
    },
    user: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Payments", PaymentSchema, "payments");
