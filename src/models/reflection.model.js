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
      achievements: DataTypes.TEXT,
      challenges: DataTypes.TEXT,
      learnings: DataTypes.TEXT,
      next_actions: DataTypes.TEXT,
      needs: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: "Reflection", tableName: "reflections", timestamps: false }
  );

  return Reflection;
};
