import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const PaymentSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid(),
      required: true,
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
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Payments", PaymentSchema, "payments");
