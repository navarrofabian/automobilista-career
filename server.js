const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen." });
    }

    try {
        const result = await Tesseract.recognize(req.file.buffer, "spa+eng");
        return res.json({ text: result.data.text || "" });
    } catch (error) {
        console.error("OCR upload failed:", error);
        return res.status(500).json({ error: "No se pudo procesar la imagen." });
    }
});

app.listen(port, () => {
    console.log(`OCR server running on http://localhost:${port}`);
});
