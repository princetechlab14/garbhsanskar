const moment = require("moment");
const { WomenDetailsModel, PregWeekDetailModel, ExerciseModel, ArticleModel, MusicModel, MusicCategoryModel, PregnancyModel, PregnancyDetailModel, sequelize, VedicGeetModel, DietModel, AvoidFoodModel, WorkCategoryModel, CreativeWorkModel, CategoryModel, LangModel } = require("../models");
const Joi = require("joi");

// insert_details_of_women
const insertDetailsOfWomen = async (req, res) => {
    // Validation schema
    const schema = Joi.object({
        lang_id: Joi.number().integer().optional(),
        name: Joi.string().required(),
        age: Joi.number().integer().min(17).required(),
        last_menstruation_date: Joi.string().required()
    });

    // Validate incoming request
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message
        });
    }

    const { name, age, lang_id, last_menstruation_date } = value;

    try {
        // Format dates
        const lmpDate = moment(last_menstruation_date, "DD-MM-YYYY").format("YYYY-MM-DD");
        const currentDate = moment().format("YYYY-MM-DD");

        // Calculate gestational age
        const gestationalAgeInDays = moment(currentDate).diff(moment(lmpDate), 'days');
        const week = Math.floor(gestationalAgeInDays / 7);
        const days = gestationalAgeInDays % 7;

        // Calculate due date and pregnancy start date
        const dueDate = moment(lmpDate).add(280, 'days').format("YYYY-MM-DD");
        const pregnancy_start_date = moment(dueDate).subtract(gestationalAgeInDays, 'days').format("YYYY-MM-DD");

        // Insert into database
        const result = await WomenDetailsModel.create({ lang_id, name, age, last_menstruation_date: lmpDate, week, days, pregnancy_start_date });
        res.json({ status: true, message: "Women Details Inserted Successfully", data: result });
    } catch (error) {
        console.error("Error inserting women details:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// pregnancy_week_details
const pregnancyWeekDetails = async (req, res) => {
    const schema = Joi.object({
        week_count: Joi.number().integer().required(),
        lang_id: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: {} });

    const { week_count, lang_id } = value;

    try {
        const result = await PregWeekDetailModel.findOne({ where: { week_count, lang_id, status: 'Active' } });
        if (!result) return res.status(404).json({ status: false, message: "No data Found", data: {} });
        res.json({ status: true, message: "Success", data: result });
    } catch (err) {
        console.error("Error fetching pregnancy week details:", err);
        res.status(500).json({ status: false, message: "Internal Server Error", data: {} });
    }
}

// POST: Exercise Data by Trimester ID
const getExercisesByTrimester = async (req, res) => {
    const schema = Joi.object({
        trimester_id: Joi.number().integer().required(),
        lang_id: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });

    const { trimester_id, lang_id } = value;

    try {
        const exercises = await ExerciseModel.findAll({ where: { trimester_id, lang_id, status: 'Active' }, order: [['shorting', 'DESC']] });
        if (exercises.length === 0) {
            return res.status(404).json({ status: false, message: "No data Found", data: [] });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}/excercise_images/`;

        const data = await Promise.all(
            exercises.map(async (exercise) => {
                const plain = exercise.get({ plain: true });
                return { ...plain, image: baseUrl + plain.image };
            })
        );

        return res.json({ status: true, message: "Success", data });
    } catch (err) {
        console.error("Error fetching exercise data:", err);
        return res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const getArticlesByCategory = async (req, res) => {
    const schema = Joi.object({
        article_id: Joi.number().integer().required(),
        lang_id: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });

    const { article_id, lang_id } = value;

    try {
        const articles = await ArticleModel.findAll({ where: { category_id: article_id, lang_id, status: 'Active' }, order: [['shorting', 'DESC']] });
        if (!articles || articles.length === 0) {
            return res.status(404).json({ status: false, message: "No data Found", data: [] });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}/article_images/`;

        const result = articles.map(article => {
            const plain = article.get({ plain: true });
            return {
                ...plain,
                image: baseUrl + plain.image
            };
        });

        res.json({ status: true, message: "Success", data: result });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const getMusicByCategories = async (req, res) => {
    const base = `${req.protocol}://${req.get('host')}/music/`;

    const baseUrls = {
        1: base + "pregnancy/",
        2: base + "lullaby/",
        3: base + "children_songs/",
        4: base + "Garbh_Samwaad/",
        5: base + "Meditation_Instrumental/",
        6: base + "Prathana/",
        7: base + "Shree_Krishna_Bhajan/",
        8: base + "Strotra/",
        9: base + "Ved/"
    };
    const schema = Joi.object({
        lang_id: Joi.number().integer().default(1)
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });

    const { lang_id } = value;

    try {
        const categories = await MusicCategoryModel.findAll({ where: { lang_id, status: 'Active' }, order: [['shorting', 'DESC']] });
        const data = [];
        for (const category of categories) {
            const categoryId = category.id;
            const categoryName = category.category;

            const base_url_image = baseUrls[categoryId] ? baseUrls[categoryId] + "image/" : "";
            const base_url_music = baseUrls[categoryId] ? baseUrls[categoryId] + "music/" : "";

            const musicItems = await MusicModel.findAll({ where: { music_category_id: categoryId, status: 'Active' }, order: [['shorting', 'DESC']] });
            const details = musicItems.map(item => ({ ...item, music: base_url_music + item.music, image: base_url_image + item.image }));
            data.push({ category_name: categoryName, details });
        }
        res.json({ status: true, message: "Success", data });
    } catch (err) {
        console.error("Error fetching music data:", err);
        res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const weekDiet = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });

    const { lang_id } = value;

    try {
        const weeks = await PregWeekDetailModel.findAll({ where: { lang_id, status: 'Active' }, attributes: ['id', 'week', 'week_count', 'start_para', 'recipe_name', 'recipe_image', 'ingredients', 'method'], order: [["week_count", "ASC"]] });
        if (!weeks || weeks.length === 0) return res.json({ status: false, message: "No data Found", data: [] });
        return res.json({ status: true, message: "Success", data: weeks });
    } catch (err) {
        console.error("Error fetching pregnancy weeks:", err);
        return res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const aboutPreCat = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: false, message: error.details[0].message, data: [] });
    }

    const { lang_id } = value;
    const baseImageUrl = `${req.protocol}://${req.get('host')}/about_pre_images/`;

    try {
        const records = await PregnancyModel.findAll({
            where: { lang_id, status: 'Active' },
            order: [["id", "ASC"]]
        });

        if (!records || records.length === 0) {
            return res.json({ status: false, message: "No data Found", data: [] });
        }

        const data = records.map(item => {
            const plain = item.get({ plain: true });
            return {
                ...plain,
                image: baseImageUrl + plain.image
            };
        });

        return res.json({ status: true, message: "Success", data });
    } catch (err) {
        console.error("Error fetching pregnancy info:", err);
        return res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const aboutPreDetailsByCat = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().integer().required(),
        cat_id: Joi.number().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: false, message: error.details[0].message, data: [] });
    }

    const { lang_id, cat_id } = value;
    const baseURL = `${req.protocol}://${req.get('host')}/about_pre_images/${cat_id}/`;

    try {
        const records = await PregnancyDetailModel.findAll({
            where: { lang_id, pregnancy_category_id: cat_id, status: 'Active' },
            order: [["id", "ASC"]]
        });

        if (!records || records.length === 0) {
            return res.json({ status: false, message: "No data Found", data: [] });
        }

        const data = records.map(item => {
            const plain = item.get({ plain: true });
            return {
                ...plain,
                image: baseURL + plain.image
            };
        });

        res.json({ status: true, message: "Success", data });
    } catch (err) {
        console.error("Error fetching pregnancy info:", err);
        res.status(500).json({ status: false, message: "Internal Server Error", data: [] });
    }
};

