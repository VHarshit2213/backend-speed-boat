import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class StatusHistory extends Model {
    static associate(models) {
      StatusHistory.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });

      StatusHistory.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "author"
      });
    }
  }

  StatusHistory.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false },
      category: { type: DataTypes.STRING(50) },
      details: { type: DataTypes.TEXT },
      kpi_ids: { type: DataTypes.ARRAY(DataTypes.UUID), defaultValue: [] },
      created_by: { type: DataTypes.UUID },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "StatusHistory",
      tableName: "status_history",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return StatusHistory;
};
