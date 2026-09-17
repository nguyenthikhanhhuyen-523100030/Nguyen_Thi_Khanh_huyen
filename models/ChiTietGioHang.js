const mongoose = require("mongoose");

const chiTietGioHangSchema = new mongoose.Schema({

    gioHangId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GioHang",
        required: true
    },

    sanPhamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SanPham",
        required: true
    },

    soLuong: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

    donGia: {
        type: Number,
        required: true,
        min: 0
    }

});

module.exports = mongoose.model(
    "ChiTietGioHang",
    chiTietGioHangSchema
);