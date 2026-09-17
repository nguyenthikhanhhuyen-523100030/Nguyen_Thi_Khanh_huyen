const mongoose = require("mongoose");

module.exports = function connect() {
    return mongoose.connect("mongodb://127.0.0.1:27017/banbanh");
};