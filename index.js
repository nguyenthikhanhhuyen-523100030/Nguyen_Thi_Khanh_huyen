const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const NguoiDung = require("./models/nguoidung");
const SanPham = require("./models/SanPham");
const DanhMuc = require("./models/DanhMuc");
const GioHang = require("./models/GioHang");
const ChiTietGioHang = require("./models/ChiTietGioHang");
const DonHang = require("./models/DonHang");
const ChiTietDonHang = require("./models/ChiTietDonHang");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

console.log("FILE ĐANG CHẠY:", __filename);


// =============================
// DEBUG TẤT CẢ REQUEST
// =============================
console.log("=== SERVER SWEETIE MỚI ===");

app.use((req, res, next) => {
    console.log(
        ">>> REQUEST NHẬN ĐƯỢC:",
        req.method,
        req.url
    );
    next();
});

// =============================
// PUBLIC
// =============================
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =============================
// MONGODB
// =============================
mongoose.connect(
    "mongodb://127.0.0.1:27017/banbanh"
)
.then(() => {
    console.log(
        "Kết nối MongoDB thành công"
    );
})
.catch((err) => {
    console.log(
        "Lỗi kết nối MongoDB:",
        err
    );
});


// EJS
app.set("view engine", "ejs");


// FORM
app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


// SESSION
app.use(
    session({
        secret: "banbanh-secret",
        resave: false,
        saveUninitialized: false
    })
);
// ================= UPLOAD ẢNH DANH MỤC =================

const thuMucUploadDanhMuc = path.join(
    __dirname,
    "public",
    "uploads",
    "danh-muc"
);

// Tự tạo thư mục nếu chưa có
if (!fs.existsSync(thuMucUploadDanhMuc)) {
    fs.mkdirSync(thuMucUploadDanhMuc, {
        recursive: true
    });
}

const storageDanhMuc = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, thuMucUploadDanhMuc);
    },

    filename: function (req, file, cb) {

        const tenFile =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, tenFile);
    }

});

const uploadDanhMuc = multer({

    storage: storageDanhMuc,

    fileFilter: function (req, file, cb) {

        const loaiAnhChoPhep = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (loaiAnhChoPhep.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Chỉ được tải ảnh JPG, PNG hoặc WEBP"
                )
            );
        }
    },

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});
// =============================
// UPLOAD ẢNH SẢN PHẨM
// =============================

const thuMucUploadSanPham = path.join(
    __dirname,
    "public",
    "uploads",
    "san-pham"
);

if (!fs.existsSync(thuMucUploadSanPham)) {
    fs.mkdirSync(thuMucUploadSanPham, {
        recursive: true
    });
}

const storageSanPham = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, thuMucUploadSanPham);
    },

    filename: function (req, file, cb) {
        const tenFile =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, tenFile);
    }
});

const uploadSanPham = multer({
    storage: storageSanPham,

    fileFilter: function (req, file, cb) {
        const loaiAnhChoPhep = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (loaiAnhChoPhep.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Chỉ được tải ảnh JPG, PNG hoặc WEBP"
                )
            );
        }
    },

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Đưa người dùng đang đăng nhập vào tất cả file EJS
app.use((req, res, next) => {
    res.locals.nguoiDung = req.session.nguoiDung || null;
    next();
});


// ROUTE KIỂM TRA
app.get("/kiem-tra-route", (req, res) => {
    res.send("ROUTE HOẠT ĐỘNG");
});


