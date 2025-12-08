import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Reflection extends Model {
    static associate(models) {
      Reflection.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  Reflection.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      achievements: DataTypes.STRING,
      challenges: DataTypes.STRING,
      learnings: DataTypes.STRING,
      next_actions: DataTypes.STRING,
      needs: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { sequelize, modelName: "Reflection", tableName: "reflections", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
  );

  return Reflection;
};
