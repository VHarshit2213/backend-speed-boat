import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class Dependency extends Model {
    static associate(models) {

      Dependency.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE"
      });

      Dependency.belongsTo(models.Speedboat, {
        foreignKey: "depends_on_speedboat_id",
        as: "dependsOnSpeedboat",
        onDelete: "CASCADE"
      });
    }
  }

  Dependency.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      depends_on_speedboat_id: { type: DataTypes.UUID, allowNull: false },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Dependency",
      tableName: "dependencies",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["speedboat_id", "depends_on_speedboat_id"] },
      ],
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return Dependency;
};
