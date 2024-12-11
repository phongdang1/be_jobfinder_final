import e from "express";
import db from "../models/index";
import CommonUtils from "../utils/CommonUtils";
import { raw } from "body-parser";
const { Op, and, where } = require("sequelize");
const stringSimilarity = require("string-similarity");

var nodemailer = require("nodemailer");
let sendmail = (
  interviewDate,
  interviewLocation,
  interviewNote,
  user,
  company,
  detailPost
) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL_APP,
    to: user.email,
    subject: `Interview Invitation from Job Finder`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Invitation from ${company.name}</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello, ${user.lastName}</p>
            <p>You have received an interview invitation from ${company.name}.</p>
            <p><strong>Position:</strong> ${detailPost.name}</p>
            <p><strong>Interview Date:</strong> ${interviewDate}</p>
            <p><strong>Interview Location:</strong> ${interviewLocation}</p>
            <p><strong>Note:</strong> ${interviewNote}</p>
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
let sendmailInviteApplyJob = (user, company, detailPost, link = null) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL_APP,
    to: user.email,
    subject: `Invitation to Apply for a Job at ${company.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Application Invitation</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; color: #333; text-align: center;">
        <div style="background-color: #ffffff; max-width: 600px; margin: 40px auto; border: 1px solid #d0d0d0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); padding: 30px; text-align: center;">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 28px;">Job Finder</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Hello, ${user.lastName}</p>
            <p>We are excited to invite you to apply for a position at <strong>${
              company.name
            }</strong>.</p>
            <p><strong>Position:</strong> ${detailPost.name}</p>
            ${
              link
                ? `<p>You can view more details and submit your application by clicking the button below:</p>
                   <a href="${process.env.URL_REACT}/job-detail/${link}" style="display: inline-block; margin-top: 20px; padding: 14px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease, box-shadow 0.3s ease; box-sizing: border-box; width: auto; max-width: 100%;">Apply Now</a>`
                : `<p>Please visit our website for more details on how to apply.</p>`
            }
          </div>
          <div style="padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #d0d0d0;">
            <p>Thank you for considering a career at ${
              company.name
            }. We look forward to receiving your application!</p>
            
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

let calculateMatchCv = async (file, mapRequired) => {
  try {
    let match = 0;
    let words = await CommonUtils.pdfToString(file);

    for (let key of mapRequired.keys()) {
      let requiredKeyword = mapRequired.get(key).toLowerCase().trim();

      for (let word of words) {
        let wordLower = word.toLowerCase().trim();
        // Tính độ tương đồng giữa từ trong file cv và từ yêu cầu bằng thuật toán string-similarity
        let similarityScore = stringSimilarity.compareTwoStrings(
          requiredKeyword,
          wordLower
        );

        // Nếu mức độ tương đồng lớn hơn 0.8, coi như khớp
        if (similarityScore > 0.8) {
          match++;
        }
      }
    }

    let totalRequiredKeywords = mapRequired.size;
    let matchRatio = (match / totalRequiredKeywords) * 100;

    return matchRatio;
  } catch (err) {
    console.error("Error calculating CV match:", err);
    return 0;
  }
};

let caculateMatchUserWithFilter = async (userData, listSkillRequired) => {
  let match = 0;
  let myListSkillRequired = new Map();
  listSkillRequired.forEach((item) => {
    myListSkillRequired.set(item.id, item.name);
  });

  let userskill = await db.UserSkill.findAll({
    where: { userId: userData.userId },
  });
  let totalUserSkill = userskill.length;
  for (let key of myListSkillRequired.keys()) {
    let temp = [...userskill];
    temp.forEach((item, index) => {
      if (item.skillId === key) {
        userskill.splice(index, 1);
        match++;
      }
    });
  }

  return {
    match: match,
    totalUserSkill: totalUserSkill,
  };
};
let getMapRequiredSkill = async (userId, skillRequirement) => {
  try {
    let match = 0;
    let listSkillRequired = await db.UserSkill.findAll({
      where: { userId: userId },
      include: [
        {
          model: db.Skill,
          as: "skillData",
          attributes: ["id", "name"],
        },
      ],
      raw: true,
      nest: true,
    });

    let mapListSkill = new Map();
    listSkillRequired.forEach((item) => {
      mapListSkill.set(
        item.skillData.name.toLowerCase(),
        item.skillData.name.toLowerCase()
      );
    });
    skillRequirement.forEach((item) => {
      if (mapListSkill.has(item.toLowerCase())) {
        match++;
      }
    });
    let totalRequiredSkills = skillRequirement.length;
    let matchRatio = (match / totalRequiredSkills) * 100;
    return matchRatio;
  } catch (err) {
    console.error("Error calculating skill match:", err);
    return 0;
  }
};

let handleApplyJob = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.postId || !data.description) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let checkApply = await db.CvPost.findOne({
          where: {
            userId: data.userId,
            postId: data.postId,
          },
        });
        if (checkApply) {
          return resolve({
            errCode: 3,
            errMessage: "You have already applied for this job",
          });
        }
        let user = await db.UserDetail.findOne({
          where: { userId: data.userId },
          attributes: ["file", "userId"],
        });
        let isVerify = await db.User.findOne({
          where: { id: user.userId },
          attributes: ["isVerify"],
        });
        if (!user || !user.file) {
          return resolve({
            errCode: 2,
            errMessage: "Please upload your CV before applying for a job",
          });
        }
        if (isVerify.isVerify === 0) {
          return resolve({
            errCode: 4,
            errMessage:
              "Your account is not verified. Please verify your account before applying for a job",
          });
        }
        let cvApply = await db.CvPost.create({
          userId: data.userId,
          postId: data.postId,
          file: user.file,
          description: data.description,
          isChecked: 0,
          statusCode: "PENDING",
        });
        if (cvApply) {
          let post = await db.Post.findOne({
            where: { id: data.postId },
          });
          let detailPost = await db.DetailPost.findOne({
            where: { id: post.detailPostId },
          });

          let notification = await db.Notification.create({
            userId: post.userId,
            content: `Your post ${detailPost.name} has a new application.`,
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = post.userId.toString();

            global.ioGlobal.to(userSocketId).emit("applyJob", {
              message: notification.content,
            });
          }
          resolve({
            errCode: 0,
            errMessage: "Apply job success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Apply job failed",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllListCvByPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.postId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let listCv = await db.CvPost.findAndCountAll({
          where: { postId: data.postId },
          nest: true,
          raw: true,
          include: [
            {
              model: db.User,
              as: "userCvData",
              attributes: {
                exclude: ["password", "userId", "image", "companyId", "file"],
              },
            },
          ],
        });
        let postInfo = await db.Post.findOne({
          where: { id: data.postId },
          raw: true,
          nest: true,
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
                "benefit",
                "skillRequirement",
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
        });
        let skillRequirement = CommonUtils.flatAllString(
          postInfo.postDetailData.skillRequirement
        );
        let mapRequired = new Map();
        skillRequirement.forEach((item) => {
          mapRequired.set(item, item);
        });

        for (let i = 0; i < listCv.rows.length; i++) {
          let cv = listCv.rows[i];

          let match = Math.ceil(await calculateMatchCv(cv.file, mapRequired)); // lấy phần nguyên
          let matchSkill = Math.ceil(
            await getMapRequiredSkill(cv.userId, skillRequirement)
          );
          if (match > matchSkill) {
            cv.file = match + "%";
          } else {
            cv.file = matchSkill + "%";
          }
        }
        resolve({
          errCode: 0,
          message: "Get list cv success",
          data: listCv.rows,
          count: listCv.count,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getDetailCvPostById = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.cvPostId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let cvDetail = await db.CvPost.findOne({
          where: { id: data.cvPostId },
          include: [
            {
              model: db.User,
              as: "userCvData",
              attributes: {
                exclude: ["password", "userId", "image", "companyId", "file"],
              },
            },
          ],
          raw: false,
          nest: true,
        });
        let user = await db.User.findOne({
          where: { id: data.userId },
        });
        if (user.roleCode !== "USER") {
          cvDetail.isChecked = 1;
          await cvDetail.save();
        }
        resolve({
          errCode: 0,
          data: cvDetail,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllCvPostByUserId = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let listCv = await db.CvPost.findAndCountAll({
          where: { userId: data.userId },
          include: [
            {
              model: db.Post,
              as: "postCvData",
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
            },
          ],
          raw: true,
          nest: true,
        });
        resolve({
          errCode: 0,
          data: listCv.rows,
          count: listCv.count,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllCvPostByCompanyId = async (data) => {
  try {
    if (!data.companyId) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter",
      };
    }
    const listUserOfCompany = await db.User.findAll({
      where: { companyId: data.companyId },
      attributes: ["id"],
    });
    if (!listUserOfCompany || listUserOfCompany.length === 0) {
      return {
        errCode: 2,
        errMessage: "List user of company not found",
      };
    }
    const userIds = listUserOfCompany.map((user) => user.id);
    const listPosts = await db.Post.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      attributes: ["id"],
    });

    if (!listPosts || listPosts.length === 0) {
      return {
        errCode: 3,
        errMessage: "No posts found for the company's users",
      };
    }
    const postIds = listPosts.map((post) => post.id);
    const listCv = await db.CvPost.findAndCountAll({
      where: {
        postId: {
          [Op.in]: postIds,
        },
      },
      attributes: ["id", "userId", "postId", "description", "isChecked"],
      include: [
        {
          model: db.Post,
          as: "postCvData",
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
        },
      ],
      raw: true,
      nest: true,
    });

    return {
      errCode: 0,
      data: listCv.rows,
      count: listCv.count,
    };
  } catch (error) {
    console.error("Error fetching CVs: ", error);
    return {
      errCode: 500,
      errMessage: "An error occurred while fetching CVs",
    };
  }
};

let getAllCvPostByCompanyId7Day = async (data) => {
  try {
    if (!data.companyId) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter",
      };
    }
    const listUserOfCompany = await db.User.findAll({
      where: { companyId: data.companyId },
      attributes: ["id"],
    });
    if (!listUserOfCompany || listUserOfCompany.length === 0) {
      return {
        errCode: 2,
        errMessage: "List user of company not found",
      };
    }
    const userIds = listUserOfCompany.map((user) => user.id);
    const listPosts = await db.Post.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      attributes: ["id"],
    });

    if (!listPosts || listPosts.length === 0) {
      return {
        errCode: 3,
        errMessage: "No posts found for the company's users",
      };
    }
    const postIds = listPosts.map((post) => post.id);

    // Tính ngày 7 ngày trước từ hiện tại
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    //console.log("sevenDaysAgo", sevenDaysAgo);

    const listCv = await db.CvPost.findAndCountAll({
      where: {
        postId: {
          [Op.in]: postIds,
        },
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      attributes: ["id", "userId", "postId", "description", "isChecked"],
      include: [
        {
          model: db.Post,
          as: "postCvData",
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
        },
      ],
      raw: true,
      nest: true,
    });

    return {
      errCode: 0,
      data: listCv.rows,
      count: listCv.count,
    };
  } catch (error) {
    console.error("Error fetching CVs: ", error);
    return {
      errCode: 500,
      errMessage: "An error occurred while fetching CVs",
    };
  }
};

let handleFindCv = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let objectQuery = {
        where: {
          isFindJob: 1,
          file: {
            [Op.ne]: null,
          },
        },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.User,
            as: "UserDetailData",
            attributes: {
              exclude: ["password"],
            },
          },
        ],
        raw: true,
        nest: true,
      };
      if (data.categoryJobCode) {
        objectQuery.where = {
          ...objectQuery.where,
          categoryJobCode: data.categoryJobCode,
        };
      }
      let isHiddenPercent = false;
      let listUser = await db.UserDetail.findAndCountAll(objectQuery);
      let listSkillRequired = [];
      let numberCriteria = 0; // số lượng tiêu chí của nhà tuyển dụng cần tìm kiếm
      if (data.experienceJobCode) {
        numberCriteria++;
      }

      if (data.salaryJobCode) {
        numberCriteria++;
      }
      if (data.addressCode) {
        numberCriteria++;
      }
      if (data.genderCode) {
        numberCriteria++;
      }
      if (data.jobLevelCode) {
        numberCriteria++;
      }
      if (data.workTypeCode) {
        numberCriteria++;
      }
      //nếu có tiêu chí thì thực hiện tính số tiêu chí của user
      if (numberCriteria > 0) {
        listUser.rows.forEach((item) => {
          // số tiêu chí của user
          // nếu user có trùng với tiêu chí của nhà tuyển dụng thì tăng số tiêu chí của user lên
          item.numberCriteriaOfUser = 0;
          if (item.salaryJobCode === data.salaryJobCode) {
            item.numberCriteriaOfUser++;
          }
          if (item.experienceJobCode === data.experienceJobCode) {
            item.numberCriteriaOfUser++;
          }
          if (item.addressCode === data.addressCode) {
            item.numberCriteriaOfUser++;
          }
          if (item.genderCode === data.genderCode) {
            item.numberCriteriaOfUser++;
          }
          if (item.jobLevelCode === data.jobLevelCode) {
            item.numberCriteriaOfUser++;
          }
          if (item.workTypeCode === data.workTypeCode) {
            item.numberCriteriaOfUser++;
          }
        });
      }
      let lengthSkill = 0;
      if (data.listSkills) {
        // số lượng skill của nhà tuyển dụng cần tìm kiếm
        lengthSkill = data.listSkills.length;
        listSkillRequired = await db.Skill.findAll({
          where: {
            id: data.listSkills,
          },
          attributes: ["id", "name"],
        });
      }
      if (listSkillRequired.length > 0 || numberCriteria > 0) {
        for (let item of listUser.rows) {
          let match = await caculateMatchUserWithFilter(
            item,
            listSkillRequired
          );
          if (numberCriteria > 0) {
            item.file =
              Math.round(
                ((match.match + item.numberCriteriaOfUser) /
                  (lengthSkill + numberCriteria) +
                  Number.EPSILON) *
                  100
              ) + "%";
            item.totalUserSkill = match.totalUserSkill;
          } else {
            item.file =
              Math.round((match.match / lengthSkill + Number.EPSILON) * 100) +
              "%";
            item.totalUserSkill = match.totalUserSkill;
          }
        }
      } else {
        isHiddenPercent = true;
        listUser.rows.forEach((item) => {
          item.file = "0%";
        });
      }

      resolve({
        errCode: 0,
        message: "Filter user success",
        data: listUser.rows,
        count: listUser.count,
        isHiddenPercent: isHiddenPercent,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let checkViewCompany = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let company = await db.Company.findOne({
          where: { userId: data.userId },
          attributes: ["id", "allowCv"],
          raw: false,
        });
        if (!company) {
          resolve({
            errCode: 2,
            errMessage: "Company not found",
          });
        } else {
          if (company.allowCv > 0) {
            company.allowCv -= 1;
            await company.save();
            resolve({
              errCode: 0,
              message: "Check view company success",
              allowCv: company.allowCv,
            });
          } else {
            resolve({
              errCode: 3,
              errMessage: "You have reached the limit of viewing company",
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let createInterviewSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    if (
      !data.interviewDate ||
      !data.interviewLocation ||
      !data.interviewNote ||
      !data.cvPostId ||
      !data.companyId
    ) {
      resolve({
        errCode: 1,
        errMessage: "Missing required parameter",
      });
    } else {
      try {
        let checkInterview = await db.Interview.findOne({
          where: { cvPostId: data.cvPostId },
          raw: false,
        });
        if (checkInterview) {
          return resolve({
            errCode: 2,
            errMessage:
              "This cv post has already been scheduled for an interview",
          });
        }
        let interview = await db.Interview.create({
          interviewDate: data.interviewDate,
          interviewLocation: data.interviewLocation,
          interviewNote: data.interviewNote,
          cvPostId: data.cvPostId,
          statusCode: "PENDING",
        });
        if (interview) {
          let cvPost = await db.CvPost.findOne({
            where: { id: data.cvPostId },
            raw: false,
          });
          cvPost.statusCode = "INTERVIEW";
          await cvPost.save();
          let user = await db.User.findOne({
            where: { id: cvPost.userId },
            raw: false,
          });
          let company = await db.Company.findOne({
            where: { id: data.companyId },
            raw: false,
          });
          let post = await db.Post.findOne({
            where: { id: cvPost.postId },
            raw: false,
          });
          let detailPost = await db.DetailPost.findOne({
            where: { id: post.detailPostId },
            raw: false,
          });
          sendmail(
            data.interviewDate,
            data.interviewLocation,
            data.interviewNote,
            user,
            company,
            detailPost
          );
          let notification = await db.Notification.create({
            userId: user.id,
            content:
              "Congratulations! You have been selected for the interview. Please check your email for more details",
            isChecked: 0,
          });
          if (notification) {
            let userSocketId = user.id.toString();
            //console.log("userSocket", userSocketId);
            global.ioGlobal.to(userSocketId).emit("cvPostInterView", {
              message: notification.content,
            });
          }
          resolve({
            errCode: 0,
            errMessage: "Create interview schedule success",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Create interview schedule failed",
          });
        }
      } catch (error) {
        reject(error);
      }
    }
  });
};
let handleApproveCvPost = (data) => {
  return new Promise(async (resolve, reject) => {
    if (!data.cvPostId) {
      resolve({
        errCode: 1,
        errMessage: "Missing required parameter",
      });
    } else {
      try {
        let interview = await db.Interview.findOne({
          where: { cvPostId: data.cvPostId },
          raw: false,
        });
        interview.statusCode = "APPROVED";
        await interview.save();
        let cvPost = await db.CvPost.findOne({
          where: { id: data.cvPostId },
          raw: false,
        });
        cvPost.statusCode = "APPROVED";
        await cvPost.save();
        let notification = await db.Notification.create({
          userId: cvPost.userId,
          content:
            "Congratulations! You have completed and passed the interview",
          isChecked: 0,
        });
        if (notification) {
          let userSocketId = cvPost.userId.toString();
          //console.log("userSocket", userSocketId);
          global.ioGlobal.to(userSocketId).emit("cvPostApproved", {
            message: notification.content,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Approve cv post success",
        });
      } catch (error) {
        reject(error);
      }
    }
  });
};

let handleRejectCvPost = (data) => {
  return new Promise(async (resolve, reject) => {
    if (!data.cvPostId) {
      resolve({
        errCode: 1,
        errMessage: "Missing required parameter",
      });
    } else {
      try {
        let cvPost = await db.CvPost.findOne({
          where: { id: data.cvPostId },
          raw: false,
        });
        cvPost.statusCode = "REJECTED";
        await cvPost.save();
        let interview = await db.Interview.findOne({
          where: { cvPostId: data.cvPostId },
          raw: false,
        });
        if (interview) {
          interview.statusCode = "REJECTED";
          await interview.save();
        }
        let notification = await db.Notification.create({
          userId: cvPost.userId,
          content:
            "We are sorry to inform you that you have not been selected for the interview",
          isChecked: 0,
        });
        if (notification) {
          let userSocketId = cvPost.userId.toString();
          //console.log("userSocket", userSocketId);
          global.ioGlobal.to(userSocketId).emit("cvPostRejected", {
            message: notification.content,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Reject cv post success",
        });
      } catch (error) {
        reject(error);
      }
    }
  });
};

let getAllInterViewSchedule = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let listInterview = await db.Interview.findAndCountAll({
        include: [
          {
            model: db.CvPost,
            as: "cvPostData",
            attributes: ["id", "postId", "description"],
            include: [
              {
                model: db.User,
                as: "userCvData",
                attributes: ["id", "email", "firstName", "lastName"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: listInterview.rows,
        count: listInterview.count,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getInterviewScheduleByCvPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let interview = await db.Interview.findOne({
        where: { cvPostId: data.cvPostId },
      });
      resolve({
        errCode: 0,
        data: interview,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let testCommon = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.UserDetail.findOne({
        where: { userId: 11 },
        attributes: ["file"],
      });
      let cvData = await CommonUtils.pdfToString(user.file);

      return resolve({
        errCode: 0,
        data: cvData,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let handleInviteApplyJob = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.postId || !data.companyId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let user = await db.User.findOne({
          where: { id: data.userId },
          attributes: ["id", "email", "firstName", "lastName"],
        });
        let company = await db.Company.findOne({
          where: { id: data.companyId },
          attributes: ["id", "name"],
        });
        let post = await db.Post.findOne({
          where: { id: data.postId },
          attributes: ["id", "userId", "detailPostId"],
        });
        let detailPost = await db.DetailPost.findOne({
          where: { id: post.detailPostId },
          attributes: ["id", "name"],
        });
        sendmailInviteApplyJob(user, company, detailPost, post.id);
        let notification = await db.Notification.create({
          userId: data.userId,
          content: `You have received an invitation to apply for the position ${detailPost.name} from ${company.name}. Please check your email for more details`,
          isChecked: 0,
        });
        if (notification) {
          let userSocketId = data.userId.toString();
          global.ioGlobal.to(userSocketId).emit("inviteApplyJob", {
            message: notification.content,
          });
        }

        resolve({
          errCode: 0,
          errMessage: "Invite apply job success",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleApplyJob: handleApplyJob,
  getAllListCvByPost: getAllListCvByPost,
  getDetailCvPostById: getDetailCvPostById,
  handleFindCv: handleFindCv,
  checkViewCompany: checkViewCompany,
  testCommon: testCommon,
  getAllCvPostByUserId: getAllCvPostByUserId,
  getAllCvPostByCompanyId: getAllCvPostByCompanyId,
  createInterviewSchedule: createInterviewSchedule,
  handleApproveCvPost: handleApproveCvPost,
  handleRejectCvPost: handleRejectCvPost,
  getAllInterViewSchedule: getAllInterViewSchedule,
  getInterviewScheduleByCvPost: getInterviewScheduleByCvPost,
  getAllCvPostByCompanyId7Day: getAllCvPostByCompanyId7Day,
  handleInviteApplyJob: handleInviteApplyJob,
};
