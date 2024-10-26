const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const DOWNTOWN_SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const ELETREBY_SPREADSHEET_ID = process.env.SPREADSHEET_ID;


// POST endpoint to handle form submission
app.post("/submit-form", async (req, res) => {
  try {
    const { name, phone, date, branch , customerId} = req.body;

    // Prepare the values to be inserted into the sheet
    const values = [
      [
        name,
        phone,
        date,
        branch,
        new Date().toISOString().slice(0, 19).replace("T", " "), // Timestamp
      ],
    ];

    // Append values to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: customerId == '2' ? DOWNTOWN_SPREADSHEET_ID: ELETREBY_SPREADSHEET_ID,
      range: "Sheet1!A:H",
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

// GET endpoint to fetch data from the sheet

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});