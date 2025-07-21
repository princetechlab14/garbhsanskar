const { Op } = require("sequelize");
const { LangModel, DietModel } = require("../models");
const Joi = require("joi");

const dietSchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    month: Joi.number().integer().optional(),
    type: Joi.string().allow(null, '').optional(),
    name: Joi.string().required(),
    slug: Joi.string().allow(null, '').optional(),
    total_time: Joi.string().allow(null, '').optional(),
    pre_time: Joi.string().allow(null, '').optional(),
    cook_time: Joi.string().allow(null, '').optional(),
    serving: Joi.string().allow(null, '').optional(),
    image: Joi.string().allow(null, '').optional(),
    ingredients: Joi.any().optional(),
    directions: Joi.any().optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of diet
const getIndex = async (req, res) => {
    try {
        res.render("diet/index", { title: "Diet List" });
    } catch (error) {
        console.error("Error fetching diet:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create diet form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("diet/create", { title: "Create Diet", error: '', languages });
    } catch (error) {
        console.error("Error fetching diet create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new diet
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = dietSchema.validate(req.body);
        if (error) return res.render("diet/create", { title: "Diet Create", error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const directions = parseBigTitles(req.body);
        const ingredients = parseIngredients(req.body);
        const newData = { ...value, slug, directions, ingredients };
        await DietModel.create(newData);
        res.redirect("/admin/diet");
    } catch (error) {
        console.error("Error creating diet:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit diet form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const diet = await DietModel.findByPk(id);
        if (!diet) return res.status(404).send("Diet not found");

        res.render("diet/edit", { title: "Edit Diet", diet, error: '', languages });
    } catch (error) {
        console.error("Error fetching diet for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the diet
const update = async (req, res) => {
    const { id } = req.params;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const diet = await DietModel.findByPk(id);
        if (!diet) return res.status(404).send("Diet not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = dietSchema.validate(req.body);
        if (error) return res.render("diet/edit", { title: "Diet Edit", diet, error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const directions = parseBigTitles(req.body);
        const ingredients = parseIngredients(req.body);
        const updateData = { ...value, slug, directions, ingredients };
        await DietModel.update(updateData, { where: { id } });
        res.redirect(`/admin/diet`);
    } catch (error) {
        console.error("Error updating diet:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a diet post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const diet = await DietModel.findByPk(id);
        if (!diet) return res.status(404).send("Diet not found");
        await DietModel.destroy({ where: { id: id } });
        res.redirect("/admin/diet");
    } catch (error) {
        console.error("Error deleting diet:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await DietModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await DietModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await DietModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'month', 'name', 'slug', 'type', 'total_time', 'pre_time', 'cook_time', 'serving', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [{ model: LangModel, as: "mainDiet", attributes: ['id', 'name'] }]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching diet-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const parseBigTitles = (body) => {
    const bigTitles = [];

    if (!body.directions) return [];

    Object.entries(body.directions).forEach(([index, titleData]) => {
        const title = titleData.title;
        const detailsRaw = titleData.details || {};

        const details = Object.entries(detailsRaw).map(([i, detail]) => ({
            title: detail.title,
            description: detail.description,
        }));

        bigTitles.push({ title, details });
    });

    return bigTitles;
};

const parseIngredients = (body) => {
    const ingredients = [];

    if (!body.ingredients) return [];

    Object.entries(body.ingredients).forEach(([index, item]) => {
        ingredients.push({
            title: item.title || "",
            description: item.description || ""
        });
    });

    return ingredients;
};



module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };