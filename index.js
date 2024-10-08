// Required packages
const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// POST endpoint to handle form submission
app.post("/submit-form", async (req, res) => {
  try {
    const { name, email, phone, date, country, service, branch } = req.body;

    // Prepare the values to be inserted into the sheet
    const values = [
      [
        name,
        email,
        phone,
        date,
        country,
        service,
        branch,
        new Date().toISOString().slice(0, 19).replace("T", " "), // Timestamp
      ],
    ];

    // Append values to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:H", // Adjust range as needed
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    res.status(200).json({ message: "Form submitted successfully", response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