// TEST SESSION
app.get("/test-session", (req, res) => {
    res.json({
        sessionID: req.sessionID,
        nguoiDung: req.session.nguoiDung || null
    });
});
// Trang chủ
app.get("/", async (req, res) => {
    try {

        const sanPhams = await SanPham
            .find({ trangThai: true })
            .populate("danhMucId");

        const danhMucs = await DanhMuc.find({
            trangThai: true
        });

        res.render("trangchu", {
            sanPhams,
            danhMucs,
            nguoiDung: req.session.nguoiDung || null
        });

    } catch (error) {
        console.log(error);
        res.send("Có lỗi khi tải trang chủ");
    }
});
//KIỂM TRA QUẢN TRỊ
function kiemTraQuanTri(req, res, next) {
    if (
        !req.session.nguoiDung ||
        req.session.nguoiDung.vaiTro !== "quantri"
    ) {
        return res.redirect("/dang-nhap");
    }

    next();
}
//QUẢN TRỊ
app.get(
    "/quan-tri",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            console.log("Đang tải trang quản trị...");

            const soSanPham =
                await SanPham.countDocuments();

            console.log(
                "Số sản phẩm:",
                soSanPham
            );


            const soDonHang =
                await DonHang.countDocuments();

            console.log(
                "Số đơn hàng:",
                soDonHang
            );


            const soKhachHang =
                await NguoiDung.countDocuments({
                    vaiTro: "khachhang"
                });

            console.log(
                "Số khách hàng:",
                soKhachHang
            );


            const donHangGanDay =
                await DonHang
                    .find()
                    .sort({
                        ngayDat: -1
                    })
                    .limit(5);

            console.log(
                "Đơn hàng gần đây:",
                donHangGanDay.length
            );


            res.render("quantri/quantri", {

                nguoiDung:
                    req.session.nguoiDung,

                soSanPham:
                    soSanPham,

                soDonHang:
                    soDonHang,

                soKhachHang:
                    soKhachHang,

                donHangGanDay:
                    donHangGanDay

            });

        } catch (error) {

    console.log("LỖI TRANG QUẢN TRỊ:");
    console.log(error);

    res.send(`
        <h2>Lỗi trang quản trị</h2>
        <pre>${error.message}</pre>
    `);
}
    }
);

// ===========================
// ĐĂNG KÝ
// ===========================

app.get("/dang-ky", (req, res) => {
    res.render("dangky", {
        thongBao: ""
    });
});

app.post("/dang-ky", async (req, res) => {
    try {
        const {
            hoTen,
            email,
            matKhau,
            soDienThoai,
            diaChi
        } = req.body;

        // Kiểm tra dữ liệu
        if (!hoTen || !email || !matKhau) {
            return res.render("dangky", {
                thongBao: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu"
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const nguoiDungTonTai = await NguoiDung.findOne({
            email: email
        });

        if (nguoiDungTonTai) {
            return res.render("dangky", {
                thongBao: "Email này đã được sử dụng"
            });
        }

        // Mã hóa mật khẩu
        const matKhauMaHoa = await bcrypt.hash(matKhau, 10);

        // Tạo người dùng
        await NguoiDung.create({
            hoTen: hoTen,
            email: email,
            matKhau: matKhauMaHoa,
            soDienThoai: soDienThoai,
            diaChi: diaChi,
            vaiTro: "khachhang",
            trangThai: true
        });

        console.log("Đăng ký thành công:", email);

        res.redirect("/dang-nhap");

    } catch (error) {
        console.log(error);

        res.render("dangky", {
            thongBao: "Có lỗi xảy ra khi đăng ký"
        });
    }
});

// ===========================
// ĐĂNG NHẬP
// ===========================

app.get("/dang-nhap", (req, res) => {
    res.render("dangnhap", {
        thongBao: ""
    });
});

app.post("/dang-nhap", async (req, res) => {
    try {
        const {
            email,
            matKhau
        } = req.body;

        // Tìm người dùng theo email
        const nguoiDung = await NguoiDung.findOne({
            email: email
        });

        if (!nguoiDung) {
            return res.render("dangnhap", {
                thongBao: "Email không tồn tại"
            });
        }

        // Kiểm tra trạng thái
        if (nguoiDung.trangThai === false) {
            return res.render("dangnhap", {
                thongBao: "Tài khoản đã bị khóa"
            });
        }

        // So sánh mật khẩu
        const dungMatKhau = await bcrypt.compare(
            matKhau,
            nguoiDung.matKhau
        );

        if (!dungMatKhau) {
            return res.render("dangnhap", {
                thongBao: "Mật khẩu không đúng"
            });
        }

        // Lưu thông tin đăng nhập vào session
req.session.nguoiDung = {
    id: nguoiDung._id,
    hoTen: nguoiDung.hoTen,
    email: nguoiDung.email,
    vaiTro: nguoiDung.vaiTro
};

req.session.save((err) => {
    if (err) {
        console.log("Lỗi lưu session:", err);
        return res.send("Có lỗi khi lưu phiên đăng nhập");
    }

    if (nguoiDung.vaiTro === "quantri") {
        return res.redirect("/quan-tri");
    }

    return res.redirect("/");
});

    } catch (error) {
        console.log(error);

        res.render("dangnhap", {
            thongBao: "Có lỗi xảy ra khi đăng nhập"
        });
    }
});

// ===========================
// ĐĂNG XUẤT
// ===========================

app.get("/dang-xuat", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/dang-nhap");
    });
});


//TRANG CHỦ


// DANH SÁCH SẢN PHẨM
app.get("/san-pham", async (req, res) => {

    try {

        const tuKhoa = req.query.tuKhoa || "";
        const danhMuc = req.query.danhMuc || "";

        let dieuKien = {
            trangThai: true
        };

        if (tuKhoa) {

            dieuKien.tenSanPham = {
                $regex: tuKhoa,
                $options: "i"
            };

        }

        if (danhMuc) {

            dieuKien.danhMucId = danhMuc;

        }

        const sanPhams = await SanPham
            .find(dieuKien)
            .populate("danhMucId");

        const danhMucs = await DanhMuc.find({
            trangThai: true
        });

        res.render("sanpham", {

            sanPhams,
            danhMucs,
            tuKhoa,
            danhMuc

        });

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi tải sản phẩm");

    }

});
// CHI TIẾT SẢN PHẨM
app.get("/san-pham/:id", async (req, res) => {
    try {
        const sanPham = await SanPham
            .findById(req.params.id)
            .populate("danhMucId");

        if (!sanPham) {
            return res.send("Không tìm thấy sản phẩm");
        }

        res.render("chitietsanpham", {
            sanPham
        });

    } catch (error) {
        console.log(error);
        res.send("Có lỗi khi tải chi tiết sản phẩm");
    }
});
//DANH MỤC

app.get("/danh-muc", async (req, res) => {
    try {

        const danhMucs = await DanhMuc.find({
            trangThai: true
        });

        res.render("danhmuc", {
            danhMucs
        });

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi tải danh mục");

    }
});
//

// =========================
// GIỎ HÀNG
// =========================

// HIỂN THỊ GIỎ HÀNG
app.get("/gio-hang", async (req, res) => {
    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        let gioHang = await GioHang.findOne({
            nguoiDungId: req.session.nguoiDung.id
        });

        // Nếu chưa có giỏ hàng thì tạo mới
        if (!gioHang) {
            gioHang = await GioHang.create({
                nguoiDungId: req.session.nguoiDung.id
            });
        }

        // Lấy chi tiết giỏ hàng
        const chiTiet = await ChiTietGioHang
            .find({
                gioHangId: gioHang._id
            })
            .populate("sanPhamId");

        // Tính tổng tiền
        const tongTien = chiTiet.reduce(
            (tong, item) => {
                return tong + item.donGia * item.soLuong;
            },
            0
        );

        res.render("giohang", {
            chiTiet,
            tongTien
        });

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi tải giỏ hàng");
    }
});


// =========================
// THÊM SẢN PHẨM VÀO GIỎ
// =========================
// =========================
// KHÁCH HÀNG - THÊM SẢN PHẨM VÀO GIỎ
// =========================
app.post("/gio-hang/them/:id", async (req, res) => {
    console.log(">>> ĐÃ VÀO ROUTE THÊM GIỎ <<<");

        try {

            if (!req.session.nguoiDung) {
                return res.redirect("/dang-nhap");
            }

            const sanPham = await SanPham.findById(
                req.params.id
            );

            if (!sanPham) {
                return res.send(
                    "Không tìm thấy sản phẩm"
                );
            }

            let gioHang = await GioHang.findOne({
                nguoiDungId:
                    req.session.nguoiDung.id
            });

            if (!gioHang) {

                gioHang = await GioHang.create({
                    nguoiDungId:
                        req.session.nguoiDung.id,

                    trangThai: true
                });
            }

            const soLuongThem = Math.max(
                1,
                Number(req.body.soLuong || 1)
            );

            const item =
                await ChiTietGioHang.findOne({

                    gioHangId: gioHang._id,

                    sanPhamId: sanPham._id
                });

            if (item) {

                item.soLuong += soLuongThem;

                await item.save();

            } else {

                await ChiTietGioHang.create({

                    gioHangId:
                        gioHang._id,

                    sanPhamId:
                        sanPham._id,

                    soLuong:
                        soLuongThem,

                    donGia:
                        sanPham.gia
                });
            }

            res.redirect("/gio-hang");

       } catch (error) {

    console.log("========== LỖI GIỎ HÀNG ==========");
    console.log(error);
    console.log("MESSAGE:", error.message);

    res.send(`
        <h2>Lỗi thêm sản phẩm vào giỏ</h2>
        <p><b>${error.message}</b></p>
        <pre>${error.stack}</pre>
    `);
}
    }
);
// =========================
// CẬP NHẬT SỐ LƯỢNG
// =========================
app.post("/gio-hang/cap-nhat/:id", async (req, res) => {

    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        const soLuong = Math.max(
            1,
            Number(req.body.soLuong || 1)
        );

        await ChiTietGioHang.findByIdAndUpdate(
            req.params.id,
            {
                soLuong: soLuong
            }
        );

        res.redirect("/gio-hang");

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi cập nhật giỏ hàng");

    }

});


