module.exports = (sequelize, Sequelize, DataTypes) => {
    const PregnancyWeekDetail = sequelize.define(
        "pregnancy_week_details",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            lang_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            week_count: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            week: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            start_small_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            baby_image: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            start_big_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            baby_size: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            size_image: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            baby_height: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            baby_weight: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            garbha_vriddhi_detail: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            description_dev: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            description_sym: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            description_tip: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            description_check_up: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            start_para: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            recipe_name: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            recipe_image: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            ingredients: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            method: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            shorting: {
                type: DataTypes.INTEGER,
                defaultValue: 500,
            },
            status: {
                type: DataTypes.ENUM("Active", "InActive"),
                defaultValue: "Active",
            }
        },
        {
            paranoid: true,
            timestamps: true,
            underscored: true,
            deletedAt: "deleted_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
    return PregnancyWeekDetail;
};
