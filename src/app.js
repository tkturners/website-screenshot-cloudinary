const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const captureWebsite = (...args) => import("capture-website");
const { extractColorPalette, getSimpleColorPalette, generateUITheme } = require("./utils/colorPalette");
const { analyzeWebsiteColors } = require("./utils/htmlColorAnalysis");

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
    const { url, upload, palette, ...rest } = req.query;
    if (!url) {
      return res.status(401).json({
        message: "Please send Url as query param: ?url=https://www.google.com",
      });
    }

    const image = await (
      await captureWebsite()
    ).default.buffer(url, {
      ...rest,
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    // Extract color palette if requested
    let colorPalette = null;
    if (palette === "true") {
      const paletteResult = await getSimpleColorPalette(image);
      if (paletteResult.success) {
        colorPalette = paletteResult;
      }
    }

    if (upload === "true") {
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
      
      const response = { url: ImageUrl };
      if (colorPalette) {
        response.colorPalette = colorPalette;
      }
      return res.json(response);
    } else if (colorPalette) {
      // Return JSON with image data and color palette
      return res.json({
        image: image.toString('base64'),
        colorPalette
      });
    } else {
      // Return raw image buffer
      res.send(image);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Dedicated endpoint for color palette extraction
app.get("/palette", async (req, res) => {
  try {
    const { url, detailed, ...rest } = req.query;
    if (!url) {
      return res.status(400).json({
        message: "Please send Url as query param: ?url=https://www.google.com",
      });
    }

    const image = await (
      await captureWebsite()
    ).default.buffer(url, {
      ...rest,
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    const paletteResult = detailed === "true" 
      ? await extractColorPalette(image)
      : await getSimpleColorPalette(image);

    if (paletteResult.success) {
      return res.json(paletteResult);
    } else {
      return res.status(500).json({
        message: "Failed to extract color palette",
        error: paletteResult.error
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// UI Theme generation endpoint
app.get("/theme", async (req, res) => {
  try {
    const { url, ...rest } = req.query;
    if (!url) {
      return res.status(400).json({
        message: "Please send Url as query param: ?url=https://www.google.com",
      });
    }

    const image = await (
      await captureWebsite()
    ).default.buffer(url, {
      ...rest,
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    const themeResult = await generateUITheme(image);

    if (themeResult.success) {
      return res.json(themeResult);
    } else {
      return res.status(500).json({
        message: "Failed to generate UI theme",
        error: themeResult.error
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// HTML-based color analysis endpoint
app.get("/analyze", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        message: "Please send Url as query param: ?url=https://www.google.com",
      });
    }

    const analysisResult = await analyzeWebsiteColors(url);

    if (analysisResult.success) {
      return res.json(analysisResult);
    } else {
      return res.status(500).json({
        message: "Failed to analyze website colors",
        error: analysisResult.error
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
