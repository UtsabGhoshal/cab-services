#!/usr/bin/env node

import { migratePasswordsToHashed } from "../firebase/firebaseDatabase";

async function runMigration() {
  try {
    console.log("🔐 Starting password migration...");
    await migratePasswordsToHashed();
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
