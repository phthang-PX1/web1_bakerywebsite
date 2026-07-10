import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ take: 5 });
  console.log("Original products in DB:", products.map(p => ({ id: p.productId, name: p.name, price: p.basePrice })));
  
  if (products.length > 0) {
    const first = products[0];
    const originalName = first.name;
    const updatedName = first.name + " (TEST)";
    
    console.log(`Updating product ${first.productId} to name: ${updatedName}`);
    const updated = await prisma.product.update({
      where: { productId: first.productId },
      data: { name: updatedName }
    });
    console.log("Updated result:", { id: updated.productId, name: updated.name });
    
    const reFetched = await prisma.product.findUnique({
      where: { productId: first.productId }
    });
    console.log("Re-fetched from DB:", { id: reFetched?.productId, name: reFetched?.name });
    
    // Revert back
    await prisma.product.update({
      where: { productId: first.productId },
      data: { name: originalName }
    });
    console.log("Reverted successfully.");
  }
}

main()
  .catch((e) => console.error("Error in test script:", e))
  .finally(() => prisma.$disconnect());
