import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const ReportSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid,
    },
    file: {
      type: String,
      required: true,
    },
    user: {
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

export default model("Report", ReportSchema, "reports");
