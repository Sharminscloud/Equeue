const nodemailer = require("nodemailer");

function getMailCredentials() {
  return {
    user:
      process.env.GMAIL_USER ||
      process.env.EMAIL_USER ||
      process.env.MAIL_USER ||
      "",
    pass:
      process.env.GMAIL_APP_PASSWORD ||
      process.env.EMAIL_PASS ||
      process.env.MAIL_PASS ||
      "",
  };
}

async function sendEmailNotification({ to, subject, message }) {
  try {
    const { user, pass } = getMailCredentials();

    if (!user || !pass) {
      console.log("========== SIMULATED EMAIL ==========");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log("Reason: Gmail credentials missing in .env");
      console.log("=====================================");

      return {
        status: "SIMULATED",
        errorMessage: "Gmail credentials missing. Email simulated in terminal.",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"EQueue" <${user}>`,
      to,
      subject,
      text: message,
    });

    return {
      status: "SENT",
      errorMessage: "",
    };
  } catch (error) {
    console.log("========== EMAIL FAILED ==========");
    console.log(error.message);
    console.log("==================================");

    return {
      status: "FAILED",
      errorMessage: error.message,
    };
  }
}

function simulateSmsNotification({ to, message }) {
  if (!to) {
    return {
      status: "FAILED",
      errorMessage: "Phone number missing",
    };
  }

  console.log("========== SIMULATED SMS ==========");
  console.log(`Phone: ${to}`);
  console.log(`Message: ${message}`);
  console.log("===================================");

  return {
    status: "SIMULATED",
    errorMessage: "",
  };
}

module.exports = {
  sendEmailNotification,
  simulateSmsNotification,
};
