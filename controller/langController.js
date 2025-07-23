const { LangModel } = require("../models");
const Joi = require("joi");
const { deleteObjS3 } = require("../services/fileupload");
const { Op } = require("sequelize");
const { slugify: translitSlugify } = require('transliteration');

const langSchema = Joi.object({
    name: Joi.string().required(),
    shorting: Joi.number().integer().min(0)
});

const getIndex = async (req, res) => {
    try {
        res.render("lang/index", { title: "Lang List" });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
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
        const { count, rows: tableRecords } = await LangModel.findAndCountAll({
            attributes: ['id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching language:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const create = async (req, res) => {
    res.render("lang/create", { title: "Lang Create", error: "", lang: {} });
};

const store = async (req, res) => {
    const { error, value } = langSchema.validate(req.body);
    const imagePath = req.file ? req.file.location : null;
    if (error) {
        if (imagePath) await deleteObjS3(imagePath);
        return res.render("lang/create", { title: "Lang Create", error: error.details[0].message, lang: value });
    }
    try {
        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        await LangModel.create({ ...value, image: imagePath, slug });
        res.redirect("/admin/lang");
    } catch (error) {
        console.error("Error creating lang:", error);
        res.status(500).send("Internal Server Error");
    }
};

const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const lang = await LangModel.findByPk(id);
        if (!lang) return res.status(404).send("Lang not found");
        res.render("lang/edit", { title: "Edit Lang", lang, error: "" });
    } catch (error) {
        console.error("Error fetching lang for edit:", error);
        res.status(500).send("Internal Server Error");
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    const imagePath = req.file ? req.file.location : null;
    try {
        const { error, value } = langSchema.validate(req.body);
        const lang = await LangModel.findByPk(id);
        if (error || !lang) {
            if (imagePath) await deleteObjS3(imagePath);
            return res.render("lang/edit", { title: "Edit Lang", lang, error: error.details[0].message });
        }
        if (imagePath && lang.image) await deleteObjS3(lang.image);
        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        await LangModel.update({ ...value, image: imagePath || lang.image, slug }, { where: { id } });
        res.redirect("/admin/lang");
    } catch (error) {
        if (imagePath) await deleteObjS3(imagePath);
        console.error("Error updating lang:", error);
        res.status(500).send("Internal Server Error");
    }
};

const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const lang = await LangModel.findByPk(id);
        if (!lang) return res.status(404).send("Lang not found");
        await LangModel.destroy({ where: { id } });
        res.redirect("/admin/lang");
    } catch (error) {
        console.error("Error deleting lang:", error);
        res.status(500).send("Internal Server Error");
    }
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const lang = await LangModel.findByPk(id);
        let status;
        if (lang.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const langDetail = await LangModel.update({ status }, { where: { id } });
            if (langDetail) {
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

module.exports = {
    getIndex,
    create,
    store,
    deleteRecord,
    edit,
    update,
    changeStatus,
    getData
};
