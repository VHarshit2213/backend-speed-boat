import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Otp extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  Otp.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Inside Otp.init
      type: {
        type: DataTypes.ENUM("delete_account", "reset_password", "email_verification"),
        defaultValue: "email_verification",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { sequelize, modelName: "Otp" }
  );

  return Otp;
};