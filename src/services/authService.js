import e from "express";
import db from "../models/index";
import { raw } from "body-parser";
const { generateOtp, isOtpExpired } = require("../utils/otpConfig");
const { GoogleGenerativeAI } = require("@google/generative-ai");

var nodemailer = require("nodemailer");
let sendmail = (note, userMail = null) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_APP,
    to: userMail,
    subject: "Your OTP Verification Code from Job Finder",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification Code</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello,</p>
            <p>Here is your OTP verification code: <strong>${note}</strong></p>
            <p>This OTP is valid for 5 minutes. Please do not share this code with anyone else.</p>
          </div>
          <div style="padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #d0d0d0;">
            <p>Thank you for using Job Finder!</p>
            <p><a href="#" style="color: #0056b3; text-decoration: none; font-weight: 600;">Contact Us</a> | <a href="#" style="color: #0056b3; text-decoration: none; font-weight: 600;">Privacy Policy</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
  });
};
let otps = {};
let handleSendOtp = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let otp = generateOtp();
      let expirationTime = Date.now() + 3 * 60 * 1000;
      otps[email] = { otp, expirationTime };
      let note = otp;
      sendmail(note, email);
      resolve({
        errCode: 0,
        errMessage: "Send OTP successfully",
      });
    } catch (error) {
      reject(error);
    }
  });
};
let handleVerifyOtp = (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      const otpInfo = otps[email];
      if (!otpInfo) {
        return resolve({
          errCode: -1,
          errMessage: "OTP does not exist",
        });
      }
      if (isOtpExpired(otpInfo.expirationTime)) {
        delete otps[email];
        return resolve({
          errCode: -1,
          errMessage: "OTP is expired",
        });
      }

      if (otpInfo.otp !== otp) {
        return resolve({
          errCode: -1,
          errMessage: "OTP is incorrect",
        });
      }
      delete otps[email];
      let user = await db.User.findOne({
        where: { email: email },
        attributes: { exclude: ["userId"] },
        raw: false,
      });
      if (user) {
        user.isVerify = 1;
        await user.save();
        return resolve({
          errCode: 0,
          errMessage: "Verify OTP successfully",
        });
      } else {
        return resolve({
          errCode: -1,
          errMessage: "User does not exist",
        });
      }
    } catch (error) {
      reject({
        errCode: -2,
        errMessage: "Error from server",
        error: error.message,
      });
    }
  });
};
let handleChatWithAI = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyAwa38EpavqvyF3mUAfxNp54SprgLSERqs"
      );
      const model = await genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      let prompt = " ";
      if (!data.replyHistory) {
        prompt = `Bạn là một chuyên gia về việc làm. Chỉ trả lời những câu hỏi về việc làm.
          Câu hỏi : ${data.message}`;
      } else {
        prompt = `Đưa ra câu trả lời luôn.Không được hỏi lại
          Câu trả lời trước : ${data.replyHistory}
          Câu hỏi tiếp theo : ${data.message}`;
      }

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      resolve({
        errCode: 0,
        errMessage: "OK",
        data: responseText,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleSendOtp: handleSendOtp,
  handleVerifyOtp: handleVerifyOtp,
  handleChatWithAI: handleChatWithAI,
};
