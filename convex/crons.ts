import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process pending lead handoffs",
  { minutes: 1 },
  internal.assessments.processPendingLeadHandoffs,
  {},
);

export default crons;
