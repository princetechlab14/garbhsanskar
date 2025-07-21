const { Op } = require("sequelize");
const { LangModel, MusicCategoryModel } = require("../models");
const Joi = require("joi");

const musicCategorySchema = Joi.object({
    lang_id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    image: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of music-category
const getIndex = async (req, res) => {
    try {
        res.render("musicCategory/index", { title: "Music Category List" });
    } catch (error) {
        console.error("Error fetching musicCategory:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create Music Category form
const create = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("musicCategory/create", { title: "Create Music Category", error: '', languages });
    } catch (error) {
        console.error("Error fetching musicCategory create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new Music-category
const store = async (req, res) => {
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = musicCategorySchema.validate(req.body);
        if (error) return res.render("musicCategory/create", { title: "Music Category Create", error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const newData = { ...value, slug };
        await MusicCategoryModel.create(newData);
        res.redirect("/admin/music-category");
    } catch (error) {
        console.error("Error creating music-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit music-category form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const musicCategory = await MusicCategoryModel.findByPk(id);
        if (!musicCategory) return res.status(404).send("Music Category not found");

        res.render("musicCategory/edit", { title: "Edit Music Category", musicCategory, error: '', languages });
    } catch (error) {
        console.error("Error fetching music-category for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the music-category
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const musicCategory = await MusicCategoryModel.findByPk(id);
        if (!musicCategory) return res.status(404).send("Music Category food not found");

        const languages = await LangModel.findAll({ where: { status: "Active" } });
        const { error, value } = musicCategorySchema.validate(req.body);
        if (error) return res.render("musicCategory/edit", { title: "Music Category Food Edit", musicCategory, error: error.details[0].message, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const updateData = { ...value, slug };
        await MusicCategoryModel.update(updateData, { where: { id } });
        res.redirect(`/admin/music-category`);
    } catch (error) {
        console.error("Error updating music-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a music-category post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const musicCategory = await MusicCategoryModel.findByPk(id);
        if (!musicCategory) return res.status(404).send("Music-category not found");
        await MusicCategoryModel.destroy({ where: { id: id } });
        res.redirect("/admin/music-category");
    } catch (error) {
        console.error("Error deleting music-category:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await MusicCategoryModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await MusicCategoryModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await MusicCategoryModel.findAndCountAll({
            attributes: ['id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: LangModel, as: "mainMusicCategory", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching musicCategory-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };