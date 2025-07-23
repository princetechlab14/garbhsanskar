const { Op } = require("sequelize");
const { LangModel, WorkCategoryModel } = require("../models");
const Joi = require("joi");
const { slugify: translitSlugify } = require('transliteration');

const workCategorySchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    image: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of work-category
const getIndex = async (req, res) => {
    try {
        res.render("workCategory/index", { title: "Work Category List" });
    } catch (error) {
        console.error("Error fetching workCategory:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create Work Category form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("workCategory/create", { title: "Create Work Category", error: '', languages });
    } catch (error) {
        console.error("Error fetching workCategory create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new work-category
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = workCategorySchema.validate(req.body);
        if (error) return res.render("workCategory/create", { title: "Work Category Create", error: error.details[0].message, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const newData = { ...value, slug };
        await WorkCategoryModel.create(newData);
        res.redirect("/admin/work-category");
    } catch (error) {
        console.error("Error creating work-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit work-category form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const workCategory = await WorkCategoryModel.findByPk(id);
        if (!workCategory) return res.status(404).send("Work Category not found");

        res.render("workCategory/edit", { title: "Edit Work Category", workCategory, error: '', languages });
    } catch (error) {
        console.error("Error fetching work-category for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the work-category
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const workCategory = await WorkCategoryModel.findByPk(id);
        if (!workCategory) return res.status(404).send("Work Category food not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = workCategorySchema.validate(req.body);
        if (error) return res.render("workCategory/edit", { title: "Work Category Food Edit", workCategory, error: error.details[0].message, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const updateData = { ...value, slug };
        await WorkCategoryModel.update(updateData, { where: { id } });
        res.redirect(`/admin/work-category`);
    } catch (error) {
        console.error("Error updating work-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a work-category post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const workCategory = await WorkCategoryModel.findByPk(id);
        if (!workCategory) return res.status(404).send("Work-category not found");
        await WorkCategoryModel.destroy({ where: { id: id } });
        res.redirect("/admin/work-category");
    } catch (error) {
        console.error("Error deleting work-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await WorkCategoryModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await WorkCategoryModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await WorkCategoryModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainWorkCategory", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching workCategory-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };