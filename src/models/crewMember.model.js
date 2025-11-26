import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class CrewMember extends Model {
    static associate(models) {
      CrewMember.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
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
    },
    { sequelize, modelName: "CrewMember", tableName: "crew_members", timestamps: false }
  );

  return CrewMember;
};
