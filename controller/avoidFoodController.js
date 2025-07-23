const { Op } = require("sequelize");
const { LangModel, AvoidFoodModel } = require("../models");
const Joi = require("joi");
const { slugify: translitSlugify } = require('transliteration');

const avoidFoodSchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    title: Joi.string().required(),
    month: Joi.number().integer().optional(),
    image: Joi.string().allow(null, '').optional(),
    short_desc: Joi.string().allow(null, '').optional(),
    description: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of avoid food
const getIndex = async (req, res) => {
    try {
        res.render("avoidFood/index", { title: "Avoid Food List" });
    } catch (error) {
        console.error("Error fetching avoidFood:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create avoid food form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("avoidFood/create", { title: "Create Avoid Food", error: '', languages });
    } catch (error) {
        console.error("Error fetching avoidFood create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new avoid food
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = avoidFoodSchema.validate(req.body);
        if (error) return res.render("avoidFood/create", { title: "Avoid Food Create", error: error.details[0].message, languages });

        let slug = translitSlugify(value.title || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const newData = { ...value, slug };
        await AvoidFoodModel.create(newData);
        res.redirect("/admin/avoid-food");
    } catch (error) {
        console.error("Error creating avoid food:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit avoid food form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const avoidFood = await AvoidFoodModel.findByPk(id);
        if (!avoidFood) return res.status(404).send("Avoid food not found");

        res.render("avoidFood/edit", { title: "Edit avoid food", avoidFood, error: '', languages });
    } catch (error) {
        console.error("Error fetching avoid food for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the Avoid food
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const avoidFood = await AvoidFoodModel.findByPk(id);
        if (!avoidFood) return res.status(404).send("Avoid food not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = avoidFoodSchema.validate(req.body);
        if (error) return res.render("avoidFood/edit", { title: "Avoid Food Edit", avoidFood, error: error.details[0].message, languages });

        let slug = translitSlugify(value.title || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }        const updateData = { ...value, slug };
        await AvoidFoodModel.update(updateData, { where: { id } });
        res.redirect(`/admin/avoid-food`);
    } catch (error) {
        console.error("Error updating avoid food:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a avoid food post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const avoidFood = await AvoidFoodModel.findByPk(id);
        if (!avoidFood) return res.status(404).send("Avoid food not found");
        await AvoidFoodModel.destroy({ where: { id: id } });
        res.redirect("/admin/avoid-food");
    } catch (error) {
        console.error("Error deleting avoid food:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await AvoidFoodModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await AvoidFoodModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await AvoidFoodModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'month', 'title', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainLangFood", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching AvoidFood-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };