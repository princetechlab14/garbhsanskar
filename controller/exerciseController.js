const { Op } = require("sequelize");
const { ExerciseModel, LangModel } = require("../models");
const { deleteObjS3 } = require("../services/fileupload");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");

const exerciseSchema = Joi.object({
    name: Joi.string().required(),
    lang_id: Joi.number().integer().optional(),
    trimester_id: Joi.number().integer().optional(),
    benefits: Joi.string().allow(null, '').optional(),
    feeling: Joi.string().allow(null, '').optional(),
    instructions: Joi.string().allow(null, '').optional(),
    adjustments: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of exercise
const getIndex = async (req, res) => {
    try {
        res.render("exercise/index", { title: "Exercise List" });
    } catch (error) {
        console.error("Error fetching exercise:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create exercise form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("exercise/create", { title: "Create Exercise", error: '', languages });
    } catch (error) {
        console.error("Error fetching exercise create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new exercise
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = exerciseSchema.validate(req.body);
        if (error) return res.render("exercise/create", { title: "Exercise Create", error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        let imagePath = null;
        if (req.file) {
            if (process.env.STORAGE_DRIVER === "s3") {
                imagePath = req.file.location;
            } else {
                imagePath = "/uploads/" + req.file.key;
            }
        }
        const newData = { ...value, slug, image: imagePath };
        await ExerciseModel.create(newData);
        res.redirect("/admin/exercise");
    } catch (error) {
        console.error("Error creating exercise:", error);
        if (req.file && process.env.STORAGE_DRIVER === "s3" && req.file.location) {
            await deleteObjS3(req.file.location);
        }
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit exercise form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const exercise = await ExerciseModel.findByPk(id);
        if (!exercise) return res.status(404).send("Exercise not found");

        res.render("exercise/edit", { title: "Edit Exercise", exercise, error: '', languages });
    } catch (error) {
        console.error("Error fetching exercise for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the exercise
const update = async (req, res) => {
    const { id } = req.params;
    const awsBaseUrl = process.env.AWS_BASE_URL;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const exercise = await ExerciseModel.findByPk(id);
        if (!exercise) return res.status(404).send("Exercise not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = exerciseSchema.validate(req.body);
        if (error) return res.render("exercise/edit", { title: "Exercise Edit", exercise, error: error.details[0].message, languages });

        // Handle new image uploads
        let imagePath = exercise.image;
        if (req.file) {
            imagePath = req.file.location;
            if (exercise.image && exercise.image.startsWith(awsBaseUrl)) {
                await deleteObjS3(exercise.image);
            }
        } else if (value.image_url && value.image_url !== exercise.image) {
            imagePath = value.image_url;
            if (exercise.image && exercise.image.startsWith(awsBaseUrl)) {
                await deleteObjS3(exercise.image);
            }
        }

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const updateData = { ...value, slug, image: imagePath };
        await ExerciseModel.update(updateData, { where: { id } });
        res.redirect(`/admin/exercise`);
    } catch (error) {
        console.error("Error updating exercise:", error);
        if (req.file && process.env.STORAGE_DRIVER === "s3" && req.file.location) {
            await deleteObjS3(req.file.location);
        }
        res.status(500).send("Internal Server Error");
    }
};


// Delete a exercise post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const exercise = await ExerciseModel.findByPk(id);
        if (!exercise) return res.status(404).send("Exercise not found");
        await ExerciseModel.destroy({ where: { id: id } });
        res.redirect("/admin/exercise");
    } catch (error) {
        console.error("Error deleting exercise:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await ExerciseModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await ExerciseModel.update({ status }, { where: { id } });
            if (update) {
                res.send({ success: true });
            } else {
                res.status(500).render("error", { error: "Internal Server Error" });
            }
        } catch (error) {
            res.status(500).render("error", { error: "Internal Server Error" });
        }
    } else {
        res.status(500).render("error", { error: "Internal Server Error" });
    }
};


const getData = async (req, res) => {
    try {
        let { page, limit, search, order, column } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        let whereCondition = {};
        if (search) {
            whereCondition = {
                [Op.or]: [
                    { id: { [Op.like]: `%${search}%` } },
                    { name: { [Op.like]: `%${search}%` } },
                    { shorting: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ],
            };
        }
        let orderBy = [["id", "DESC"]];
        if (column && order) orderBy = [[column, order.toUpperCase()]];
        const { count, rows: tableRecords } = await ExerciseModel.findAndCountAll({
            attributes: ['id', 'trimester_id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [{ model: LangModel, as: "mainExercise", attributes: ['id', 'name'] }]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching exercise-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };