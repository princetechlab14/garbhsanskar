const { Op } = require("sequelize");
const { LangModel, PregnancyModel, PregnancyDetailModel } = require("../models");
const Joi = require("joi");
const { slugify: translitSlugify } = require('transliteration');

const pregnancyDetailSchema = Joi.object({
    name: Joi.string().required(),
    pregnancy_category_id: Joi.number().integer().optional(),
    lang_id: Joi.number().integer().optional(),
    slug: Joi.string().allow(null, '').optional(),
    short_desc: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
    details: Joi.any().optional()
});

// Get list of pregnancyDetail
const getIndex = async (req, res) => {
    try {
        res.render("pregnancyDetail/index", { title: "Pregnancy Detail List" });
    } catch (error) {
        console.error("Error fetching pregnancy detail:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create pregnancy detail form
const create = async (req, res) => {
    try {
        const categories = await PregnancyModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("pregnancyDetail/create", { title: "Create Pregnancy Detail", categories, error: '', languages });
    } catch (error) {
        console.error("Error fetching pregnancy detail create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new pregnancy detail
const store = async (req, res) => {
    try {
        const categories = await PregnancyModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        console.log("req.body =>", req.body);
        const { error, value } = pregnancyDetailSchema.validate(req.body);
        if (error) return res.render("pregnancyDetail/create", { title: "Pregnancy Detail Create", error: error.details[0].message, categories, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const details = parseBigTitles(req.body);
        const newData = { ...value, slug, details };
        await PregnancyDetailModel.create(newData);
        res.redirect("/admin/pregnancy-detail");
    } catch (error) {
        console.error("Error creating pregnancy detail:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit pregnancyDetail form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await PregnancyModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const pregnancyDetail = await PregnancyDetailModel.findByPk(id);
        if (!pregnancyDetail) return res.status(404).send("Pregnancy detail not found");

        res.render("pregnancyDetail/edit", { title: "Edit Pregnancy Detail", pregnancyDetail, error: '', categories, languages });
    } catch (error) {
        console.error("Error fetching pregnancy detail for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the pregnancyDetail
const update = async (req, res) => {
    const { id } = req.params;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const pregnancyDetail = await PregnancyDetailModel.findByPk(id);
        if (!pregnancyDetail) return res.status(404).send("Pregnancy detail not found");

        const categories = await PregnancyModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = pregnancyDetailSchema.validate(req.body);
        if (error) return res.render("pregnancyDetail/edit", { title: "Pregnancy Detail Edit", pregnancyDetail, error: error.details[0].message, categories, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const big_desc = parseBigTitles(req.body);
        const updateData = { ...value, slug, big_desc };
        await PregnancyDetailModel.update(updateData, { where: { id } });
        res.redirect(`/admin/pregnancy-detail`);
    } catch (error) {
        console.error("Error updating pregnancyDetail:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a pregnancyDetail post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const pregnancyDetail = await PregnancyDetailModel.findByPk(id);
        if (!pregnancyDetail) return res.status(404).send("Pregnancy detail not found");
        await PregnancyDetailModel.destroy({ where: { id: id } });
        res.redirect("/admin/pregnancy-detail");
    } catch (error) {
        console.error("Error deleting pregnancy-detail:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await PregnancyDetailModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await PregnancyDetailModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await PregnancyDetailModel.findAndCountAll({
            attributes: ['id', 'pregnancy_category_id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: PregnancyModel, as: "mainCategoryPregnancy", attributes: ['id', 'name'] },
                { model: LangModel, as: "mainLangPregnancyDetail", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching pregnancyDetail-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const parseBigTitles = (body) => {
    const bigTitles = [];

    if (!body.details) return [];

    Object.entries(body.details).forEach(([index, titleData]) => {
        const title = titleData.title;
        const description = titleData.description;
        bigTitles.push({ title, description });
    });

    return bigTitles;
};


module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };