import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Milestone extends Model {
    static associate(models) {
      Milestone.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  Milestone.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.TEXT, allowNull: false },
      due_date: DataTypes.DATE,
      status: { type: DataTypes.TEXT, defaultValue: "Pending" },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { sequelize, modelName: "Milestone", tableName: "milestones", timestamps: true, createdAt: "created_at", updatedAt: "updated_at", }
  );

  return Milestone;
};
