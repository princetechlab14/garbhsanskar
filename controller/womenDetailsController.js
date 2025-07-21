const { Op } = require("sequelize");
const { LangModel, WomenDetailsModel } = require("../models");
const Joi = require("joi");

const womenDetailsSchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    age: Joi.string().allow(null, '').optional(),
    last_menstruation_date: Joi.string().allow(null, '').optional(),
    week: Joi.string().allow(null, '').optional(),
    days: Joi.string().allow(null, '').optional(),
    pregnancy_start_date: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of women details
const getIndex = async (req, res) => {
    try {
        res.render("womenDetails/index", { title: "Women Details List" });
    } catch (error) {
        console.error("Error fetching womenDetails:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create women details form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("womenDetails/create", { title: "Create Women Details", error: '', languages });
    } catch (error) {
        console.error("Error fetching womenDetails create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new women details
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = womenDetailsSchema.validate(req.body);
        if (error) return res.render("womenDetails/create", { title: "Women Details Create", error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const newData = { ...value, slug };
        await WomenDetailsModel.create(newData);
        res.redirect("/admin/women-details");
    } catch (error) {
        console.error("Error creating women details:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit women details form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const womenDetails = await WomenDetailsModel.findByPk(id);
        if (!womenDetails) return res.status(404).send("Women Details not found");

        res.render("womenDetails/edit", { title: "Edit Women Details", womenDetails, error: '', languages });
    } catch (error) {
        console.error("Error fetching women details for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the women details
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const womenDetails = await WomenDetailsModel.findByPk(id);
        if (!womenDetails) return res.status(404).send("Women Details not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = womenDetailsSchema.validate(req.body);
        if (error) return res.render("womenDetails/edit", { title: "Women Details Edit", womenDetails, error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const updateData = { ...value, slug };
        await WomenDetailsModel.update(updateData, { where: { id } });
        res.redirect(`/admin/women-details`);
    } catch (error) {
        console.error("Error updating women details:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a women details post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const womenDetails = await WomenDetailsModel.findByPk(id);
        if (!womenDetails) return res.status(404).send("Women details not found");
        await WomenDetailsModel.destroy({ where: { id: id } });
        res.redirect("/admin/women-details");
    } catch (error) {
        console.error("Error deleting women details:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await WomenDetailsModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await WomenDetailsModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await WomenDetailsModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'name', 'age', 'last_menstruation_date', 'week', 'days', 'pregnancy_start_date', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainLangWomenDetails", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching womenDetails-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };