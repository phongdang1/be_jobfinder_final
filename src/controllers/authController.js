const passport = require("passport");
const crypto = require("crypto");
const authService = require("../services/authService");

let handleSendOtp = async (req, res) => {
  try {
    let data = await authService.handleSendOtp(req.body.email);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleVerifyOtp = async (req, res) => {
  try {
    let data = await authService.handleVerifyOtp(req.body.email, req.body.otp);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let handleChatWithAI = async (req, res) => {
  try {
    let message = req.body;
    let data = await authService.handleChatWithAI(message);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

module.exports = {
  handleSendOtp: handleSendOtp,
  handleVerifyOtp: handleVerifyOtp,
  handleChatWithAI: handleChatWithAI,
};