const getVedicData = async (req, res) => {
    const schema = Joi.object({
        category: Joi.string().valid('1', '2', '3').default('1'),
        lang_id: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message });
    const { category, lang_id } = value;

    const where = { lang_id, status: 'Active' };
    let order = [];
    switch (category) {
        case '1':
            order = sequelize.literal('RAND()');
            break;
        case '2':
            order = [['id', 'DESC']];
            break;
        case '3':
            order = [['shorting', 'DESC']];
            break;
        default:
            order = [['id', 'DESC']];
    }
    try {
        const vedicGeet =
            category === '1'
                ? await VedicGeetModel.findAll({ where, order: sequelize.literal('RAND()'), attributes: ['id', 'title', 'description', 'img_url', 'webview_link', 'views', 'shorting'] })
                : await VedicGeetModel.findAll({ where, order, attributes: ['id', 'title', 'description', 'img_url', 'webview_link', 'views', 'shorting'] });

        if (vedicGeet.length === 0) {
            return res.json({ status: false, message: 'No data Found', data: [] });
        }
        return res.json({ status: true, message: 'Success', data: vedicGeet });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: "Server Error", data: [] });
    }
};

const viewsCount = async (req, res) => {
    const schema = Joi.object({
        vedic_id: Joi.number().required(),
        lang_id: Joi.number().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message });

    const { vedic_id, lang_id } = value;
    try {
        const vedicGeet = await VedicGeetModel.findOne({ where: { id: vedic_id, lang_id } });
        if (!vedicGeet) return res.json({ status: false, message: 'ID Not Available' });

        const updatedViews = (vedicGeet.views || 0) + 1;
        const vedicGeetData = await VedicGeetModel.update({ views: updatedViews, lang_id }, { where: { id: vedic_id } });
        return res.json({ status: true, message: 'Success', data: vedicGeetData });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: 'Server Error' });
    }
};

