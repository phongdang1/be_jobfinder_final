import e from "express";
import db from "../models/index";
import { raw } from "body-parser";
const { Op, where } = require("sequelize");
require("dotenv").config();
var nodemailer = require("nodemailer");
let sendmail = (note, userMail) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL_APP,
    to: userMail,
    subject: "Notification from Job Finder",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification from Job Finder</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello,</p>
            <p>${note}</p>
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

let getAllPostWithLimit = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.limit || !data.offset) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }
      let objectQuery = {
        limit: +data.limit,
        offset: +data.offset,

        attributes: {
          exclude: ["detailPostId"],
        },
        where: {
          statusCode: "APPROVED",
        },
        nest: true,
        raw: true,
        include: [
          {
            model: db.DetailPost,
            as: "postDetailData",
            attributes: ["id", "name", "description", "amount"],
            include: [
              {
                model: db.Allcode,
                as: "jobTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "workTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "salaryTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "jobLevelPostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "expTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "genderPostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "provincePostData",
                attributes: ["value", "code"],
              },
            ],
          },
          {
            model: db.User,
            as: "userPostData",
            attributes: {
              exclude: ["password", "userId", "image"],
            },
            include: [
              {
                model: db.Company,
                as: "userCompanyData",
              },
            ],
          },
        ],
      };
      if (data.searchKey) {
        objectQuery.where = {
          ...objectQuery.where,
          [Op.or]: [
            db.Sequelize.where(db.Sequelize.col("postDetailData.name"), {
              [Op.like]: `%${data.searchKey}%`,
            }),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.categoryJobCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.salaryJobCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.experienceJobCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
            db.Sequelize.where(db.Sequelize.col("postDetailData.addressCode"), {
              [Op.eq]: data.searchKey,
            }),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.jobLevelCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.workTypeCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.genderPostCode"),
              {
                [Op.eq]: data.searchKey,
              }
            ),
          ],
        };
      }
      let post = await db.Post.findAndCountAll(objectQuery);
      if (post) {
        resolve({
          errCode: 0,
          data: post.rows,
          count: post.count,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let objectQuery = {
        attributes: { exclude: ["detailPostId"] },
        nest: true,
        raw: true,
        include: [
          {
            model: db.DetailPost,
            as: "postDetailData",
            attributes: ["id", "name", "description", "amount"],
            include: [
              {
                model: db.Allcode,
                as: "jobTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "workTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "salaryTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "jobLevelPostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "expTypePostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "genderPostData",
                attributes: ["value", "code"],
              },
              {
                model: db.Allcode,
                as: "provincePostData",
                attributes: ["value", "code"],
              },
            ],
          },
          {
            model: db.User,
            as: "userPostData",
            attributes: {
              exclude: ["password", "userId", "image"],
            },
            include: [
              {
                model: db.Company,
                as: "userCompanyData",
              },
            ],
          },
        ],
      };
      if (data.searchKey) {
        objectQuery.where = {
          ...objectQuery.where,
          [Op.or]: [
            db.Sequelize.where(db.Sequelize.col("postDetailData.name"), {
              [Op.like]: `%${data.searchKey}%`,
            }),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.categoryJobCode"),
              {
                [Op.like]: `%${data.searchKey}%`,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.salaryJobCode"),
              {
                [Op.like]: `%${data.searchKey}%`,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.experienceJobCode"),
              {
                [Op.like]: `%${data.searchKey}%`,
              }
            ),
            db.Sequelize.where(db.Sequelize.col("postDetailData.addressCode"), {
              [Op.like]: `%${data.searchKey}%`,
            }),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.workTypeCode"),
              {
                [Op.like]: `%${data.searchKey}%`,
              }
            ),
            db.Sequelize.where(
              db.Sequelize.col("postDetailData.jobLevelCode"),
              {
                [Op.like]: `%${data.searchKey}%`,
              }
            ),
          ],
        };
      }
      let post = await db.Post.findAndCountAll(objectQuery);
      if (post) {
        resolve({
          errCode: 0,
          message: "Get all post success",
          data: post.rows,
          count: post.count,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleCreateNewPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.categoryJobCode ||
        !data.addressCode ||
        !data.salaryJobCode ||
        !data.amount ||
        !data.timeEnd ||
        !data.jobLevelCode ||
        !data.userId ||
        !data.workTypeCode ||
        !data.experienceJobCode ||
        !data.genderPostCode ||
        !data.description ||
        !data.benefit ||
        !data.requirement ||
        !data.skillRequirement
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let checkNamePost = await db.DetailPost.findOne({
          where: { name: data.name },
        });
        if (checkNamePost) {
          return resolve({
            errCode: 2,
            errMessage: "Post name is exist",
          });
        }
        let user = await db.User.findOne({
          where: { id: data.userId },
          attributes: {
            exclude: ["password", "userId", "image"],
          },
        });
        let company = await db.Company.findOne({
          where: { id: user.companyId },
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "User is not company",
          });
        } else {
          if (company.statusCode === "APPROVED") {
            if (data.isHot === 1) {
              if (company.allowHotPost > 0) {
                company.allowHotPost -= 1;
                await company.save({ silent: true });
              } else {
                resolve({
                  errCode: 3,
                  errMessage: "Company is not enough hot post",
                });
              }
            }
            let detailPost = await db.DetailPost.create({
              name: data.name,
              categoryJobCode: data.categoryJobCode,
              addressCode: data.addressCode,
              salaryJobCode: data.salaryJobCode,
              amount: data.amount,
              jobLevelCode: data.jobLevelCode,
              workTypeCode: data.workTypeCode,
              experienceJobCode: data.experienceJobCode,
              genderPostCode: data.genderPostCode,
              description: data.description,
              requirement: data.requirement,
              skillRequirement: data.skillRequirement,
              benefit: data.benefit,
            });
            if (detailPost) {
              let post = await db.Post.create({
                detailPostId: detailPost.id,
                userId: data.userId,
                isHot: data.isHot,
                timePost: new Date().getTime(),
                timeEnd: data.timeEnd,
                statusCode: "PENDING",
              });
              if (post) {
                resolve({
                  errCode: 0,
                  errMessage: "Create post success",
                });
              } else {
                resolve({
                  errCode: 4,
                  errMessage: "Create post fail",
                });
              }
            }
          } else {
            resolve({
              errCode: 5,
              errMessage: "Company is not active",
            });
          }
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailPostById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let post = await db.Post.findOne({
          where: { id: id },
          attributes: {
            exclude: ["detailPostId"],
          },
          nest: true,
          raw: true,
          include: [
            {
              model: db.DetailPost,
              as: "postDetailData",

              include: [
                {
                  model: db.Allcode,
                  as: "jobTypePostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "workTypePostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "salaryTypePostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "jobLevelPostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "expTypePostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "genderPostData",
                  attributes: ["value", "code"],
                },
                {
                  model: db.Allcode,
                  as: "provincePostData",
                  attributes: ["value", "code"],
                },
              ],
            },
          ],
        });
        if (post) {
          let user = await db.User.findOne({
            where: { id: post.userId },
            attributes: {
              exclude: ["password", "userId", "image"],
            },
          });
          //console.log(user);
          let company = await db.Company.findOne({
            where: { id: user.companyId },
          });
          post.companyData = company;
          resolve({
            errCode: 0,
            data: post,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not get detail post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

let handleUpdatePost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.categoryJobCode ||
        !data.addressCode ||
        !data.salaryJobCode ||
        !data.amount ||
        !data.timeEnd ||
        !data.jobLevelCode ||
        !data.userId ||
        !data.workTypeCode ||
        !data.experienceJobCode ||
        !data.genderPostCode ||
        !data.description
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let post = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (post) {
          let ortherPost = await db.Post.findOne({
            where: {
              detailPostId: post.detailPostId,
              id: {
                [Op.ne]: post.id,
              },
            },
          });
          if (ortherPost) {
            let newDetailPost = await db.DetailPost.create({
              name: data.name,
              categoryJobCode: data.categoryJobCode,
              addressCode: data.addressCode,
              salaryJobCode: data.salaryJobCode,
              amount: data.amount,
              jobLevelCode: data.jobLevelCode,
              workTypeCode: data.workTypeCode,
              experienceJobCode: data.experienceJobCode,
              genderPostCode: data.genderPostCode,
              description: data.description,
            });
            post.detailPostId = newDetailPost.id;
          } else {
            let detailPost = await db.DetailPost.findOne({
              where: { id: post.detailPostId },
            });
            detailPost.name = data.name;
            detailPost.categoryJobCode = data.categoryJobCode;
            detailPost.addressCode = data.addressCode;
            detailPost.salaryJobCode = data.salaryJobCode;
            detailPost.amount = data.amount;
            detailPost.jobLevelCode = data.jobLevelCode;
            detailPost.workTypeCode = data.workTypeCode;
            detailPost.experienceJobCode = data.experienceJobCode;
            detailPost.genderPostCode = data.genderPostCode;
            detailPost.description = data.description;
            await detailPost.save({ silent: true });
          }
          post.userId = data.userId;
          post.statusCode = "PENDING";
          await post.save({ silent: true });
          resolve({
            errCode: 0,
            errMessage: "Update post success. Please wait for approve",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};
let handleBanPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.note) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundPost = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });

        if (foundPost) {
          foundPost.statusCode = "BANNED";
          foundPost.note = data.note;
          await foundPost.save({ silent: true });
          let user = await db.User.findOne({
            where: { id: foundPost.userId },
            raw: false,
          });
          //console.log(user);

          sendmail(
            `Your post has been banned with the reason ${data.note}`,
            user.email
          );
          resolve({
            errCode: 0,
            errMessage: "Ban post success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

let handleUnBanPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.userId || !data.note) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundPost = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (foundPost) {
          foundPost.statusCode = "APPROVED";
          foundPost.note = data.note;
          await foundPost.save({ silent: true });
          let user = await db.User.findOne({
            where: { id: foundPost.userId },
            raw: false,
          });
          sendmail(
            `Your post has been unbanned with the reason ${data.note}`,
            user.email
          );
          resolve({
            errCode: 0,
            errMessage: "Unban post success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

let handleApprovePost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundPost = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (foundPost) {
          foundPost.statusCode = "APPROVED";
          await foundPost.save({ silent: true });
          let user = await db.User.findOne({
            where: { id: foundPost.userId },
            raw: false,
          });
          let detailPost = await db.DetailPost.findOne({
            where: { id: foundPost.detailPostId },
          });
          sendmail(
            `Your post has been approved and is now displayed on the system`,
            user.email
          );
          let notification = await db.Notification.create({
            userId: user.id,
            content: `Your post "${detailPost.name}" has been approved and is now displayed on the system.`,
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = user.id.toString();
            //console.log("userSocket", userSocketId);
            global.ioGlobal.to(userSocketId).emit("postApproved", {
              message: notification.content,
            });
          }
          resolve({
            errCode: 0,
            errMessage: "Approve post success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleRejectPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.note) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundPost = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (foundPost) {
          foundPost.statusCode = "REJECTED";
          foundPost.note = data.note;
          await foundPost.save({ silent: true });
          let user = await db.User.findOne({
            where: { id: foundPost.userId },
            raw: false,
          });
          let detailPost = await db.DetailPost.findOne({
            where: { id: foundPost.detailPostId },
          });
          sendmail(
            `Your post has been rejected with the reason: ${data.note}`,
            user.email
          );
          let notification = await db.Notification.create({
            userId: user.id,
            content: `Your post "${detailPost.name}" has been rejected with the reason: ${data.note}`,
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = user.id.toString();
            //console.log("userSocket", userSocketId);
            global.ioGlobal.to(userSocketId).emit("postRejected", {
              message: notification.content,
            });
          }
          resolve({
            errCode: 0,
            errMessage: "Reject post success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

let handleClosePost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundPost = await db.Post.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (foundPost) {
          foundPost.statusCode = "CLOSED";
          await foundPost.save({ silent: true });

          resolve({
            errCode: 0,
            errMessage: "Close post success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Can not find post by id",
          });
        }
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

let handleReupPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.userId || !data.timeEnd) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          raw: false,
        });
        let company = await db.Company.findOne({
          where: { id: user.companyId },
          raw: true,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "User is not company",
          });
        } else {
          let post = await db.Post.findOne({
            where: { id: data.id },
          });
          if (!post) {
            resolve({
              errCode: 3,
              errMessage: "Can not find post by id",
            });
          } else {
            if (post.isHot === "1") {
              if (company.allowHotPost > 0) {
                company.allowHotPost -= 1;
                await company.save({ silent: true });
              } else {
                resolve({
                  errCode: 4,
                  errMessage: "Company is not enough hot post",
                });
              }
            }
            await db.Post.update({
              timeEnd: data.timeEnd,
              statusCode: "PENDING",
              userId: data.userId,
            });
            resolve({
              errCode: 0,
              errMessage: "Reup post success and wait for approve",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAllPost: getAllPost,
  getAllPostWithLimit: getAllPostWithLimit,
  handleCreateNewPost: handleCreateNewPost,
  getDetailPostById: getDetailPostById,
  handleUpdatePost: handleUpdatePost,
  handleBanPost: handleBanPost,
  handleUnBanPost: handleUnBanPost,
  handleApprovePost: handleApprovePost,
  handleRejectPost: handleRejectPost,
  handleReupPost: handleReupPost,
  handleClosePost: handleClosePost,
};
