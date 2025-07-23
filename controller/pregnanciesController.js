const { Op } = require("sequelize");
const { LangModel, PregnancyModel } = require("../models");
const Joi = require("joi");
const { deleteObjS3 } = require("../services/fileupload");
const { slugify: translitSlugify } = require('transliteration');

const pregnanciesCategorySchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of pregnancies
const getIndex = async (req, res) => {
    try {
        res.render("pregnancies/index", { title: "Pregnancies List" });
    } catch (error) {
        console.error("Error fetching pregnancies:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create pregnancies form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("pregnancies/create", { title: "Create Pregnancies Category", error: '', languages });
    } catch (error) {
        console.error("Error fetching pregnancies create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new pregnancies
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = pregnanciesCategorySchema.validate(req.body);
        if (error) return res.render("pregnancies/create", { title: "Pregnancies Create", error: error.details[0].message, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const newData = { ...value, slug };
        if (req.file) {
            if (process.env.STORAGE_DRIVER === "s3") {
                newData.image = req.file.location;
            } else {
                newData.image = "/uploads/" + req.file.key;
            }
        }
        await PregnancyModel.create(newData);
        res.redirect("/admin/pregnancies");
    } catch (error) {
        console.error("Error creating pregnancies:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit pregnancies form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const pregnancies = await PregnancyModel.findByPk(id);
        if (!pregnancies) return res.status(404).send("Pregnancies not found");

        res.render("pregnancies/edit", { title: "Edit Pregnancies", pregnancies, error: '', languages });
    } catch (error) {
        console.error("Error fetching pregnancies for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the pregnancies
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const pregnancies = await PregnancyModel.findByPk(id);
        if (!pregnancies) return res.status(404).send("Pregnancies not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = pregnanciesCategorySchema.validate(req.body);
        if (error) return res.render("pregnancies/edit", { title: "Pregnancies Edit", pregnancies, error: error.details[0].message, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const updateData = { ...value, slug };
        // Handle new image uploads
        if (req.file) {
            if (pregnancies.image && process.env.STORAGE_DRIVER === "s3") {
                await deleteObjS3(pregnancies.image);
            }
            updateData.image = process.env.STORAGE_DRIVER === "s3" ? req.file.location : "/uploads/" + req.file.key;
        }
        await PregnancyModel.update(updateData, { where: { id } });
        res.redirect(`/admin/pregnancies`);
    } catch (error) {
        console.error("Error updating pregnancies:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a pregnancies post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const pregnancies = await PregnancyModel.findByPk(id);
        if (!pregnancies) return res.status(404).send("Pregnancies not found");
        await PregnancyModel.destroy({ where: { id: id } });
        res.redirect("/admin/pregnancies");
    } catch (error) {
        console.error("Error deleting pregnancies:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await PregnancyModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await PregnancyModel.update({ status }, { where: { id } });
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
                    { title: { [Op.like]: `%${search}%` } },
                    { shorting: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                ],
            };
        }
        let orderBy = [["id", "DESC"]];
        if (column && order) orderBy = [[column, order.toUpperCase()]];
        const { count, rows: tableRecords } = await PregnancyModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainPregnancies", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching pregnancies-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };