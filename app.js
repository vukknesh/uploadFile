const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const crypto = require("crypto");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

const mongoURI =
  "mongodb+srv://vukknesh:vukknesh@cluster0-bsapg.mongodb.net/LEONARDO?retryWrites=true";

const conn = mongoose.createConnection(mongoURI);

let gfs;

conn.collection("open", () => {
  //initialize stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

//@route GET/
//@desc Loads form

app.get("/", (req, res) => {
  res.render("index");
});

//@route POST/upload
//@desc Uploads file to Db

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
  res.redirect("/");
});

app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    //files if true
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "no files existe"
      });
    }
    return res.json(files);
  });
});

app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, () => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "no file existe"
      });
    }
    return res.json(file);
  });
});
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, () => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "no file existe"
      });
    }
    if (file.contentType === "image/jpeg" || file.contentType === "img/png") {
    }
  });
});

app.listen(PORT, () => {
  console.log(`connected on port ${PORT}`);
});
