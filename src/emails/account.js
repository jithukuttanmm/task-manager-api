const sgMail = require("@sendgrid/mail");
const sendGridApiKEy = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridApiKEy);

const sendWelcomEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "jithukuttanmm@outlook.com",
    subject: "Welcome to Task Manager App",
    text: `Hello ${name},
    Welxome to Task Manager App. Please reply with any suggestions you have !`,
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "jithukuttanmm@outlook.com",
    subject: "Good Bye !",
    text: `Hello ${name},
        Sorry to see you go. Please reply with any suggestions you have !`,
  });
};

module.exports = {
  sendWelcomEmail,
  sendGoodbyeEmail,
};
