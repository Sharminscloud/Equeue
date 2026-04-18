import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Branch from "../models/Branch.js";
import Service from "../models/Service.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await Branch.deleteMany();
    await Service.deleteMany();

    await Branch.insertMany([
      { name: "Main Branch" },
      { name: "North Branch" },
      { name: "South Branch" }
    ]);

    await Service.insertMany([
      { name: "New Application" },
      { name: "Renewal" },
      { name: "Verification" },
      { name: "Collection" }
    ]);

    console.log("Seed data inserted successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();