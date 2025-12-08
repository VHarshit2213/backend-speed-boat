import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class NextAction extends Model {
    static associate(models) {
      NextAction.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  NextAction.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      speedboat_id: { type: DataTypes.UUID, allowNull: false },
      task: { type: DataTypes.STRING, allowNull: false },
      owner: { type: DataTypes.STRING, allowNull: false },
      due_date: DataTypes.DATE,
      status: { type: DataTypes.STRING(20), defaultValue: "open" },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { sequelize, modelName: "NextAction", tableName: "next_actions", timestamps: true, createdAt: "created_at", updatedAt: "updated_at", }
  );

  return NextAction;
};
