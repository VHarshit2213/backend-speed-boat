import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  Message.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      sender_name: { type: DataTypes.TEXT, allowNull: true },
      sender_role: { type: DataTypes.TEXT, allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
    }
  );

  return Message;
};