// =========================
// XÓA SẢN PHẨM KHỎI GIỎ
// =========================
app.post("/gio-hang/xoa/:id", async (req, res) => {

    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        await ChiTietGioHang.findByIdAndDelete(
            req.params.id
        );

        res.redirect("/gio-hang");

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi xóa sản phẩm");

    }

});
//ĐẶT HÀNG
app.get("/dat-hang", async (req, res) => {
    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        const gioHang = await GioHang.findOne({
            nguoiDungId: req.session.nguoiDung.id
        });

        if (!gioHang) {
            return res.redirect("/gio-hang");
        }

        const chiTiet = await ChiTietGioHang
            .find({
                gioHangId: gioHang._id
            })
            .populate("sanPhamId");

        if (chiTiet.length === 0) {
            return res.redirect("/gio-hang");
        }

        const tongTien = chiTiet.reduce(
            (tong, item) => {
                return tong + item.donGia * item.soLuong;
            },
            0
        );

        res.render("dathang", {
            chiTiet,
            tongTien
        });

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi tải trang đặt hàng");

    }
});
//XỬ LÝ ĐẶT HÀNG
app.post("/dat-hang", async (req, res) => {
    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        const {
            hoTen,
            soDienThoai,
            diaChi,
            ghiChu,
            phuongThucThanhToan
        } = req.body;


        if (!hoTen || !soDienThoai || !diaChi) {

            return res.send(
                "Vui lòng nhập đầy đủ thông tin nhận hàng"
            );

        }


        const gioHang = await GioHang.findOne({
            nguoiDungId: req.session.nguoiDung.id
        });


        if (!gioHang) {
            return res.redirect("/gio-hang");
        }


        const chiTiet = await ChiTietGioHang
            .find({
                gioHangId: gioHang._id
            })
            .populate("sanPhamId");


        if (chiTiet.length === 0) {
            return res.redirect("/gio-hang");
        }


        const tongTien = chiTiet.reduce(
            (tong, item) => {
                return tong + item.donGia * item.soLuong;
            },
            0
        );


        const donHang = await DonHang.create({

            nguoiDungId:
                req.session.nguoiDung.id,

            hoTen: hoTen,

            soDienThoai: soDienThoai,

            diaChi: diaChi,

            ghiChu: ghiChu,

            phuongThucThanhToan:
                phuongThucThanhToan || "COD",

            tongTien: tongTien,

            trangThai: "Chờ xác nhận"

        });


        const chiTietDonHang = chiTiet.map(
            item => {

                return {

                    donHangId: donHang._id,

                    sanPhamId:
                        item.sanPhamId._id,

                    soLuong:
                        item.soLuong,

                    donGia:
                        item.donGia,

                    thanhTien:
                        item.donGia *
                        item.soLuong

                };

            }
        );


        await ChiTietDonHang.insertMany(
            chiTietDonHang
        );


        // Xóa sản phẩm trong giỏ sau khi đặt hàng
        await ChiTietGioHang.deleteMany({
            gioHangId: gioHang._id
        });


       res.redirect("/don-hang");

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi đặt hàng");

    }
});

// =========================
// KHÁCH HÀNG - XEM CHI TIẾT ĐƠN HÀNG
// =========================
app.get("/don-hang/:id", async (req, res) => {
    console.log("===== ĐÃ VÀO CHI TIẾT ĐƠN HÀNG =====");
    console.log("ID đơn hàng:", req.params.id);
    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        const donHang = await DonHang.findOne({
            _id: req.params.id,
            nguoiDungId: req.session.nguoiDung.id
        });

        if (!donHang) {
            return res.send(
                "Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này"
            );
        }

        const chiTietDonHang = await ChiTietDonHang
            .find({
                donHangId: donHang._id
            })
            .populate("sanPhamId");

        res.render("chitietdonhangkhach", {
            donHang,
            chiTietDonHang
        });

    } catch (error) {

        console.log("LỖI CHI TIẾT ĐƠN HÀNG KHÁCH HÀNG:");
        console.log(error);

        res.send(
            "Có lỗi khi tải chi tiết đơn hàng"
        );
    }
});

