const mongoose = require("mongoose");

const nguoiDungSchema = new mongoose.Schema({
    hoTen: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    matKhau: {
        type: String,
        required: true
    },

    soDienThoai: {
        type: String,
        default: ""
    },

    diaChi: {
        type: String,
        default: ""
    },

    vaiTro: {
        type: String,
        enum: ["khachhang", "quantri"],
        default: "khachhang"
    },

    trangThai: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("NguoiDung", nguoiDungSchema);