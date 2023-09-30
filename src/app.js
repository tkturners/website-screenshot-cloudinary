const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const captureWebsite = (...args) => import("capture-website");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const middlewares = require("./middlewares");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const { url, upload, ...rest } = req.query;
    if (!url) {
      return res.status(401).json({
        message: "Please send Url as query param: ?url=https://www.google.com",
      });
    }

    if (upload === "true") {
      const image = await (
        await captureWebsite()
      ).default.buffer(url, {
        ...rest,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      });

      const { url: ImageUrl } = await new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: "screenshots",
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(image).pipe(cld_upload_stream);
      });
      return res.json({ url: ImageUrl });
    } else {
      const buffer = await (
        await captureWebsite()
      ).default.buffer(url, {
        ...rest,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      });
      res.send(buffer);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
