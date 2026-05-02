const axios = require("axios");

async function checkHoliday(req, res) {
  try {
    const { date, country } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date query is required. Example: ?date=2026-05-01&country=BD",
      });
    }

    const selectedCountry = country || "BD";
    const year = date.split("-")[0];

    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${selectedCountry}`;

    const response = await axios.get(url);
    const holiday = response.data.find((item) => item.date === date);

    res.status(200).json({
      date,
      country: selectedCountry,
      isHoliday: Boolean(holiday),
      holidayName: holiday ? holiday.localName || holiday.name : "",
      message: holiday
        ? `Selected date is a public holiday: ${holiday.localName || holiday.name}`
        : "Selected date is not listed as a public holiday",
    });
  } catch (error) {
    res.status(200).json({
      date: req.query.date,
      country: req.query.country || "BD",
      isHoliday: false,
      apiStatus: "Failed",
      message: "Holiday validation could not be completed",
      error: error.message,
    });
  }
}

module.exports = {
  checkHoliday,
};