// =========================
// XEM ĐƠN HÀNG CỦA KHÁCH HÀNG
// =========================
app.get("/don-hang", async (req, res) => {
    try {

        if (!req.session.nguoiDung) {
            return res.redirect("/dang-nhap");
        }

        const donHangs = await DonHang
            .find({
                nguoiDungId: req.session.nguoiDung.id
            })
            .sort({
                ngayDat: -1
            });

        res.render("donhang", {
            donHangs
        });

    } catch (error) {

        console.log(error);

        res.send("Có lỗi khi tải đơn hàng");

    }
});

//QUẢN LÝ SẢN PHẨM
app.get(
    "/quan-tri/san-pham",
    kiemTraQuanTri,
    async (req, res) => {
        try {
            const tuKhoa = req.query.tuKhoa || "";
            const danhMuc = req.query.danhMuc || "";

            const dieuKien = {};

            if (tuKhoa) {
                dieuKien.tenSanPham = {
                    $regex: tuKhoa,
                    $options: "i"
                };
            }

            if (danhMuc) {
                dieuKien.danhMucId = danhMuc;
            }

            const sanPhams = await SanPham
                .find(dieuKien)
                .populate("danhMucId")
                .sort({ createdAt: -1 });

            const danhMucs = await DanhMuc.find();

            res.render("quantri/quantrisanpham", {
                nguoiDung: req.session.nguoiDung,
                sanPhams,
                danhMucs,
                tuKhoa,
                danhMuc
            });

        } catch (error) {
            console.log(error);
            res.send("Có lỗi khi tải quản lý sản phẩm");
        }
    }
);
//QUẢN TRỊ XÓA SẢN PHẨM
app.post(
    "/quan-tri/san-pham/xoa/:id",
    kiemTraQuanTri,
    async (req, res) => {
        try {
            await SanPham.findByIdAndDelete(req.params.id);

            res.redirect("/quan-tri/san-pham");

        } catch (error) {
            console.log(error);
            res.send("Có lỗi khi xóa sản phẩm");
        }
    }
);
// =========================
// QUẢN TRỊ - MỞ TRANG THÊM SẢN PHẨM
// =========================
// =========================
// QUẢN TRỊ - MỞ TRANG THÊM SẢN PHẨM
// =========================
app.get(
    "/quan-tri/san-pham/them",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            const danhMucs = await DanhMuc.find({
                trangThai: true
            });

            console.log("ĐÃ VÀO ROUTE THÊM SẢN PHẨM");
            console.log("Số danh mục:", danhMucs.length);

            res.render("quantri/themsanpham", {
                danhMucs,
                nguoiDung: req.session.nguoiDung
            });

        } catch (error) {

            console.log("LỖI ROUTE THÊM SẢN PHẨM:");
            console.log(error);

            res.send(`
                <h2>Lỗi</h2>
                <pre>${error.stack}</pre>
            `);
        }
    }
);


