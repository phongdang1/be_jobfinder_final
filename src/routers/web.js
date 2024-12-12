import express from "express";
import postController from "../controllers/postController";
import userController from "../controllers/userController";
import companyController from "../controllers/companyController";
import authController from "../controllers/authController";
import allCodeController from "../controllers/allCodeController";
import skillController from "../controllers/skillController";
import cvPostController from "../controllers/cvPostController";
import packageController from "../controllers/packageController";
import notificationController from "../controllers/notificationController";
import reportController from "../controllers/reportController";
import middlewareControllers from "../middlewares/jwtVerify";
const passport = require("passport");

const router = express.Router();

let initWebRoutes = (app) => {
  //===================API USER========================//
  router.get(
    "/getAllUsers",
    middlewareControllers.verifyTokenUser,
    userController.getAllUsers
  );
  router.get(
    "/getAllUsersWithLimit",
    middlewareControllers.verifyTokenUser,
    userController.getAllUsersWithLimit
  );
  router.get("/getUserById", userController.getUsersById);
  router.post("/createNewUser", userController.handleCreateNewUser);
  router.post("/login", userController.handleLogin);
  router.post(
    "/setDataUserDetail",

    userController.handleSetDataUserDetail
  );
  router.post("/forgotPassword", userController.handleForgotPassword);
  router.post(
    "/changePassword",
    middlewareControllers.verifyTokenUser,
    userController.handleChangePassword
  );
  router.post("/banUser", userController.handleBanUser);
  router.post("/unBanUser", userController.handleUnBanUser);
  router.post("/setUserToAdmin", userController.handleSetUserToAdmin);

  //===================API AllCode========================//
  router.get("/getAllCodeByType", allCodeController.getAllCodeByType);
  router.get("/getAllCode", allCodeController.getAllCode);
  router.get("/getValueByCode", allCodeController.getValueByCode);
  router.post(
    "/createNewCode",
    middlewareControllers.verifyTokenAdmin,
    allCodeController.handleCreateNewAllCode
  );
  router.post(
    "/updateCode",
    middlewareControllers.verifyTokenAdmin,
    allCodeController.handleUpdateAllCode
  );
  router.post(
    "/deleteCode",
    middlewareControllers.verifyTokenAdmin,
    allCodeController.handleDeleteAllCode
  );

  //===================API SKILL========================//
  router.post(
    "/createNewSkill",
    middlewareControllers.verifyTokenAdmin,
    skillController.handleCreateNewSkill
  );
  router.post(
    "/deleteSkill",
    middlewareControllers.verifyTokenAdmin,
    skillController.handleDeleteSkill
  );
  router.get("/getAllSkillByCategory", skillController.getAllSkillByCategory);
  router.get("/getAllSkillWithLimit", skillController.getAllSkillWithLimit);
  router.get("/getAllSkill", skillController.getAllSkill);
  router.get("/getSkillById", skillController.getSkillById);
  router.post(
    "/updateSkill",
    middlewareControllers.verifyTokenAdmin,
    skillController.handleUpdateSkill
  );

  //==================API POST==========================//
  router.get("/getAllPostWithLimit", postController.getAllPostWithLimit);
  router.get("/getAllPost", postController.getAllPost);
  router.post(
    "/createNewPost",

    postController.handleCreateNewPost
  );
  router.get("/getDetailPostById", postController.getDetailPostById);
  router.post(
    "/updatePost",
    middlewareControllers.verifyTokenCompany,
    postController.handleUpdatePost
  );
  router.post(
    "/banPost",
    middlewareControllers.verifyTokenAdmin,
    postController.handleBanPost
  );
  router.post(
    "/unBanPost",
    middlewareControllers.verifyTokenAdmin,
    postController.handleUnBanPost
  );
  router.post(
    "/approvePost",
    // middlewareControllers.verifyTokenAdmin,
    postController.handleApprovePost
  );
  router.post(
    "/reupPost",
    middlewareControllers.verifyTokenCompany,
    postController.handleReupPost
  );
  router.post("/rejectPost", postController.handleRejectPost);
  router.post("/closePost", postController.handleClosePost);

  //==================API CV_POST==========================//
  router.post(
    "/applyJob",
    middlewareControllers.verifyTokenUser,
    cvPostController.handleApplyJob
  );
  router.get("/getAllListCvByPost", cvPostController.getAllListCvByPost);
  router.get("/getDetailCvPostById", cvPostController.getDetailCvPostById);
  router.get("/getAllCvPostByUserId", cvPostController.getAllCvPostByUserId);
  router.post(
    "/handleFindCv",
    middlewareControllers.verifyTokenCompany,
    cvPostController.handleFindCv
  );
  router.get(
    "/checkViewCompany",
    middlewareControllers.verifyTokenCompany,
    cvPostController.checkViewCompany
  );
  router.get(
    "/getAllCvPostByCompanyId",
    cvPostController.getAllCvPostByCompanyId
  );
  router.get(
    "/getAllInterViewSchedule",
    middlewareControllers.verifyTokenCompany,
    cvPostController.getAllInterViewSchedule
  );
  router.get(
    "/getInterviewScheduleByCvPost",
    middlewareControllers.verifyTokenCompany,
    cvPostController.getInterviewScheduleByCvPost
  );
  router.post(
    "/createInterviewSchedule",

    cvPostController.createInterviewSchedule
  );
  router.post("/handleApproveCvPost", cvPostController.handleApproveCvPost);
  router.post("/handleRejectCvPost", cvPostController.handleRejectCvPost);
  router.get(
    "/getAllCvPostByCompanyId7Day",
    cvPostController.getAllCvPostByCompanyId7Day
  );
  router.post(
    "/handleInviteApplyJob",
    // middlewareControllers.verifyTokenCompany,
    cvPostController.handleInviteApplyJob
  );

  router.get("/testCommon", cvPostController.testCommon);

  //==================API COMPANY==========================//
  router.get(
    "/getAllCompaniesWithLimit",
    companyController.getAllCompaniesWithLimit
  );
  router.get("/getAllCompanies", companyController.getAllCompanies);
  router.get(
    "/getAllCompaniesWithLimitInactive",
    companyController.getAllCompaniesWithLimitInactive
  );
  router.get(
    "/getAllCompaniesInactive",
    companyController.getAllCompaniesInactive
  );
  router.post("/createNewCompany", companyController.handleCreateNewCompany);
  router.post(
    "/addUserToCompany",
    middlewareControllers.verifyTokenCompany,
    companyController.handleAddUserToCompany
  );
  router.get("/getCompanyById", companyController.getCompanyById);
  router.post(
    "/updateCompany",
    middlewareControllers.verifyTokenCompany,
    companyController.handleUpdateCompany
  );
  router.post(
    "/banCompany",
    middlewareControllers.verifyTokenAdmin,
    companyController.handleBanCompany
  );
  router.post(
    "/unBanCompany",
    middlewareControllers.verifyTokenAdmin,
    companyController.handleUnBanCompany
  );
  router.get("/getCompanyByUserId", companyController.getCompanyByUserId);
  router.get("/getAllUserOfCompany", companyController.getAllUserOfCompany);
  router.post("/approveCompany", companyController.handleApproveCompany);
  router.post("/rejectCompany", companyController.handleRejectCompany);
  router.get("/getPointOfCompany", companyController.getPointOfCompany);
  router.post("/exchangePointToPost", companyController.exchangePointToPost);
  router.post("/exchangePointToView", companyController.exchangePointToView);

  //===================API PACKAGE========================//
  router.post(
    "/createNewPackage",
    middlewareControllers.verifyTokenAdmin,
    packageController.handleCreateNewPackage
  );
  router.post(
    "/updatePackage",
    middlewareControllers.verifyTokenAdmin,
    packageController.handleUpdatePackage
  );
  router.post(
    "/activePackage",
    middlewareControllers.verifyTokenAdmin,
    packageController.handleActivePackage
  );
  router.post(
    "/deactivePackage",
    middlewareControllers.verifyTokenAdmin,
    packageController.handleDeactivePackage
  );
  router.get("/getAllPackage", packageController.getAllPackage);
  router.get("/getPackageById", packageController.getPackageById);
  router.post("/createPaymentViewCv", packageController.createPaymentViewCv);
  router.post("/executePaymentViewCv", packageController.executePaymentViewCV);
  router.post("/createPaymentHotPost", packageController.createPaymentHotPost);
  router.post(
    "/executePaymentHotPost",
    packageController.executePaymentHotPost
  );
  router.post("/createPaymentVip", packageController.createPaymentVip);
  router.post("/executePaymentVip", packageController.executePaymentVip);
  router.get("/getPackageByType", packageController.getPackageByType);
  router.get("/getRevenueViewByMonth", packageController.getRevenueViewByMonth);
  router.get("/getRevenuePostByMonth", packageController.getRevenuePostByMonth);
  router.get("/getRevenueVipByMonth", packageController.getRevenueVipByMonth);
  router.get("/getAllUserPackage", packageController.getAllUserPackage);

  //===================API GOOGLE========================//

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      console.log("req.user");
    }
  );
  //===================API REPORT========================//
  router.post("/createNewReport", reportController.handleCreateNewReport);
  router.get("/getAllReport", reportController.getAllReport);
  router.post("/checkReport", reportController.handleCheckReport);
  router.get("/getReportByPostId", reportController.getReportByPostId);
  router.get("/test", reportController.test);
  //===================API NOTIFICATION========================//
  router.get(
    "/getAllNotificationByUserId",
    notificationController.getAllNotificationByUserId
  );
  router.post(
    "/handleCheckNotification",
    notificationController.handleCheckNotification
  );
  //===================API OTP========================//
  router.post("/sendOtp", authController.handleSendOtp);
  router.post("/verifyOtp", authController.handleVerifyOtp);
  router.post("/chatWithAI", authController.handleChatWithAI);

  return app.use("/", router);
};

module.exports = initWebRoutes;
