module.exports = (sequelize, Sequelize, DataTypes) => {
    const WomenDetails = sequelize.define(
        "women_details",
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
            name: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            age: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            last_menstruation_date: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            week: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            days: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            pregnancy_start_date: {
                type: DataTypes.STRING(1000),
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
    return WomenDetails;
};
