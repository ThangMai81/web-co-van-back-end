const { Schema, model } = require("mongoose");

const inquirySchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    concern: {
      type: String,
      required: true,
      enum: [
        "tim_lai_chinh_minh",
        "chua_lanh_ton_thuong",
        "vuot_qua_bat_luc",
        "dinh_huong_muc_tieu",
        "lam_cha_me_tot_hon",
        "su_nghiep_be_tac",
        "khac",
      ],
    },
    concernDetail: { type: String, trim: true, default: "" },
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true },
);

module.exports = model("Inquiry", inquirySchema);
