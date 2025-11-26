import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
     
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
        type: DataTypes.STRING,
        allowNull: true, // user might not have uploaded a picture yet
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "user"
        ),
        defaultValue:"user",
      },

      password: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: "User" }
  );

  return User;
};


