import fs from "fs";
import path from "path";
import { prisma } from "../src/config/database";
import { cloudinary } from "../src/config/cloudinary";

const frontendPublicDir = path.resolve(__dirname, "../../frontend/public");

const optionAssetByKey: Record<string, string> = {
  banhquy: "/assets/images/topping-cookie.png",
  camtuoi: "/assets/images/topping-cam.png",
  chocolate: "/assets/images/mut-socola.png",
  dautuoi: "/assets/images/toppping-dau.png",
  ganachesocola: "/assets/images/kemphu-socola.png",
  kembo: "/assets/images/kemphu-bo.png",
  kemphomai: "/assets/images/nhan-kemphomai.png",
  kemtuoihong: "/assets/images/kemphu-dau.png",
  mutdau: "/assets/images/mutdau.png",
  nhanhatcaramel: "/assets/images/nhan-caramel.png",
  socola: "/assets/images/topping-socola.png",
  whippingcream: "/assets/images/topping-whipcream.png"
};

const optionNameKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const uploadAsset = async (assetPath: string, key: string) => {
  const localPath = path.join(frontendPublicDir, assetPath.replace(/^\//, ""));
  if (!fs.existsSync(localPath)) {
    throw new Error(`Missing option image asset: ${localPath}`);
  }

  const result = await cloudinary.uploader.upload(localPath, {
    folder: "webee/options/seed",
    public_id: key,
    overwrite: true,
    resource_type: "image"
  });

  return result.secure_url;
};

async function main() {
  const items = await prisma.optionItem.findMany({
    select: { itemId: true, name: true }
  });

  const uploadedByKey = new Map<string, string>();
  let updated = 0;

  for (const item of items) {
    const key = optionNameKey(item.name);
    const assetPath = optionAssetByKey[key];
    if (!assetPath) continue;

    const imageUrl = uploadedByKey.get(key) ?? await uploadAsset(assetPath, key);
    uploadedByKey.set(key, imageUrl);

    await prisma.optionItem.update({
      where: { itemId: item.itemId },
      data: { imageUrl }
    });
    updated += 1;
  }

  console.log(`Option image seed done. Uploaded: ${uploadedByKey.size}. Updated items: ${updated}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
