import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, body: string) {
    // let testAccount = await nodemailer.createTestAccount();
    // console.log(testAccount)

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "fp77xscev2dl4bz2@ethereal.email", // generated ethereal user
            pass: "wUuXC9GGjpPrjYbHaJ", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: ' "LiReddit" <support@lireddit.com>',
        to,
        subject,
        html: `
        <h1>LiReddit</h1>
        <h2>${subject}</h2>
        <br>
        <div>${body}</div>
        `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
