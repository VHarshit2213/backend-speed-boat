import { Sequelize } from "sequelize";
import { env } from "../config/env.js";

// Import model definitions
import UserModel from "./user.model.js";
import DependencyModel from "./dependency.model.js";
import SpeedboatModel from "./speedboat.model.js";
import CrewMemberModel from "./crewMember.model.js";
import KPIModel from "./kpi.model.js";
import MilestoneModel from "./milestone.model.js";
import NextActionModel from "./nextAction.model.js";
import ReflectionModel from "./reflection.model.js";

// Init Sequelize
const sequelize = new Sequelize(env.DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: false, // 
  }
});

// Initialize models
const models = {
  User: UserModel(sequelize),
  Dependency: DependencyModel(sequelize),
  Speedboat: SpeedboatModel(sequelize),
  CrewMember: CrewMemberModel(sequelize),
  KPI: KPIModel(sequelize),
  Milestone: MilestoneModel(sequelize),
  NextAction: NextActionModel(sequelize),
  Reflection: ReflectionModel(sequelize),
};

// Apply associations
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

models.sequelize = sequelize;

export { sequelize };
export default models;