// =========================
// QUẢN TRỊ - XỬ LÝ THÊM SẢN PHẨM
// =========================
app.post(
    "/quan-tri/san-pham/them",
    kiemTraQuanTri,

    function (req, res, next) {
        uploadSanPham.single("hinhAnh")(
            req,
            res,
            function (err) {
                if (err) {
                    console.error(
                        "LỖI UPLOAD ẢNH SẢN PHẨM:",
                        err
                    );

                    return res.status(500).send(
                        "Lỗi upload ảnh: " + err.message
                    );
                }

                next();
            }
        );
    },

    async (req, res) => {
        try {
            console.log("===== THÊM SẢN PHẨM =====");
            console.log("BODY:", req.body);
            console.log("FILE:", req.file);

            const {
                tenSanPham,
                gia,
                moTa,
                danhMucId
            } = req.body;

            let hinhAnh = "";

            if (req.file) {
                hinhAnh =
                    "/uploads/san-pham/" +
                    req.file.filename;
            }

            console.log("ẢNH SẢN PHẨM:", hinhAnh);

            await SanPham.create({
                tenSanPham: tenSanPham.trim(),
                gia: Number(gia),
                moTa: moTa ? moTa.trim() : "",
                danhMucId,
                hinhAnh,
                trangThai: true
            });

            res.redirect("/quan-tri/san-pham");

        } catch (error) {
            console.error(
                "LỖI THÊM SẢN PHẨM:",
                error
            );

            res.status(500).send(
                "Có lỗi khi thêm sản phẩm: " +
                error.message
            );
        }
    }
);
//QUẢN TRỊ SỬA SẢN PHẨM
app.get(
    "/quan-tri/san-pham/sua/:id",
    kiemTraQuanTri,
    async (req, res) => {
        try {
            const sanPham = await SanPham.findById(req.params.id);

            const danhMucs = await DanhMuc.find({
                trangThai: true
            });

            if (!sanPham) {
                return res.send("Không tìm thấy sản phẩm");
            }

            res.render("quantri/suasanpham", {
                sanPham,
                danhMucs
            });

        } catch (error) {
            console.log(error);
            res.send("Có lỗi khi mở trang sửa sản phẩm");
        }
    }
);
app.post(
    "/quan-tri/san-pham/sua/:id",
    kiemTraQuanTri,

    // Upload ảnh
    function (req, res, next) {
        uploadSanPham.single("hinhAnh")(
            req,
            res,
            function (err) {
                if (err) {
                    console.error("LỖI UPLOAD ẢNH:", err);

                    return res.status(500).send(
                        "Lỗi upload ảnh: " + err.message
                    );
                }

                next();
            }
        );
    },

    async (req, res) => {
        try {
            console.log("================================");
            console.log("===== SỬA SẢN PHẨM =====");
            console.log("ID:", req.params.id);
            console.log("BODY:", req.body);
            console.log("FILE:", req.file);

            const sanPham = await SanPham.findById(
                req.params.id
            );

            if (!sanPham) {
                return res.status(404).send(
                    "Không tìm thấy sản phẩm"
                );
            }

            // ==========================
            // KIỂM TRA DỮ LIỆU
            // ==========================

            if (
                !req.body.tenSanPham ||
                !req.body.tenSanPham.trim()
            ) {
                return res.status(400).send(
                    "Tên sản phẩm không được để trống"
                );
            }

            if (!req.body.danhMucId) {
                return res.status(400).send(
                    "Vui lòng chọn danh mục"
                );
            }

            if (
                req.body.gia === undefined ||
                req.body.gia === "" ||
                isNaN(Number(req.body.gia))
            ) {
                return res.status(400).send(
                    "Giá sản phẩm không hợp lệ"
                );
            }

            // ==========================
            // CẬP NHẬT THÔNG TIN
            // ==========================

            sanPham.tenSanPham =
                req.body.tenSanPham.trim();

            sanPham.danhMucId =
                req.body.danhMucId;

            sanPham.gia =
                Number(req.body.gia);

            sanPham.moTa =
                req.body.moTa
                    ? req.body.moTa.trim()
                    : "";

            sanPham.trangThai =
                req.body.trangThai === "true";

            // ==========================
            // CẬP NHẬT ẢNH
            // ==========================

            // Nếu chọn ảnh mới -> thay ảnh
            // Nếu không chọn -> giữ nguyên ảnh cũ
            if (req.file) {
                sanPham.hinhAnh =
                    "/uploads/san-pham/" +
                    req.file.filename;

                console.log(
                    "ẢNH MỚI:",
                    sanPham.hinhAnh
                );
            } else {
                console.log(
                    "KHÔNG CHỌN ẢNH MỚI"
                );

                console.log(
                    "GIỮ ẢNH CŨ:",
                    sanPham.hinhAnh
                );
            }

            // ==========================
            // LƯU MONGODB
            // ==========================

            await sanPham.save();

            console.log(
                "CẬP NHẬT SẢN PHẨM THÀNH CÔNG"
            );

            console.log(
                "SẢN PHẨM:",
                sanPham
            );

            return res.redirect(
                "/quan-tri/san-pham"
            );

        } catch (error) {
            console.error(
                "================================"
            );

            console.error(
                "===== LỖI CẬP NHẬT SẢN PHẨM ====="
            );

            console.error(error);

            return res.status(500).send(
                "Có lỗi khi cập nhật sản phẩm: " +
                error.message
            );
        }
    }
);
// =========================
// QUẢN TRỊ ĐƠN HÀNG
// =========================
app.get(
    "/quan-tri/don-hang",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            const tuKhoa = req.query.tuKhoa || "";
            const trangThai = req.query.trangThai || "";

            const dieuKien = {};

            if (tuKhoa) {
                dieuKien.hoTen = {
                    $regex: tuKhoa,
                    $options: "i"
                };
            }

            if (trangThai) {
                dieuKien.trangThai = trangThai;
            }

            const donHangs = await DonHang
                .find(dieuKien)
                .sort({
                    ngayDat: -1
                });

            res.render("quantri/quantridonhang", {
                nguoiDung: req.session.nguoiDung,
                donHangs,
                tuKhoa,
                trangThai
            });

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi tải quản lý đơn hàng"
            );
        }
    }
);


