const { Op } = require("sequelize");
const { LangModel, MusicCategoryModel, MusicModel } = require("../models");
const Joi = require("joi");

const musicSchema = Joi.object({
    name: Joi.string().required(),
    music_category_id: Joi.number().integer().optional(),
    lang_id: Joi.number().integer().optional(),
    slug: Joi.string().allow(null, '').optional(),
    time: Joi.string().allow(null, '').optional(),
    desc: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
});


// Get list of music 
const getIndex = async (req, res) => {
    try {
        res.render("music/index", { title: "Music List" });
    } catch (error) {
        console.error("Error fetching music:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create music form
const create = async (req, res) => {
    try {
        const categories = await MusicCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("music/create", { title: "Create music", categories, error: '', languages });
    } catch (error) {
        console.error("Error fetching music create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new music
const store = async (req, res) => {
    try {
        const categories = await MusicCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = musicSchema.validate(req.body);
        if (error) return res.render("music/create", { title: "Music Create", error: error.details[0].message, categories, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const newData = { ...value, slug };

        // Handle uploaded files
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                newData.image = process.env.STORAGE_DRIVER === "s3"
                    ? req.files.image[0].location
                    : "/uploads/" + req.files.image[0].key;
            }

            if (req.files.music && req.files.music.length > 0) {
                newData.music = process.env.STORAGE_DRIVER === "s3"
                    ? req.files.music[0].location
                    : "/uploads/" + req.files.music[0].key;
            }
        }

        await MusicModel.create(newData);
        res.redirect("/admin/music");
    } catch (error) {
        console.error("Error creating music:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit music form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await MusicCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const music = await MusicModel.findByPk(id);
        if (!music) return res.status(404).send("Music not found");

        res.render("music/edit", { title: "Edit Music", music, error: '', categories, languages });
    } catch (error) {
        console.error("Error fetching music for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the music
const update = async (req, res) => {
    const { id } = req.params;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const music = await MusicModel.findByPk(id);
        if (!music) return res.status(404).send("Music not found");

        const categories = await MusicCategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = musicSchema.validate(req.body);
        if (error) return res.render("music/edit", { title: "Music Edit", music, error: error.details[0].message, categories, languages });

        const slug = value.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        const updateData = { ...value, slug };
        await MusicModel.update(updateData, { where: { id } });
        res.redirect(`/admin/music`);
    } catch (error) {
        console.error("Error updating music:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Delete a music post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const music = await MusicModel.findByPk(id);
        if (!music) return res.status(404).send("Music not found");
        await MusicModel.destroy({ where: { id: id } });
        res.redirect("/admin/music");
    } catch (error) {
        console.error("Error deleting music:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await MusicModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await MusicModel.update({ status }, { where: { id } });
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
    console.log("called this");
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
        const { count, rows: tableRecords } = await MusicModel.findAndCountAll({
            attributes: ['id', 'music_category_id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: MusicCategoryModel, as: "mainCategoryMusic", attributes: ['id', 'name'] },
                { model: LangModel, as: "mainMusic", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching music-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };