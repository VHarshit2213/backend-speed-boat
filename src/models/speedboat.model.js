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
            
            Speedboat.hasMany(models.Message, {
                foreignKey: "speedboat_id",
                as: "messages",
                onDelete: "CASCADE",
            });

            Speedboat.hasMany(models.BudgetResource, {
                foreignKey: "speedboat_id",
                as: "budgetResources",
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
            name: { type: DataTypes.STRING, allowNull: false },
            purpose: DataTypes.STRING,
            mission: { type: DataTypes.STRING, allowNull: true },
            guiding_spirit: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
            challenge: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
            measurement_of_success: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
            current_status: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
            captain: DataTypes.STRING,
            sponsor: DataTypes.STRING,
            navigators: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
            health: {
                type: DataTypes.STRING(10),
                defaultValue: "Pending",
            },
            progress: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            manual_health_override: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            start_date: { type: DataTypes.DATE, allowNull: true },
            end_date: { type: DataTypes.DATE, allowNull: true },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Speedboat",
            tableName: "speedboats",

            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Speedboat;
};
