module.exports = (sequelize, Sequelize, DataTypes) => {
    const Diet = sequelize.define(
        "diet",
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
            month: {
                type: DataTypes.INTEGER,
                defaultValue: 500,
            },
            name: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            total_time: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            pre_time: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            cook_time: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            serving: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            ingredients: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            directions: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            shorting: {
                type: DataTypes.INTEGER,
                defaultValue: 500,
            },
            status: {
                type: DataTypes.ENUM("Active", "InActive"),
                defaultValue: "Active",
            },
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
    return Diet;
};
