const multipart = require("lambda-multipart-parser");
const Tesseract = require("tesseract.js");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const parsed = await multipart.parse(event);
        const imageFile = parsed.files?.find((file) => file.fieldname === "image");

        if (!imageFile?.content) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ error: "No se recibió ninguna imagen." })
            };
        }

        const buffer = Buffer.isBuffer(imageFile.content)
            ? imageFile.content
            : Buffer.from(imageFile.content);

        const result = await Tesseract.recognize(buffer, "spa+eng");

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: result.data.text || "" })
        };
    } catch (error) {
        console.error("Netlify OCR failed:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: "No se pudo procesar la imagen." })
        };
    }
};
