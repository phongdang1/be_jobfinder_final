import e from "express";
import db from "../models/index";
import { Op, where } from "sequelize";
import { raw } from "body-parser";
const cloudinary = require("../utils/cloudinary");

var nodemailer = require("nodemailer");
let sendmail = (note, reason, userMail, nameCompany = null) => {
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
            <p>Hello, ${nameCompany}</p>
            <p>${note}</p>
            <p>Reason: ${reason}</p>
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

let checkCompanyUpdate = (name, companyId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name || !companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: {
            name: name,
            id: { [Op.ne]: companyId },
          },
        });
        if (company) {
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
let checkCompany = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: {
            name: name,
          },
        });
        if (company) {
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
let getAllCompaniesWithLimit = (data) => {
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
          where: {
            statusCode: "APPROVED",
          },
        };
        if (data.searchKey) {
          objectQuery.where = {
            ...objectQuery.where,
            [Op.or]: [
              { name: { [Op.like]: `%${data.searchKey}%` } },
              { address: { [Op.like]: `%${data.searchKey}%` } },
            ],
          };
        }
        let result = await db.Company.findAndCountAll(objectQuery);
        resolve({
          errCode: 0,
          errMessage: "Get all companies succeed",
          data: result.rows ? result.rows : [],
          count: result.count ? result.count : 0,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllCompaniesWithLimitInactive = (data) => {
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
        };
        if (data.searchKey) {
          objectQuery.where = {
            ...objectQuery.where,
            [Op.or]: [
              { name: { [Op.like]: `%${data.searchKey}%` } },
              { address: { [Op.like]: `%${data.searchKey}%` } },
            ],
          };
        }
        let result = await db.Company.findAndCountAll(objectQuery);
        resolve({
          errCode: 0,
          errMessage: "Get all companies succeed",
          data: result.rows ? result.rows : [],
          count: result.count ? result.count : 0,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllCompaniesInactive = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let objectQuery = {};
      if (data.searchKey) {
        objectQuery.where = {
          ...objectQuery.where,
          [Op.or]: [
            { name: { [Op.like]: `%${data.searchKey}%` } },
            { address: { [Op.like]: `%${data.searchKey}%` } },
          ],
        };
      }
      let result = await db.Company.findAndCountAll(objectQuery);
      resolve({
        errCode: 0,
        errMessage: "Get all companies succeed",
        data: result.rows ? result.rows : [],
        count: result.count ? result.count : 0,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getAllCompanies = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let objectQuery = {
        where: { statusCode: "APPROVED" },
      };
      if (data.searchKey) {
        objectQuery.where = {
          ...objectQuery.where,
          [Op.or]: [
            { name: { [Op.like]: `%${data.searchKey}%` } },
            { address: { [Op.like]: `%${data.searchKey}%` } },
          ],
        };
      }
      let result = await db.Company.findAndCountAll(objectQuery);
      resolve({
        errCode: 0,
        errMessage: "Get all companies succeed",
        data: result.rows ? result.rows : [],
        count: result.count ? result.count : 0,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let handleCreateNewCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
        !data.description ||
        !data.phonenumber ||
        !data.amountEmployer ||
        !data.typeCompany ||
        !data.userId
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        if (await checkCompany(data.name)) {
          resolve({
            errCode: 2,
            errMessage: "Company is exist",
          });
        } else {
          let thumbnailUrl = "";
          let coverImageUrl = "";

          if (data.thumbnail) {
            const uploadedThumbnailResponse = await cloudinary.uploader.upload(
              data.thumbnail,
              {
                upload_preset: "ml_default",
              }
            );
            thumbnailUrl = uploadedThumbnailResponse.url;
          }
          if (data.coverimage) {
            const uploadedCoverImageResponse = await cloudinary.uploader.upload(
              data.coverimage,
              {
                upload_preset: "ml_default",
              }
            );
            coverImageUrl = uploadedCoverImageResponse.url;
          }
          let company = await db.Company.create({
            userId: data.userId,
            name: data.name,
            thumbnail: thumbnailUrl,
            coverimage: coverImageUrl,
            description: data.description,
            website: data.website,
            address: data.address,
            phonenumber: data.phonenumber,
            amountEmployer: data.amountEmployer,
            taxnumber: data.taxnumber,
            statusCode: "PENDING",
            typeCompany: data.typeCompany,
            file: data.file ? data.file : null,
            allowHotPost: 0,
            allowCv: 0,
          });
          let user = await db.User.findOne({
            where: { id: data.userId },
            raw: false,
            attributes: {
              exclude: ["password", "image", "userId"],
            },
          });
          if (user) {
            user.companyId = company.id;
            user.roleCode = "COMPANY";
            await user.save({ silent: true });
            resolve({
              errCode: 0,
              errMessage: "Create company succeed",
              data: company,
            });
          } else {
            resolve({
              errCode: 3,
              errMessage: "Cannot find user",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleAddUserToCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { id: data.companyId },
        });
        if (company) {
          let isExist = await db.User.findOne({
            where: { email: data.email },
          });
          if (isExist) {
            if (isExist.roleCode !== "EMPLOYER") {
              resolve({
                errCode: 2,
                errMessage: "User is not employer",
              });
            } else {
              if (isExist.companyId) {
                resolve({
                  errCode: 3,
                  errMessage: "User is already in a company",
                });
              } else {
                isExist.companyId = data.companyId;
                isExist.roleCode = "EMPLOYER";
                await isExist.save({ silent: true });
                resolve({
                  errCode: 0,
                  errMessage: "Add user to company succeed",
                });
              }
            }
          } else {
            resolve({
              errCode: 4,
              errMessage: "Cannot find user",
            });
          }
        } else {
          resolve({
            errCode: 4,
            errMessage: "Cannot find company",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getCompanyById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { id: id },
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          let listUserOfCompany = await db.User.findAll({
            where: { companyId: company.id },
            attributes: ["id", "email", "firstName", "lastName"],
          });
          company.userData = listUserOfCompany;
          listUserOfCompany = listUserOfCompany.map((item) => {
            return {
              userId: item.id,
            };
          });

          company.postData = await db.Post.findAll({
            where: {
              [Op.and]: [{ [Op.or]: listUserOfCompany }],
            },
            order: [["timePost", "DESC"]],
            limit: 5,
            offset: 0,
            attributes: {
              exclude: ["detailPostId"],
            },
            nest: true,
            raw: true,
            include: [
              {
                model: db.DetailPost,
                as: "postDetailData",
                attributes: [
                  "id",
                  "name",
                  "description",
                  "amount",
                  "requirement",
                  "skillRequirement",
                  "benefit",
                ],
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
          if (company.file) {
            company.file = Buffer.from(company.file).toString("base64");
          }
          resolve({
            errCode: 0,
            errMessage: "Get company succeed",
            data: company,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleUpdateCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          if (await checkCompanyUpdate(data.name, data.companyId)) {
            resolve({
              errCode: 3,
              errMessage: "Company is exist",
            });
          } else {
            if (company.statusCode === "APPROVED") {
              let thumbnailUrl = "";
              let coverImageUrl = "";
              if (data.thumbnail) {
                const uploadedThumbnailResponse =
                  await cloudinary.uploader.upload(data.thumbnail, {
                    upload_preset: "ml_default",
                  });
                thumbnailUrl = uploadedThumbnailResponse.url;
              }
              if (data.coverimage) {
                const uploadedCoverImageResponse =
                  await cloudinary.uploader.upload(data.coverimage, {
                    upload_preset: "ml_default",
                  });
                coverImageUrl = uploadedCoverImageResponse.url;
              }
              company.name = data.name ? data.name : company.name;
              company.thumbnail = thumbnailUrl
                ? thumbnailUrl
                : company.thumbnail;
              company.coverimage = coverImageUrl
                ? coverImageUrl
                : company.coverimage;
              company.description = data.description
                ? data.description
                : company.description;
              company.website = data.website ? data.website : company.website;
              company.address = data.address ? data.address : company.address;
              company.phonenumber = data.phonenumber
                ? data.phonenumber
                : company.phonenumber;
              company.amountEmployer = data.amountEmployer
                ? data.amountEmployer
                : company.amountEmployer;
              company.taxnumber = data.taxnumber
                ? data.taxnumber
                : company.taxnumber;
              company.typeCompany = data.typeCompany
                ? data.typeCompany
                : company.typeCompany;
              company.file = data.file ? data.file : company.file;
              company.updatedAt = new Date();
              await company.save({ silent: true });
              resolve({
                errCode: 0,
                errMessage: "Update company succeed",
                data: company,
              });
            } else {
              resolve({
                errCode: 4,
                errMessage: "Company is not active. Cannot update",
              });
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleBanCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId || !data.reason) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundCompany = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });

        if (!foundCompany) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          foundCompany.statusCode = "BANNED";
          await foundCompany.save();
          let user = await db.User.findOne({
            where: { id: foundCompany.userId },
            raw: false,
            attributes: {
              exclude: ["password", "image", "userId"],
            },
          });
          sendmail(
            "Company has been banned. Please contact admin for more information",
            data.reason,
            user.email,
            foundCompany.name
          );
          resolve({
            errCode: 0,
            errMessage: "Ban company succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleUnBanCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundCompany = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });
        if (!foundCompany) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          foundCompany.statusCode = "APPROVED";
          await foundCompany.save({ silent: true });
          let user = await db.User.findOne({
            where: { id: foundCompany.userId },
            raw: false,
            attributes: {
              exclude: ["password", "image", "userId"],
            },
          });
          sendmail(
            "Công ty của bạn đã được mở khóa. Bạn có thể sử dụng dịch vụ bình thường",
            user.email
          );

          resolve({
            errCode: 0,
            errMessage: "Unban company succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getCompanyByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { userId: userId },
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          if (company.file) {
            company.file = Buffer.from(company.file, "base64").toString(
              "binary"
            );
          }
          resolve({
            errCode: 0,
            errMessage: "Get company succeed",
            data: company,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllUserOfCompany = (companyId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { id: companyId },
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          let listUserOfCompany = await db.User.findAndCountAll({
            where: { companyId: company.id },
            attributes: ["id", "email", "lastName", "firstName"],
          });
          resolve({
            errCode: 0,
            errMessage: "Get all user of company succeed",
            data: listUserOfCompany.rows,
            count: listUserOfCompany.count,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleApproveCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundCompany = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });
        if (!foundCompany) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          foundCompany.statusCode = "APPROVED";
          await foundCompany.save();
          let user = await db.User.findOne({
            where: { id: foundCompany.userId },
            raw: false,
            attributes: {
              exclude: ["password", "image", "userId", "file"],
            },
          });
          let note =
            "Công ty của bạn đã được duyệt. Hãy đăng nhập và sử dụng dịch vụ của chúng tôi";
          sendmail(note, user.email);
          let notification = await db.Notification.create({
            userId: user.id,
            content: "Your company has been approved!",
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = user.id.toString();

            global.ioGlobal.to(userSocketId).emit("companyApproved", {
              message: notification.content,
              companyId: foundCompany.id,
            });
          }
          resolve({
            errCode: 0,
            errMessage: "Approve company succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let handleRejectCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let foundCompany = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });
        if (!foundCompany) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          foundCompany.statusCode = "REJECTED";
          await foundCompany.save();
          let user = await db.User.findOne({
            where: { id: foundCompany.userId },
            raw: false,
            attributes: {
              exclude: ["password", "image", "userId", "file"],
            },
          });
          let note =
            "Công ty của bạn đã bị từ chối. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết";
          sendmail(note, user.email);
          let notification = await db.Notification.create({
            userId: user.id,
            content: "Your company has been rejected!",
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = user.id.toString();
            global.ioGlobal.to(userSocketId).emit("companyReject", {
              message: notification.content,
              companyId: foundCompany.id,
            });
          }

          resolve({
            errCode: 0,
            errMessage: "Reject company succeed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getPointOfCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { id: data.companyId },
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          let listUserOfCompany = await db.User.findAll({
            where: { companyId: company.id },
            attributes: ["id", "point"],
          });
          resolve({
            errCode: 0,
            errMessage: "Get all user of company succeed",
            data: listUserOfCompany,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let exchangePointToPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.point || !data.value) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { userId: data.userId },
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          let user = await db.User.findOne({
            where: { id: data.userId },
            raw: false,
          });
          if (!user) {
            resolve({
              errCode: 3,
              errMessage: "Cannot find user",
            });
          } else {
            if (user.point <= data.point) {
              resolve({
                errCode: 4,
                errMessage: "Not enough point",
              });
            } else {
              user.point -= data.point;
              company.allowHotPost += data.value;
              await user.save();
              await company.save();
              resolve({
                errCode: 0,
                errMessage: "Exchange point succeed",
              });
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let exchangePointToView = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.point || !data.value) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let company = await db.Company.findOne({
          where: { userId: data.userId },
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Cannot find company",
          });
        } else {
          let user = await db.User.findOne({
            where: { id: data.userId },
            raw: false,
          });
          if (!user) {
            resolve({
              errCode: 3,
              errMessage: "Cannot find user",
            });
          } else {
            if (user.point <= data.point) {
              resolve({
                errCode: 4,
                errMessage: "Not enough point",
              });
            } else {
              user.point -= data.point;
              company.allowCv += data.value;
              await user.save();
              await company.save();
              resolve({
                errCode: 0,
                errMessage: "Exchange point succeed",
              });
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAllCompaniesWithLimit: getAllCompaniesWithLimit,
  getAllCompanies: getAllCompanies,
  handleCreateNewCompany: handleCreateNewCompany,
  handleAddUserToCompany: handleAddUserToCompany,
  getCompanyById: getCompanyById,
  handleUpdateCompany: handleUpdateCompany,
  handleBanCompany: handleBanCompany,
  handleUnBanCompany: handleUnBanCompany,
  getCompanyByUserId: getCompanyByUserId,
  getAllUserOfCompany: getAllUserOfCompany,
  handleApproveCompany: handleApproveCompany,
  getAllCompaniesWithLimitInactive: getAllCompaniesWithLimitInactive,
  handleRejectCompany: handleRejectCompany,
  getAllCompaniesInactive: getAllCompaniesInactive,
  getPointOfCompany: getPointOfCompany,
  exchangePointToPost: exchangePointToPost,
  exchangePointToView: exchangePointToView,
};
