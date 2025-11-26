/**
 * Run this script to seed DB with sample speedboats + relations.
 * Usage: node seeders/seed-speedboats.js (or wire into your npm script)
 *
 * The sample data below is taken from the uploaded specification file:
 * /mnt/data/speed boat DB structure.docx
 * (You can find the original file at that path). :contentReference[oaicite:1]{index=1}
 */

import models from "../models/index.js";
import dayjs from "dayjs";

const { Speedboat, CrewMember, KPI, Milestone, NextAction, Reflection, Dependency } = models;

const seed = async () => {
  try {
    // clear tables (careful in production)
    await Dependency.destroy({ where: {} });
    await Reflection.destroy({ where: {} });
    await NextAction.destroy({ where: {} });
    await Milestone.destroy({ where: {} });
    await KPI.destroy({ where: {} });
    await CrewMember.destroy({ where: {} });
    await Speedboat.destroy({ where: {} });

    // Speedboat 1
    const sb1 = await Speedboat.create({
      name: "Onboarding 2.0",
      purpose: "Reduce onboarding time while increasing quality.",
      mission: "Shorten client onboarding from 21 → 7 days and raise NPS by +10.",
      captain: "Carolina C.",
      sponsor: "COO",
      mentor: "Luis P.",
      health: "yellow",
      progress: 45
    });

    await CrewMember.bulkCreate([
      { speedboat_id: sb1.id, name: "Ana" },
      { speedboat_id: sb1.id, name: "Marco" },
      { speedboat_id: sb1.id, name: "Daniel" },
    ]);

    await KPI.bulkCreate([
      { speedboat_id: sb1.id, name: "Avg Onboarding Days", baseline: 21, target: 7, current: 14, unit: "days" },
      { speedboat_id: sb1.id, name: "NPS Onboarding", baseline: 38, target: 48, current: 44, unit: "score" },
    ]);

    await Milestone.bulkCreate([
      { speedboat_id: sb1.id, title: "Playbook v1", due_date: dayjs("2025-11-20").toDate(), status: "on-track" },
      { speedboat_id: sb1.id, title: "Automation Pilot", due_date: dayjs("2025-12-05").toDate(), status: "pending" },
    ]);

    // Speedboat 2
    const sb2 = await Speedboat.create({
      name: "AI Talent Matcher",
      purpose: "Increase match quality and reduce time-to-fill.",
      mission: "Lift match quality +15% and reduce time-to-fill by 30%.",
      captain: "Luis A.",
      sponsor: "CTO",
      mentor: "Julio R.",
      health: "green",
      progress: 62
    });

    await CrewMember.bulkCreate([
      { speedboat_id: sb2.id, name: "Sahil" },
      { speedboat_id: sb2.id, name: "Maya" },
    ]);

    await KPI.bulkCreate([
      { speedboat_id: sb2.id, name: "Match Quality", baseline: 72, target: 87, current: 79, unit: "%" },
      { speedboat_id: sb2.id, name: "Time-to-Fill", baseline: 28, target: 19, current: 23, unit: "days" },
    ]);

    await Milestone.bulkCreate([
      { speedboat_id: sb2.id, title: "Feature Store v0", due_date: dayjs("2025-11-25").toDate(), status: "on-track" },
      { speedboat_id: sb2.id, title: "Pilot with 3 clients", due_date: dayjs("2025-12-15").toDate(), status: "pending" },
    ]);

    // Speedboat 3
    const sb3 = await Speedboat.create({
      name: "Contract Simplification",
      purpose: "Reduce contract cycle by 50%.",
      mission: "Simplify contract terms without increasing risk.",
      captain: "Natalia P.",
      sponsor: "CLO",
      mentor: "Byron",
      health: "red",
      progress: 30
    });

    await KPI.create({ speedboat_id: sb3.id, name: "Contract Cycle (days)", baseline: 14, target: 7, current: 16, unit: "days" });
    await Milestone.bulkCreate([
      { speedboat_id: sb3.id, title: "Clause Library v1", due_date: dayjs("2025-11-22").toDate(), status: "at-risk" },
      { speedboat_id: sb3.id, title: "E-sign Rollout", due_date: dayjs("2025-12-08").toDate(), status: "pending" },
    ]);

    // dependencies: Onboarding 2.0 depends on Contract Simplification
    await Dependency.create({ speedboat_id: sb1.id, depends_on_speedboat_id: sb3.id });

    console.log("Seeding finished.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
