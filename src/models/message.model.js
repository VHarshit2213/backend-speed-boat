import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
      Message.belongsTo(models.User, { foreignKey: "deleted_by", as: "deletedByUser" });
    }
  }

  Message.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      sender_name: { type: DataTypes.TEXT, allowNull: true },
      sender_role: { type: DataTypes.TEXT, allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      deleted_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return Message;
};
