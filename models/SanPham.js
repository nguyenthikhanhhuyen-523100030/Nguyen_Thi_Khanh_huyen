const mongoose = require("mongoose");

const sanPhamSchema = new mongoose.Schema({
    tenSanPham: {
        type: String,
        required: true
    },

    danhMucId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DanhMuc",
        required: true
    },

    gia: {
        type: Number,
        required: true,
        min: 0
    },

    moTa: {
        type: String,
        default: ""
    },

    hinhAnh: {
        type: String,
        default: ""
    },

    trangThai: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("SanPham", sanPhamSchema);