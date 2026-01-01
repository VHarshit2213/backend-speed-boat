import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class BudgetResource extends Model {
    static associate(models) {
      BudgetResource.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  BudgetResource.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      week_start: { type: DataTypes.DATEONLY, allowNull: false },
      budget_spent: { type: DataTypes.DECIMAL, allowNull: true },
      budget_remaining: { type: DataTypes.DECIMAL, allowNull: true },
      resources_used: { type: DataTypes.TEXT, allowNull: true },
      resources_needed: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: "BudgetResource",
      tableName: "budget_resources",
      timestamps: true,
    }
  );

  return BudgetResource;
};
