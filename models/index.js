const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci",
        },
        logging: false,
    }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.AdminModel = require('./adminModel')(sequelize, Sequelize, DataTypes);
db.CategoryModel = require('./categoryModel')(sequelize, Sequelize, DataTypes);
db.LangModel = require('./langModel')(sequelize, Sequelize, DataTypes);
db.ArticleModel = require('./articleModel')(sequelize, Sequelize, DataTypes);
db.AvoidFoodModel = require('./avoidFoodModel')(sequelize, Sequelize, DataTypes);
db.WorkCategoryModel = require('./workCategoryModel')(sequelize, Sequelize, DataTypes);
db.CreativeWorkModel = require('./creativeWorkModel')(sequelize, Sequelize, DataTypes);
db.ContactUsModel = require('./contactModel')(sequelize, Sequelize, DataTypes);
db.DietModel = require('./dietModel')(sequelize, Sequelize, DataTypes);
db.ExerciseModel = require('./exerciseModel')(sequelize, Sequelize, DataTypes);
db.MusicCategoryModel = require('./musicCategoryModel')(sequelize, Sequelize, DataTypes);
db.MusicModel = require('./musicModel')(sequelize, Sequelize, DataTypes);
db.PregnancyDetailModel = require('./pregnancyDetailModel')(sequelize, Sequelize, DataTypes);
db.PregnancyModel = require('./pregnancyModel')(sequelize, Sequelize, DataTypes);
db.PregWeekDetailModel = require('./pregWeekDetailModel')(sequelize, Sequelize, DataTypes);
db.UserExerciseModel = require('./userExerciseModel')(sequelize, Sequelize, DataTypes);
db.VedicGeetModel = require('./vedicGeetModel')(sequelize, Sequelize, DataTypes);
db.WomenDetailsModel = require('./womenDetailsModel')(sequelize, Sequelize, DataTypes);
db.WorkCategoryModel = require('./workCategoryModel')(sequelize, Sequelize, DataTypes);


db.ArticleModel.belongsTo(db.CategoryModel, { foreignKey: "category_id", as: "mainCategory", onDelete: "CASCADE", });
db.CategoryModel.hasMany(db.ArticleModel, { foreignKey: "category_id", as: "articles", onDelete: "CASCADE", });
db.ArticleModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLang", onDelete: "CASCADE", });
db.AvoidFoodModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLangFood", onDelete: "CASCADE", });
db.WorkCategoryModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainWorkCategory", onDelete: "CASCADE", });
db.CreativeWorkModel.belongsTo(db.WorkCategoryModel, { foreignKey: "work_category_id", as: "mainCategoryWork", onDelete: "CASCADE", });
db.CreativeWorkModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainCategoryWorkLang", onDelete: "CASCADE", });
db.DietModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainDiet", onDelete: "CASCADE", });
db.ExerciseModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainExercise", onDelete: "CASCADE", });
db.MusicCategoryModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainMusicCategory", onDelete: "CASCADE", });
db.MusicModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainMusic", onDelete: "CASCADE", });
db.MusicModel.belongsTo(db.MusicCategoryModel, { foreignKey: "music_category_id", as: "mainCategoryMusic", onDelete: "CASCADE", });
db.PregnancyModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainPregnancies", onDelete: "CASCADE", });
db.PregnancyDetailModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLangPregnancyDetail", onDelete: "CASCADE", });
db.PregnancyDetailModel.belongsTo(db.PregnancyModel, { foreignKey: "pregnancy_category_id", as: "mainCategoryPregnancy", onDelete: "CASCADE", });
db.PregWeekDetailModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLangPregWeekDetail", onDelete: "CASCADE", });
db.VedicGeetModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLangVedicGeet", onDelete: "CASCADE", });
db.WomenDetailsModel.belongsTo(db.LangModel, { foreignKey: "lang_id", as: "mainLangWomenDetails", onDelete: "CASCADE", });

module.exports = db;