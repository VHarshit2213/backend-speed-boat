import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class NextAction extends Model {
    static associate(models) {
      NextAction.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
      NextAction.belongsTo(models.User, { foreignKey: "deleted_by", as: "deletedByUser" });
    }
  }

  NextAction.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      task: { type: DataTypes.TEXT, allowNull: false },
      owner: { type: DataTypes.TEXT, allowNull: false },
      due_date: DataTypes.DATE,
      status: { type: DataTypes.TEXT, defaultValue: "Open" },
      position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      started_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      deleted_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: "NextAction",
      tableName: "next_actions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return NextAction;
};
