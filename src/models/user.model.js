import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Otp, { foreignKey: "userId", as: "otps", onDelete: 'CASCADE' });
      this.hasMany(models.Speedboat, { foreignKey: "userId", as: "speedboats", onDelete: 'CASCADE' });
      User.belongsToMany(models.Speedboat, {
        through: models.SpeedboatAccess,
        foreignKey: "user_id",
        otherKey: "speedboat_id",
        as: "sharedSpeedboats",
      });

    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
      profileImage: {
        type: DataTypes.TEXT,
        allowNull: true, // user might not have uploaded a picture yet
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "crew",
          "captain"
        ),
        defaultValue: "user",
      },

      password: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, modelName: "User" }
  );

  return User;
};


