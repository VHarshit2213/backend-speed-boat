import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class SpeedboatAccess extends Model {
    static associate(models) {
      SpeedboatAccess.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      SpeedboatAccess.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
      });

      SpeedboatAccess.belongsTo(models.User, {
        foreignKey: "granted_by",
        as: "grantedBy",
      });
    }
  }

  SpeedboatAccess.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      speedboat_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      granted_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SpeedboatAccess",
      tableName: "speedboat_access",
      timestamps: true,
    }
  );

  return SpeedboatAccess;
};
