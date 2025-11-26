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
      name: { type: DataTypes.TEXT, allowNull: false },
      baseline: DataTypes.DECIMAL,
      target: DataTypes.DECIMAL,
      current: DataTypes.DECIMAL,
      unit: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: "KPI", tableName: "kpis", timestamps: false }
  );

  return KPI;
};
