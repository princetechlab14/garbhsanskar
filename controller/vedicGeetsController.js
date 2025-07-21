const { Op } = require("sequelize");
const { LangModel, VedicGeetModel } = require("../models");
const Joi = require("joi");

const vedicGeetsSchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    title: Joi.string().required(),
    description: Joi.string().allow(null, '').optional(),
    img_url: Joi.string().allow(null, '').optional(),
    webview_link: Joi.string().allow(null, '').optional(),
    views: Joi.number().integer().optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of vedic geets
const getIndex = async (req, res) => {
    try {
        res.render("vedicGeets/index", { title: "Vedic Geets List" });
    } catch (error) {
        console.error("Error fetching vedicGeets:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create vedic geets form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("vedicGeets/create", { title: "Create Vedic Geets", error: '', languages });
    } catch (error) {
        console.error("Error fetching vedicGeets create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new vedic geets
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = vedicGeetsSchema.validate(req.body);
        if (error) return res.render("vedicGeets/create", { title: "Vedic Geets Create", error: error.details[0].message, languages });

        const slug = value.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const newData = { ...value, slug };
        await VedicGeetModel.create(newData);
        res.redirect("/admin/vedic-geets");
    } catch (error) {
        console.error("Error creating vedic geets:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit vedic geets form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const vedicGeets = await VedicGeetModel.findByPk(id);
        if (!vedicGeets) return res.status(404).send("Vedic Geets not found");

        res.render("vedicGeets/edit", { title: "Edit vedic geets", vedicGeets, error: '', languages });
    } catch (error) {
        console.error("Error fetching vedic geets for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the vedic geets
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const vedicGeets = await VedicGeetModel.findByPk(id);
        if (!vedicGeets) return res.status(404).send("Vedic Geets not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = vedicGeetsSchema.validate(req.body);
        if (error) return res.render("vedicGeets/edit", { title: "Vedic Geets Edit", vedicGeets, error: error.details[0].message, languages });

        const slug = value.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const updateData = { ...value, slug };
        await VedicGeetModel.update(updateData, { where: { id } });
        res.redirect(`/admin/vedic-geets`);
    } catch (error) {
        console.error("Error updating vedic geets:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a vedic geets post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const vedicGeets = await VedicGeetModel.findByPk(id);
        if (!vedicGeets) return res.status(404).send("Vedic Geets not found");
        await VedicGeetModel.destroy({ where: { id: id } });
        res.redirect("/admin/vedic-geets");
    } catch (error) {
        console.error("Error deleting vedic geets:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await VedicGeetModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await VedicGeetModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await VedicGeetModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'title', 'img_url', 'webview_link', 'views', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainLangVedicGeet", attributes: ['id', 'name'] },
            ]
        });

        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching vedicGeets-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };