module.exports = (sequelize, Sequelize, DataTypes) => {
    const Exercise = sequelize.define(
        "exercise",
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
            trimester_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            benefits: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            feeling: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            instructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            adjustments: {
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
    return Exercise;
};
