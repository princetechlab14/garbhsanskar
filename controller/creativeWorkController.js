const { Op } = require("sequelize");
const { LangModel, WorkCategoryModel, CreativeWorkModel } = require("../models");
const Joi = require("joi");
const { slugify: translitSlugify } = require('transliteration');

const creativeWorkSchema = Joi.object({
    name: Joi.string().required(),
    work_category_id: Joi.number().integer().optional(),
    lang_id: Joi.number().integer().optional(),
    slug: Joi.string().allow(null, '').optional(),
    image: Joi.string().allow(null, '').optional(),
    video_url: Joi.string().allow(null, '').optional(),
    video_image: Joi.string().allow(null, '').optional(),
    short_desc: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
    big_desc: Joi.any().optional()
});


// Get list of creative work
const getIndex = async (req, res) => {
    try {
        res.render("creativeWork/index", { title: "Creative Work List" });
    } catch (error) {
        console.error("Error fetching creative work:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create creative work form
const create = async (req, res) => {
    try {
        const categories = await WorkCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("creativeWork/create", { title: "Create Creative Work", categories, error: '', languages });
    } catch (error) {
        console.error("Error fetching creative work create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new creative work
const store = async (req, res) => {
    try {
        const categories = await WorkCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = creativeWorkSchema.validate(req.body);
        if (error) return res.render("creativeWork/create", { title: "Creative Work Create", error: error.details[0].message, categories, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const big_desc = parseBigTitles(req.body);
        const newData = { ...value, slug, big_desc };
        await CreativeWorkModel.create(newData);
        res.redirect("/admin/creative-work");
    } catch (error) {
        console.error("Error creating creative work:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit creativeWork form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await WorkCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const creativeWork = await CreativeWorkModel.findByPk(id);
        if (!creativeWork) return res.status(404).send("Creative Work not found");

        res.render("creativeWork/edit", { title: "Edit Creative Work", creativeWork, error: '', categories, languages });
    } catch (error) {
        console.error("Error fetching creative work for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the creativeWork
const update = async (req, res) => {
    const { id } = req.params;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const creativeWork = await CreativeWorkModel.findByPk(id);
        if (!creativeWork) return res.status(404).send("Creative Work not found");

        const categories = await WorkCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = creativeWorkSchema.validate(req.body);
        if (error) return res.render("creativeWork/edit", { title: "Creative Work Edit", creativeWork, error: error.details[0].message, categories, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const big_desc = parseBigTitles(req.body);
        const updateData = { ...value, slug, big_desc };
        await CreativeWorkModel.update(updateData, { where: { id } });
        res.redirect(`/admin/creative-work`);
    } catch (error) {
        console.error("Error updating creativeWork:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a creativeWork post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const creativeWork = await CreativeWorkModel.findByPk(id);
        if (!creativeWork) return res.status(404).send("Creative Work not found");
        await CreativeWorkModel.destroy({ where: { id: id } });
        res.redirect("/admin/creative-work");
    } catch (error) {
        console.error("Error deleting creative-work:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await CreativeWorkModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await CreativeWorkModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await CreativeWorkModel.findAndCountAll({
            attributes: ['id', 'work_category_id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: WorkCategoryModel, as: "mainCategoryWork", attributes: ['id', 'name'] },
                { model: LangModel, as: "mainCategoryWorkLang", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching creativeWork-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const parseBigTitles = (body) => {
    const bigTitles = [];

    if (!body.big_desc) return [];

    Object.entries(body.big_desc).forEach(([index, titleData]) => {
        const title = titleData.title;
        const description = titleData.description;
        const detailsRaw = titleData.process || {};

        const process = Object.entries(detailsRaw).map(([i, detail]) => ({
            step: detail.step,
            description: detail.description,
        }));

        bigTitles.push({ title, description, process });
    });

    return bigTitles;
};


module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };