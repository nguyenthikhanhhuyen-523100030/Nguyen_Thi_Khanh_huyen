const mongoose = require("mongoose");

const gioHangSchema = new mongoose.Schema({

    nguoiDungId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NguoiDung",
        required: true,
        unique: true
    },

    trangThai: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "GioHang",
    gioHangSchema
);