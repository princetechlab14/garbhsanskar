const { Op } = require("sequelize");
const { LangModel, PregWeekDetailModel } = require("../models");
const Joi = require("joi");

const pregWeekDetailsSchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    week_count: Joi.number().integer().optional(),
    week: Joi.string().allow(null, '').optional(),
    start_small_description: Joi.string().required(),
    baby_image: Joi.string().allow(null, '').optional(),
    start_big_description: Joi.string().allow(null, '').optional(),
    baby_size: Joi.string().allow(null, '').optional(),
    size_image: Joi.string().allow(null, '').optional(),
    baby_height: Joi.string().allow(null, '').optional(),
    baby_weight: Joi.string().allow(null, '').optional(),
    garbha_vriddhi_detail: Joi.string().allow(null, '').optional(),
    start_para: Joi.string().allow(null, '').optional(),
    recipe_name: Joi.string().allow(null, '').optional(),
    recipe_image: Joi.string().allow(null, '').optional(),
    ingredients: Joi.string().allow(null, '').optional(),
    method: Joi.string().allow(null, '').optional(),

    description_dev: Joi.any().optional(),
    description_sym: Joi.any().optional(),
    description_tip: Joi.any().optional(),
    description_check_up: Joi.any().optional(),

    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of preg-week-details
const getIndex = async (req, res) => {
    try {
        res.render("pregWeekDetails/index", { title: "Preg Week Details List" });
    } catch (error) {
        console.error("Error fetching preg-week-details:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create preg-week-details form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("pregWeekDetails/create", { title: "Create Preg Week Details", error: '', languages });
    } catch (error) {
        console.error("Error fetching preg-week-details create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new preg-week-details
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = pregWeekDetailsSchema.validate(req.body);
        if (error) return res.render("pregWeekDetails/create", { title: "Preg Week Details Create", error: error.details[0].message, languages });

        const description_dev = parseDescription(req.body, "description_dev");
        const description_sym = parseDescription(req.body, "description_sym");
        const description_tip = parseDescription(req.body, "description_tip");
        const description_check_up = parseDescription(req.body, "description_check_up");

        const newData = { ...value, description_dev, description_sym, description_tip, description_check_up };
        await PregWeekDetailModel.create(newData);
        res.redirect("/admin/preg-week-details");
    } catch (error) {
        console.error("Error creating preg-week-details:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit preg-week-details form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const pregWeekDetails = await PregWeekDetailModel.findByPk(id);
        if (!pregWeekDetails) return res.status(404).send("Preg Week Details not found");

        res.render("pregWeekDetails/edit", { title: "Edit Preg Week Details", pregWeekDetails, error: '', languages });
    } catch (error) {
        console.error("Error fetching preg-week-details for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the preg-week-details
const update = async (req, res) => {
    const { id } = req.params;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const pregWeekDetails = await PregWeekDetailModel.findByPk(id);
        if (!pregWeekDetails) return res.status(404).send("Preg Week Details not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = pregWeekDetailsSchema.validate(req.body);
        if (error) return res.render("pregWeekDetails/edit", { title: "Preg Week Details Edit", pregWeekDetails, error: error.details[0].message, languages });

        const description_dev = parseDescription(req.body, "description_dev");
        const description_sym = parseDescription(req.body, "description_sym");
        const description_tip = parseDescription(req.body, "description_tip");
        const description_check_up = parseDescription(req.body, "description_check_up");

        const updateData = { ...value, description_dev, description_sym, description_tip, description_check_up };
        await PregWeekDetailModel.update(updateData, { where: { id } });
        res.redirect(`/admin/preg-week-details`);
    } catch (error) {
        console.error("Error updating preg-week-details:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a preg-week-details post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const pregWeekDetails = await PregWeekDetailModel.findByPk(id);
        if (!pregWeekDetails) return res.status(404).send("Preg Week Details not found");
        await PregWeekDetailModel.destroy({ where: { id: id } });
        res.redirect("/admin/preg-week-details");
    } catch (error) {
        console.error("Error deleting preg-week-details:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await PregWeekDetailModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await PregWeekDetailModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await PregWeekDetailModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'week_count', 'baby_image', 'baby_height', 'baby_weight', 'recipe_name', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [{ model: LangModel, as: "mainLangPregWeekDetail", attributes: ['id', 'name'] }]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching preg-week-details-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const parseDescription = (body, key) =>
    Object.values(body[key] || {}).map(({ title = "", description = "" }) => ({
        title,
        description
    }));

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };