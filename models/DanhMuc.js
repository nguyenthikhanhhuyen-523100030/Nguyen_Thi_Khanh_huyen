const mongoose = require("mongoose");

const danhMucSchema = new mongoose.Schema({
    tenDanhMuc: {
        type: String,
        required: true
    },
  hinhAnh: {
        type: String,
        default: ""
    },
    moTa: {
        type: String,
        default: ""
    },

    trangThai: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("DanhMuc", danhMucSchema);