import { DataTypes, Model, Op } from "sequelize";

export default (sequelize) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.Speedboat, {
        foreignKey: "speedboat_id",
        as: "speedboat",
        onDelete: "CASCADE",
      });
    }
  }

  Document.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      speedboat_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Document",
      tableName: "documents",
      timestamps: true,
      defaultScope: { where: { [Op.or]: [{ is_deleted: false }, { is_deleted: null }] } },
    }
  );

  return Document;
};
