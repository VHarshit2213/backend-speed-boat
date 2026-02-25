import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class CrewMember extends Model {
    static associate(models) {
      CrewMember.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
      CrewMember.belongsTo(models.User, { foreignKey: "deleted_by", as: "deletedByUser" });
    }
  }

  CrewMember.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.TEXT, allowNull: false },
      slack_id: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      deleted_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: "CrewMember",
      tableName: "crew_members",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return CrewMember;
};
