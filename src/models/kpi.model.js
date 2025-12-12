import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class KPI extends Model {
    static associate(models) {
      KPI.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  KPI.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      baseline: DataTypes.DECIMAL,
      target: DataTypes.DECIMAL,
      current: DataTypes.DECIMAL,
      unit: DataTypes.STRING,
      isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    },
    { sequelize, modelName: "KPI", tableName: "kpis", timestamps: true,createdAt: "created_at", updatedAt: "updated_at", }
  );

  return KPI;
};
