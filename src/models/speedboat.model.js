import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class Speedboat extends Model {
        static associate(models) {
            // 1 → many
            Speedboat.hasMany(models.CrewMember, {
                foreignKey: "speedboat_id",
                as: "crew",
                onDelete: "CASCADE",
            });

            Speedboat.hasMany(models.KPI, {
                foreignKey: "speedboat_id",
                as: "kpis",
                onDelete: "CASCADE",
            });

            Speedboat.hasMany(models.Milestone, {
                foreignKey: "speedboat_id",
                as: "milestones",
                onDelete: "CASCADE",
            });

            Speedboat.hasMany(models.NextAction, {
                foreignKey: "speedboat_id",
                as: "nextActions",
                onDelete: "CASCADE",
            });

            Speedboat.hasMany(models.Reflection, {
                foreignKey: "speedboat_id",
                as: "reflections",
                onDelete: "CASCADE",
            });

            // Many-to-many self-reference (dependencies)
            Speedboat.belongsToMany(models.Speedboat, {
                as: "dependsOn",
                through: models.Dependency,
                foreignKey: "speedboat_id",
                otherKey: "depends_on_speedboat_id",
            });

            Speedboat.belongsToMany(models.Speedboat, {
                as: "dependentFor",
                through: models.Dependency,
                foreignKey: "depends_on_speedboat_id",
                otherKey: "speedboat_id",
            });
        }
    }

    Speedboat.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: { type: DataTypes.TEXT, allowNull: false },
            purpose: DataTypes.TEXT,
            mission: DataTypes.TEXT,
            captain: DataTypes.TEXT,
            sponsor: DataTypes.TEXT,
            mentor: DataTypes.TEXT,
            health: {
                type: DataTypes.STRING(10),
                defaultValue: "yellow",
            },
            progress: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            manual_health_override: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        { sequelize, modelName: "Speedboat", tableName: "speedboats", timestamps: false }
    );

    return Speedboat;
};