// =========================
// MỞ TRANG SỬA TRẠNG THÁI ĐƠN HÀNG
// =========================
app.get(
    "/quan-tri/don-hang/sua/:id",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            const donHang = await DonHang.findById(
                req.params.id
            );

            if (!donHang) {
                return res.send(
                    "Không tìm thấy đơn hàng"
                );
            }

            res.render("quantri/suadonhang", {
                donHang,
                nguoiDung: req.session.nguoiDung
            });

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi tải đơn hàng"
            );
        }
    }
);


// =========================
// LƯU TRẠNG THÁI ĐƠN HÀNG
// =========================
app.post(
    "/quan-tri/don-hang/sua/:id",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            await DonHang.findByIdAndUpdate(
                req.params.id,
                {
                    trangThai: req.body.trangThai
                }
            );

            res.redirect(
                "/quan-tri/don-hang"
            );

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi cập nhật đơn hàng"
            );
        }
    }
);


// =========================
// XEM CHI TIẾT ĐƠN HÀNG
// =========================
app.get(
    "/quan-tri/don-hang/:id",
    kiemTraQuanTri,
    async (req, res) => {
        try {

            const donHang = await DonHang.findById(
                req.params.id
            );

            if (!donHang) {
                return res.send(
                    "Không tìm thấy đơn hàng"
                );
            }

            const chiTietDonHang = await ChiTietDonHang
                .find({
                    donHangId: donHang._id
                })
                .populate("sanPhamId");

            res.render("quantri/chitietdonhang", {
                donHang,
                chiTietDonHang,
                nguoiDung: req.session.nguoiDung
            });

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi tải chi tiết đơn hàng"
            );
        }
    }
);


// =========================
// QUẢN TRỊ DANH MỤC
// =========================
app.get(
    "/quan-tri/danh-muc",
    kiemTraQuanTri,
    async (req, res) => {

        try {

            const danhMucs = await DanhMuc
                .find()
                .sort({
                    createdAt: -1
                });

            res.render("quantri/quantridanhmuc", {

                nguoiDung:
                    req.session.nguoiDung,

                danhMucs

            });

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi tải danh mục"
            );

        }
    }
);
app.post(
    "/quan-tri/danh-muc/them",
    kiemTraQuanTri,

    function (req, res, next) {

        uploadDanhMuc.single("hinhAnh")(
            req,
            res,
            function (err) {

                if (err) {
                    console.error(
                        "LỖI UPLOAD:",
                        err
                    );

                    return res.status(500).send(
                        "Lỗi upload ảnh: " +
                        err.message
                    );
                }

                next();
            }
        );
    },

    async (req, res) => {

        try {

            console.log("===== THÊM DANH MỤC =====");
            console.log("BODY:", req.body);
            console.log("FILE:", req.file);

            const {
                tenDanhMuc,
                moTa
            } = req.body;

            if (!tenDanhMuc) {
                return res.send(
                    "Vui lòng nhập tên danh mục"
                );
            }

            let hinhAnh = "";

            if (req.file) {
                hinhAnh =
                    "/uploads/danh-muc/" +
                    req.file.filename;
            }

            console.log(
                "ĐƯỜNG DẪN ẢNH:",
                hinhAnh
            );

            const danhMucMoi =
                await DanhMuc.create({

                    tenDanhMuc:
                        tenDanhMuc.trim(),

                    moTa:
                        moTa
                            ? moTa.trim()
                            : "",

                    hinhAnh,

                    trangThai: true
                });

            console.log(
                "ĐÃ THÊM:",
                danhMucMoi
            );

            res.redirect(
                "/quan-tri/danh-muc"
            );

        } catch (error) {

            console.error(
                "===== LỖI THÊM DANH MỤC ====="
            );

            console.error(error);

            return res.status(500).send(
                "Lỗi thêm danh mục: " +
                error.message
            );
        }
    }
);
//QUẢN TRỊ SỬA DANH MỤC
app.get(
    "/quan-tri/danh-muc/sua/:id",
    kiemTraQuanTri,
    async (req, res) => {

        try {

            const danhMuc =
                await DanhMuc.findById(
                    req.params.id
                );

            if (!danhMuc) {

                return res.send(
                    "Không tìm thấy danh mục"
                );

            }

            res.render(
                "quantri/suadanhmuc",
                {
                    danhMuc,
                    nguoiDung:
                        req.session.nguoiDung
                }
            );

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi tải danh mục"
            );

        }
    }
);
//QUẢN TRỊ CẬP NHẬT DANH MỤC SAU SỬA
// ========================================
// QUẢN TRỊ CẬP NHẬT DANH MỤC SAU KHI SỬA
// ========================================

