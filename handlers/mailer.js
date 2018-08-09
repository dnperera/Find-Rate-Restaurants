const nodeMailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (fileName, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${fileName}.pug`,
    options
  );
  const htmlwithInlinedStyles = juice(html);
  return htmlwithInlinedStyles;
};

exports.sendMail = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html); // convert html content to text
  const mailOptions = {
    from: "Dayan Perera <noreply@dayanperera.com>",
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
