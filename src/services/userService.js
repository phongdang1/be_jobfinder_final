import e from "express";
import db from "../models/index";
import bcrypt from "bcryptjs";
import CommonUtils from "../utils/CommonUtils";
const cloudinary = require("../utils/cloudinary");
const salt = bcrypt.genSaltSync(10);
require("dotenv").config();
const { Op } = require("sequelize");
let nodemailer = require("nodemailer");

let sendMailToUser = (note, userMail = null) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_APP,
    to: userMail, // Recipient's email address
    subject: "Password Recovery from Job Finder",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Recovery</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello,</p>
            <p>We have received a request to reset your account password.</p>
            <p>Your new password is: <strong>${note}</strong></p>
            <p>Please use this password to log in and change it immediately after logging in for the first time.</p>
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
      console.log(error.message);
    } else {
    }
  });
};

let sendMailBanUser = (note, userMail, userName = null) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_APP,
    to: userMail, // Recipient's email address
    subject: "Notification from Job Finder",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello, ${userName}</p>
            <p>Your account has been banned for the following reason: ${note}</p>
            <p>Please contact us for further details.</p>
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
      console.log(error.message);
    } else {
    }
  });
};

let checkUserPhoneNumber = (userPhoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userPhoneNumber) {
        resolve({
          errCode: 2,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { phoneNumber: userPhoneNumber },
        });
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userEmail) {
        resolve({
          errCode: 2,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { email: userEmail },
        });
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let handleHashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = "";
      if (password) {
        hashPassword = await bcrypt.hashSync(password, salt);
      }
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

let getAllUsersWithLimit = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.limit || !data.offset) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let objectQuery = {
          limit: +data.limit,
          offset: +data.offset,
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.UserDetail,
              as: "UserDetailData",
              attributes: {
                exclude: ["userId", "createdAt", "updatedAt", "file"],
              },
            },
          ],
          raw: true,
          nest: true,
        };
        if (data.searchKey) {
          objectQuery.where = {
            ...objectQuery.where,
            [Op.or]: [
              { firstName: { [Op.like]: `%${data.searchKey}%` } },
              { lastName: { [Op.like]: `%${data.searchKey}%` } },
              { phoneNumber: { [Op.like]: `%${data.searchKey}%` } },
            ],
          };
        }
        let result = await db.User.findAndCountAll(objectQuery);
        resolve({
          errCode: 0,
          errMessage: "Get all users succeed",
          data: result.rows ? result.rows : [],
          count: result.count ? result.count : 0,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllUsers = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let objectQuery = {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.UserDetail,
            as: "UserDetailData",
            attributes: {
              exclude: ["userId", "createdAt", "updatedAt", "file"],
            },
          },
        ],
        raw: true,
        nest: true,
      };
      if (data.searchKey) {
        objectQuery.where = {
          ...objectQuery.where,
          [Op.or]: [
            { firstName: { [Op.like]: `%${data.searchKey}%` } },
            { lastName: { [Op.like]: `%${data.searchKey}%` } },
            { phoneNumber: { [Op.like]: `%${data.searchKey}%` } },
          ],
        };
      }

      let result = await db.User.findAll(objectQuery);

      resolve({
        errCode: 0,
        errMessage: "Get all users succeed",
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getUsersById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let result = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.UserDetail,
              as: "UserDetailData",
              attributes: {
                exclude: ["userId"],
              },
            },
          ],
          raw: true,
          nest: true,
        });
        if (result.UserDetailData.file) {
          try {
            result.UserDetailData.file = Buffer.from(
              result.UserDetailData.file,
              "base64"
            ).toString("binary");
          } catch (error) {
            console.log("Error decoding base64 file: ", error);
            result.UserDetailData.file = null;
          }
        }
        let listSkill = await db.UserSkill.findAll({
          where: { userId: userId },
          attributes: {
            exclude: ["UserId", "userId", "SkillId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: db.Skill,
              as: "skillData",
              attributes: {
                exclude: ["createdAt", "updatedAt", "id"],
              },
            },
          ],
          raw: false,
        });
        result.listSkill = listSkill;
        resolve({
          errCode: 0,
          errMessage: "Get user by id succeed",
          data: result,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let handleCreateNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let checkExist = await checkUserEmail(data.email);
        if (checkExist) {
          resolve({
            errCode: 2,
            errMessage: "User's email already exist",
          });
        } else {
          let imageUrl = "";
          let isHavePassword = true;
          if (!data.password) {
            data.password = `${new Date().getTime().toString()}@jobfinder`;
            isHavePassword = false;
          }
          let hashPassword = await handleHashUserPassword(data.password);
          if (data.image) {
            let uploadResponse = await cloudinary.uploader.upload(data.image, {
              upload_preset: "ml_default",
            });
            imageUrl = uploadResponse.url;
          }
          let newUser = await db.User.create({
            phoneNumber: data.phoneNumber ? data.phoneNumber : null,
            password: hashPassword,
            email: data.email,
            firstName: data.firstName ? data.firstName : null,
            lastName: data.lastName ? data.lastName : null,
            address: data.address ? data.address : null,
            point: data.point ? data.point : 0,
            image: imageUrl ? imageUrl : null,
            dob: data.dob ? data.dob : null,
            roleCode: data.roleCode ? data.roleCode : "USER",
            statusCode: data.statusCode ? data.statusCode : "ACTIVE",
            typeLogin: data.typeLogin ? data.typeLogin : "LOCAL",
            isVerify: data.isVerify ? data.isVerify : 0,
            isUpdate: data.isUpdate ? data.isUpdate : 0,
            isVip: data.isVip ? data.isVip : 0,
            companyId: data.companyId ? data.companyId : null,
          });
          if (!isHavePassword) {
            let note = `<h3>Tài khoản đã tạo thành công</h3>
                                    <p>Tài khoản: ${data.phonenumber}</p>
                                    <p>Mật khẩu: ${data.password}</p>
                        `;
            sendMailToUser(note, data.email);
          }
          resolve({
            errCode: 0,
            errMessage: "Create user succeed",
            data: newUser,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
//handle login
let handleLogin = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let userData = {};
        let user = await db.User.findOne({
          where: {
            email: data.email,
            typeLogin: "LOCAL",
          },
        });
        if (user) {
          let check = await bcrypt.compareSync(data.password, user.password);
          if (check) {
            let company = await db.Company.findOne({
              where: { id: user.companyId },
              raw: true,
            });
            if (company) {
              if (company.statusCode === "BANNED") {
                userData.errMessage = "Company is banned";
                userData.errCode = 5;
                return resolve(userData);
              }
            }

            if (user.statusCode === "ACTIVE") {
              userData.errMessage = "Login succeed";
              userData.errCode = 0;
              userData.data = user;
              userData.token = CommonUtils.encodeToken(user.id);
            } else {
              userData.errMessage = "User is not active";
              userData.errCode = 3;
            }
          } else {
            userData.errMessage = "Password or Email is incorrect";
            userData.errCode = 2;
          }
        } else {
          userData.errMessage = "User is not exist";
          userData.errCode = 4;
        }
        resolve(userData);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleSetDataUserDetail = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.data) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }

      let user = await db.User.findOne({
        where: { id: data.userId },
        attributes: { exclude: ["password"] },
        raw: false,
      });

      if (!user) {
        return resolve({
          errCode: 3,
          errMessage: "User does not exist",
        });
      }
      if (
        data.image ||
        data.dob ||
        data.firstName ||
        data.lastName ||
        data.address ||
        data.phoneNumber
      ) {
        if (data.image) {
          let uploadResponse = await cloudinary.uploader.upload(data.image, {
            upload_preset: "ml_default",
          });
          user.image = uploadResponse.url;
        }

        user.dob = data.dob || user.dob;
        user.firstName = data.firstName || user.firstName;
        user.lastName = data.lastName || user.lastName;
        user.address = data.address || user.address;
        user.phoneNumber = data.phoneNumber || user.phoneNumber;

        await user.save();
      }
      let userDetail = await db.UserDetail.findOne({
        where: { userId: user.id },
        raw: false,
      });

      let userDetailData = {
        addressCode: data.data.addressCode || null,
        salaryJobCode: data.data.salaryJobCode || null,
        experienceJobCode: data.data.experienceJobCode || null,
        genderCode: data.data.genderCode || null,
        categoryJobCode: data.data.categoryJobCode || null,
        jobLevelCode: data.data.jobLevelCode || null,
        workTypeCode: data.data.workTypeCode || null,
        isTakeMail: data.data.isTakeMail || 0,
        isFindJob: data.data.isFindJob || 0,
        file: data.data.file || null,
      };

      if (userDetail) {
        let userDetailData = {
          addressCode: data.data.addressCode || userDetail.addressCode || null,
          salaryJobCode:
            data.data.salaryJobCode || userDetail.salaryJobCode || null,
          experienceJobCode:
            data.data.experienceJobCode || userDetail.experienceJobCode || null,
          genderCode: data.data.genderCode || userDetail.genderCode || null,
          categoryJobCode:
            data.data.categoryJobCode || userDetail.categoryJobCode || null,
          jobLevelCode:
            data.data.jobLevelCode || userDetail.jobLevelCode || null,
          workTypeCode:
            data.data.workTypeCode || userDetail.workTypeCode || null,
          isTakeMail: data.data.isTakeMail || userDetail.isTakeMail || 0,
          isFindJob: data.data.isFindJob || userDetail.isFindJob || 0,
          file: data.data.file || userDetail.file || null,
        };
        Object.assign(userDetail, userDetailData);
        await userDetail.save();
      } else {
        await db.UserDetail.create({ userId: user.id, ...userDetailData });
      }
      if (data.data.listSkills && Array.isArray(data.data.listSkills)) {
        await db.UserSkill.destroy({ where: { userId: user.id } });
        let objUserSkill = data.data.listSkills.map((item) => {
          return { userId: user.id, skillId: item };
        });
        await db.UserSkill.bulkCreate(objUserSkill);
      }
      user.isUpdate = 1;
      await user.save();
      resolve({
        errCode: 0,
        errMessage: "Set data user detail succeeded",
        user: user,
        data: data.data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let handleForgotPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { email: data.email },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User's email does not exist. Please check again",
          });
        } else {
          let newPassword = `${new Date().getTime().toString()}@jobfinder`;
          let hashPassword = await handleHashUserPassword(newPassword);
          user.password = hashPassword;
          await user.save();
          let note = newPassword;
          sendMailToUser(note, data.email);
          resolve({
            errCode: 0,
            errMessage: "Reset password succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleChangePassword = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.oldPassword || !data.newPassword) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User does not exist",
          });
        } else {
          let check = await bcrypt.compareSync(data.oldPassword, user.password);
          if (check) {
            let hashPassword = await handleHashUserPassword(data.newPassword);
            user.password = hashPassword;
            await user.save();
            resolve({
              errCode: 0,
              errMessage: "Change password succeed",
            });
          } else {
            resolve({
              errCode: 3,
              errMessage: "Old password is incorrect",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleBanUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.note) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User does not exist",
          });
        } else {
          user.statusCode = "BANNED";
          await user.save();
          sendMailBanUser(data.note, user.email, user.lastName);
          resolve({
            errCode: 0,
            errMessage: "Ban user succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleUnBanUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User does not exist",
          });
        } else {
          user.statusCode = "ACTIVE";
          await user.save();
          let note =
            "Tài khoản của bạn đã được mở khóa. Bạn có thể sử dụng lại tài khoản của mình tại Job Finder";
          sendMailBanUser(note, user.email, user.lastName);
          resolve({
            errCode: 0,
            errMessage: "Unban user succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let handleSetUserToAdmin = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          raw: false,
        });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User does not exist",
          });
        } else {
          user.roleCode = "ADMIN";
          await user.save();
          resolve({
            errCode: 0,
            errMessage: "Set user to admin succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAllUsersWithLimit: getAllUsersWithLimit,
  getAllUsers: getAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleLogin: handleLogin,
  getUsersById: getUsersById,
  handleSetDataUserDetail: handleSetDataUserDetail,
  handleForgotPassword: handleForgotPassword,
  handleChangePassword: handleChangePassword,
  handleBanUser: handleBanUser,
  handleUnBanUser: handleUnBanUser,
  handleSetUserToAdmin: handleSetUserToAdmin,
};
