const { XezeCoreClient } = require("@xeze/dbr-core");

async function main() {
  const db = await XezeCoreClient.create("xms");
  await db.initWorkspace();

  // Postgres
  await db.pgInsert("students", { name: "Ayush", grade: "A" });
  const rows = await db.pgQuery("SELECT * FROM students");
  console.log(rows);

  // MongoDB
  await db.mongoInsert("audit_logs", { action: "student_added" });

  // Redis
  await db.redisSet("cache:student:latest", "Ayush", 300);
  const val = await db.redisGet("cache:student:latest");
  console.log(val); // "Ayush"

  db.close();
}

main().catch(console.error);