const dietMonth = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message });

    const { lang_id } = value;
    try {
        const diet = await DietModel.findAll({
            where: { lang_id, status: 'Active' },
            attributes: [[sequelize.fn('MIN', sequelize.col('id')), 'id'], 'month'],
            group: ['month'],
            order: [[sequelize.fn('MIN', sequelize.col('id')), 'ASC']]
        });

        if (diet.length === 0) return res.json({ status: false, message: "No data Found", data: [] });
        const result = diet.map(row => ({ id: parseInt(row.id), month: row.month }));
        return res.json({ status: true, message: "Success", data: result });
    } catch (error) {
        console.error("Error fetching diet month:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
};

const getDietRecipe = async (req, res) => {
    const schema = Joi.object({
        month: Joi.number().required(),
        lang_id: Joi.number().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message });
    const { month, lang_id } = value;
    try {
        const exists = await DietModel.findOne({ where: { month, lang_id } });
        if (!exists) return res.json({ status: false, message: 'Data not found', data: [], avoid_food: [] });

        const mealTypes = ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Mid-Night'];
        const responseData = { status: true, message: 'Success', data: [], avoid_food: [] };

        for (const type of mealTypes) {
            // One random image entry
            const randomEntry = await DietModel.findOne({
                where: { month, type, lang_id },
                order: [sequelize.literal('RAND()')]
            });

            if (randomEntry) {
                const allDetails = await DietModel.findAll({
                    where: { month, type, lang_id, status: 'Active' }
                });

                const details = allDetails.map(row => ({
                    id: row.id,
                    name: row.name,
                    total_time: row.total_time,
                    preparation_time: row.pre_time,
                    cooking_time: row.cook_time,
                    serving: row.serving,
                    image: row.image,
                    ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients || [],
                    directions: typeof row.directions === 'string' ? JSON.parse(row.directions) : row.directions || []
                }));

                responseData.data.push({
                    id: randomEntry.id,
                    name: randomEntry.name,
                    image: randomEntry.image,
                    title: type,
                    details
                });
            } else {
                responseData.data.push({
                    title: type,
                    status: false
                });
            }
        }

        const avoidFoods = await AvoidFoodModel.findAll({
            where: { month, lang_id, status: 'Active' },
            order: [sequelize.literal('RAND()')],
            attributes: ['id', 'title', 'short_desc', 'image', 'description'],
        });
        responseData.avoid_food = avoidFoods;
        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
    }
};

const getCreativeWorkCat = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });
    const { lang_id } = value;

    try {
        const creativeWorkCat = await WorkCategoryModel.findAll({ where: lang_id ? { lang_id, status: 'Active' } : { status: 'Active' } });
        if (creativeWorkCat.length > 0) {
            res.json({ status: true, message: "Get all creative work category.", data: creativeWorkCat });
        } else {
            res.status(404).json({ status: false, message: "No data found.", data: [] });
        }
    } catch (err) {
        console.error('Error fetching creative work categories:', err);
        res.status(500).json({ status: false, message: "Internal server error", data: [] });
    }
};

const getCreativeWorkData = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().optional(),
        cat_id: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });
    const { cat_id, lang_id } = value;

    try {
        const creativeWorkData = await CreativeWorkModel.findAll({ where: { lang_id, work_category_id: cat_id } });
        res.json({ status: true, message: "Get all creative work data.", data: creativeWorkData });
    } catch (err) {
        console.error('Error fetching creative work data:', err);
        res.status(500).json({ status: false, message: "Internal server error", data: [] });
    }
};

const getArticleData = async (req, res) => {
    const schema = Joi.object({
        lang_id: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: [] });
    const { lang_id } = value;
    const baseUrl = `${req.protocol}://${req.get('host')}/article_images/`;

    try {
        const categoriesArticle = await CategoryModel.findAll({
            where: { status: 'Active' },
            attributes: ['id', 'name', 'slug', 'image'],
            include: [
                { model: ArticleModel, as: "articles", attributes: ['id', 'category_id', 'lang_id', 'name', 'slug', 'image', 'short_desc', 'description'], where: { lang_id, status: 'Active' } },
            ]
        });
        const result = categoriesArticle.map(category => {
            const plainCategory = category.get({ plain: true });
            return {
                ...plainCategory,
                image: plainCategory.image ? baseUrl + plainCategory.image : null,
                articles: plainCategory.articles.map(article => ({
                    ...article,
                    image: article.image ? baseUrl + article.image : null
                }))
            };
        });
        return res.json({ status: true, message: "Get all creative work data.", data: result });
    } catch (error) {
        console.error('Error fetching article data:', error);
        res.status(500).json({ status: false, message: "Internal server error", data: [] });
    }
};

const languageList = async (req, res) => {
    try {
        const langList = await LangModel.findAll({ where: { status: 'Active' }, attributes: ['id', 'name', 'slug', 'image'] });
        return res.json({ status: true, message: "Get all creative work data.", data: langList });
    } catch (error) {
        console.error('Error fetching article data:', error);
        res.status(500).json({ status: false, message: "Internal server error", data: [] });
    }
};

module.exports = { insertDetailsOfWomen, pregnancyWeekDetails, getExercisesByTrimester, getArticlesByCategory, getMusicByCategories, weekDiet, aboutPreCat, aboutPreDetailsByCat, getVedicData, viewsCount, dietMonth, getDietRecipe, getCreativeWorkCat, getCreativeWorkData, getArticleData, languageList };