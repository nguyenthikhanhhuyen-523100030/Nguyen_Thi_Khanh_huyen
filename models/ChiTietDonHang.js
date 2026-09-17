const mongoose = require("mongoose");

const chiTietDonHangSchema = new mongoose.Schema({

    donHangId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DonHang",
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
        min: 1
    },

    donGia: {
        type: Number,
        required: true,
        min: 0
    },

    thanhTien: {
        type: Number,
        required: true,
        min: 0
    }

});

module.exports = mongoose.model(
    "ChiTietDonHang",
    chiTietDonHangSchema
);