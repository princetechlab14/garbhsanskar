module.exports = (sequelize, Sequelize, DataTypes) => {
    const PregnancyDetail = sequelize.define(
        "pregnancy_details",
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
            pregnancy_category_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            short_desc: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            details: {
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
    return PregnancyDetail;
};
