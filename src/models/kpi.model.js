import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class KPI extends Model {
    static associate(models) {
      KPI.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
      KPI.belongsTo(models.User, { foreignKey: "deleted_by", as: "deletedByUser" });
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
      position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      deleted_by: { type: DataTypes.UUID, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    },
    {
      sequelize,
      modelName: "KPI",
      tableName: "kpis",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return KPI;
};
