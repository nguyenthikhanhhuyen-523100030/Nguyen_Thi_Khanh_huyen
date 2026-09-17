const mongoose = require("mongoose");

const donHangSchema = new mongoose.Schema({

    nguoiDungId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NguoiDung",
        required: true
    },

    hoTen: {
        type: String,
        required: true
    },

    soDienThoai: {
        type: String,
        required: true
    },

    diaChi: {
        type: String,
        required: true
    },

    ghiChu: {
        type: String,
        default: ""
    },

    phuongThucThanhToan: {
        type: String,
        enum: ["COD", "ChuyenKhoan"],
        default: "COD"
    },

    tongTien: {
        type: Number,
        required: true,
        min: 0
    },

    trangThai: {
        type: String,
        default: "Chờ xác nhận"
    },

    ngayDat: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "DonHang",
    donHangSchema
);