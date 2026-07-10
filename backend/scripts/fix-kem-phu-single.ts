// One-off data fix: "Kem phủ" option groups must be single-select.
// The seed CSV has been corrected; this aligns existing rows in the DB.
// Run: npx tsx scripts/fix-kem-phu-single.ts
import { prisma } from "../src/config/database";

async function main() {
  const result = await prisma.optionGroup.updateMany({
    where: { name: "Kem phủ" },
    data: { isMultiple: false }
  });
  console.log(`Updated ${result.count} "Kem phủ" option groups to single-select.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
