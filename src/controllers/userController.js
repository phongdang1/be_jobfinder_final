import userService from "../services/userService";

let getAllUsers = async (req, res) => {
  try {
    let data = await userService.getAllUsers(req.query);
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errMessage: "Get all users failed",
      errorCode: -1,
    });
  }
};
let getAllUsersWithLimit = async (req, res) => {
  try {
    let data = await userService.getAllUsersWithLimit(req.query);
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errMessage: "Get all users failed",
      errorCode: -1,
    });
  }
};
let getUsersById = async (req, res) => {
  try {
    let data = await userService.getUsersById(req.query.id);
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errMessage: "Get user by id failed",
      errCode: -1,
    });
  }
};
//create user
let handleCreateNewUser = async (req, res) => {
  try {
    let data = await userService.handleCreateNewUser(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

//handle login
let handleLogin = async (req, res) => {
  try {
    let data = await userService.handleLogin(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleSetDataUserDetail = async (req, res) => {
  try {
    let data = await userService.handleSetDataUserDetail(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let handleForgotPassword = async (req, res) => {
  try {
    let data = await userService.handleForgotPassword(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let handleChangePassword = async (req, res) => {
  try {
    let data = await userService.handleChangePassword(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleBanUser = async (req, res) => {
  try {
    let data = await userService.handleBanUser(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleUnBanUser = async (req, res) => {
  try {
    let data = await userService.handleUnBanUser(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let handleSetUserToAdmin = async (req, res) => {
  try {
    let data = await userService.handleSetUserToAdmin(req.body);
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
  getAllUsers: getAllUsers,
  getAllUsersWithLimit: getAllUsersWithLimit,
  getUsersById: getUsersById,
  handleCreateNewUser: handleCreateNewUser,
  handleLogin: handleLogin,
  handleSetDataUserDetail: handleSetDataUserDetail,
  handleForgotPassword: handleForgotPassword,
  handleChangePassword: handleChangePassword,
  handleBanUser: handleBanUser,
  handleUnBanUser: handleUnBanUser,
  handleSetUserToAdmin: handleSetUserToAdmin,
};