app.post(
    "/quan-tri/danh-muc/sua/:id",

    kiemTraQuanTri,

    // Xử lý upload ảnh
    function (req, res, next) {

        uploadDanhMuc.single("hinhAnh")(
            req,
            res,
            function (err) {

                if (err) {

                    console.error(
                        "LỖI UPLOAD ẢNH KHI SỬA:",
                        err
                    );

                    return res.status(500).send(
                        "Lỗi upload ảnh: " + err.message
                    );
                }

                next();
            }
        );
    },

    async (req, res) => {

        try {

            console.log("ID DANH MỤC:", req.params.id);
            console.log("BODY SỬA:", req.body);
            console.log("FILE SỬA:", req.file);

            // Tìm danh mục hiện tại
            const danhMuc =
                await DanhMuc.findById(
                    req.params.id
                );

            if (!danhMuc) {

                return res.status(404).send(
                    "Không tìm thấy danh mục"
                );
            }


            // =========================
            // CẬP NHẬT THÔNG TIN
            // =========================

            if (
                req.body.tenDanhMuc &&
                req.body.tenDanhMuc.trim()
            ) {

                danhMuc.tenDanhMuc =
                    req.body.tenDanhMuc.trim();
            }


            danhMuc.moTa =
                req.body.moTa
                    ? req.body.moTa.trim()
                    : "";


            danhMuc.trangThai =
                req.body.trangThai === "true";


            // =========================
            // CẬP NHẬT ẢNH
            // =========================

            // Nếu chọn ảnh mới
            if (req.file) {

                danhMuc.hinhAnh =
                    "/uploads/danh-muc/" +
                    req.file.filename;

            }

            // Nếu không chọn ảnh mới
            // => giữ nguyên danhMuc.hinhAnh cũ


            // =========================
            // LƯU MONGODB
            // =========================

            await danhMuc.save();


            console.log(
                "CẬP NHẬT DANH MỤC THÀNH CÔNG"
            );

            console.log(
                "ẢNH:",
                danhMuc.hinhAnh
            );


            res.redirect(
                "/quan-tri/danh-muc"
            );

        } catch (error) {

            console.error(
                "LỖI CẬP NHẬT DANH MỤC:",
                error
            );

            res.status(500).send(
                "Có lỗi khi cập nhật danh mục: " +
                error.message
            );
        }
    }
);
//QUẢN TRỊ XÓA DANH MỤC
app.post(
    "/quan-tri/danh-muc/xoa/:id",
    kiemTraQuanTri,
    async (req, res) => {

        try {

            const soSanPham =
                await SanPham.countDocuments({
                    danhMucId: req.params.id
                });

            if (soSanPham > 0) {

                return res.send(
                    "Không thể xóa danh mục vì đang có sản phẩm thuộc danh mục này"
                );

            }

            await DanhMuc.findByIdAndDelete(
                req.params.id
            );

            res.redirect(
                "/quan-tri/danh-muc"
            );

        } catch (error) {

            console.log(error);

            res.send(
                "Có lỗi khi xóa danh mục"
            );

        }
    }
);
// Chạy server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});