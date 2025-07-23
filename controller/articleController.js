const { Op } = require("sequelize");
const { ArticleModel, CategoryModel, LangModel } = require("../models");
const { deleteObjS3 } = require("../services/fileupload");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const { slugify: translitSlugify } = require('transliteration');

const articleSchema = Joi.object({
    name: Joi.string().required(),
    category_id: Joi.number().integer().optional(),
    lang_id: Joi.number().integer().optional(),
    short_desc: Joi.string().allow(null, '').optional(),
    shorting: Joi.number().integer().optional(),
    status: Joi.string().valid('Active', 'InActive').default('Active').optional(),
    big_titles: Joi.any().optional()
});


// Get list of article
const getIndex = async (req, res) => {
    try {
        res.render("article/index", { title: "Article List" });
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Show the create article form
const create = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });
        res.render("article/create", { title: "Create Article", categories, error: '', languages });
    } catch (error) {
        console.error("Error fetching article create:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Store a new article
const store = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = articleSchema.validate(req.body);
        if (error) return res.render("article/create", { title: "Article Create", error: error.details[0].message, categories, languages });

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        let imagePath = null;
        if (req.file) {
            if (process.env.STORAGE_DRIVER === "s3") {
                imagePath = req.file.location;
            } else {
                imagePath = "/uploads/" + req.file.key;
            }
        }

        const description = parseBigTitles(req.body);
        const newArticle = { ...value, slug, image: imagePath, description };
        await ArticleModel.create(newArticle);
        res.redirect("/admin/article");
    } catch (error) {
        console.error("Error creating article:", error);
        if (req.file && process.env.STORAGE_DRIVER === "s3" && req.file.location) {
            await deleteObjS3(req.file.location);
        }
        res.status(500).send("Internal Server Error");
    }
};


// Show the edit article form
const edit = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await CategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const article = await ArticleModel.findByPk(id);
        if (!article) return res.status(404).send("Article not found");

        res.render("article/edit", { title: "Edit Article", article, error: '', categories, languages });
    } catch (error) {
        console.error("Error fetching article for editing:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Update the article
const update = async (req, res) => {
    const { id: articleId } = req.params;
    const awsBaseUrl = process.env.AWS_BASE_URL;
    try {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });
        const article = await ArticleModel.findByPk(articleId);
        if (!article) return res.status(404).send("Article not found");

        const categories = await CategoryModel.findAll({ where: { status: "Active" } });
        const languages = await LangModel.findAll({ where: { status: "Active" } });

        const { error, value } = articleSchema.validate(req.body);
        if (error) return res.render("article/edit", { title: "Article Edit", article, error: error.details[0].message, categories, languages });

        // Handle new image uploads
        let imagePath = article.image;
        if (req.file) {
            imagePath = req.file.location;
            if (article.image && article.image.startsWith(awsBaseUrl)) {
                await deleteObjS3(article.image);
            }
        } else if (value.image_url && value.image_url !== article.image) {
            imagePath = value.image_url;
            if (article.image && article.image.startsWith(awsBaseUrl)) {
                await deleteObjS3(article.image);
            }
        }

        let slug = translitSlugify(value.name || '', { lowercase: true });
        if (!slug || slug.trim() === '') {
            slug = `no-valid-slug-${Date.now()}`;
        }
        const description = parseBigTitles(req.body);
        const updateArticle = { ...value, slug, image: imagePath, description };
        await ArticleModel.update(updateArticle, { where: { id: articleId } });
        res.redirect(`/admin/article`);
    } catch (error) {
        console.error("Error updating article:", error);
        if (req.file && process.env.STORAGE_DRIVER === "s3" && req.file.location) {
            await deleteObjS3(req.file.location);
        }
        res.status(500).send("Internal Server Error");
    }
};


// Delete a article post
const deleteRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await ArticleModel.findByPk(id);
        if (!article) return res.status(404).send("Article not found");
        await ArticleModel.destroy({ where: { id: id } });
        res.redirect("/admin/article");
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    const { id } = req.params;
    if (id) {
        const detail = await ArticleModel.findByPk(id);
        let status;
        if (detail.status == "Active") {
            status = "InActive";
        } else {
            status = "Active";
        }
        try {
            const update = await ArticleModel.update({ status }, { where: { id } });
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
        const { count, rows: tableRecords } = await ArticleModel.findAndCountAll({
            attributes: ['id', 'category_id', 'lang_id', 'name', 'slug', 'image', 'shorting', 'status'],
            where: whereCondition,
            limit,
            offset,
            order: orderBy,
            include: [
                { model: CategoryModel, as: "mainCategory", attributes: ['id', 'name'] },
                { model: LangModel, as: "mainLang", attributes: ['id', 'name'] },
            ]
        });
        res.json({ success: true, data: tableRecords, pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit } });
    } catch (error) {
        console.error("Error fetching article-list:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const parseBigTitles = (body) => {
    const bigTitles = [];

    if (!body.big_titles) return [];

    Object.entries(body.big_titles).forEach(([index, titleData]) => {
        const title = titleData.title;
        const description = titleData.description;
        const detailsRaw = titleData.details || {};

        const details = Object.entries(detailsRaw).map(([i, detail]) => ({
            title: detail.title,
            description: detail.description,
        }));

        bigTitles.push({ title, description, details });
    });

    return bigTitles;
};


module.exports = { getIndex, create, store, deleteRecord, edit, update, changeStatus, getData };