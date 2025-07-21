module.exports = (sequelize, Sequelize, DataTypes) => {
    const VedicGeet = sequelize.define(
        "vedic_geet",
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
            title: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            img_url: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            webview_link: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            views: {
                type: DataTypes.INTEGER,
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
    return VedicGeet;
};
