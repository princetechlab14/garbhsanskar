module.exports = (sequelize, Sequelize, DataTypes) => {
    const CreativeWork = sequelize.define(
        "creativeWork",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            work_category_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            lang_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            video_url: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            video_image: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            short_desc: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            big_desc: {
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
    return CreativeWork;
};
