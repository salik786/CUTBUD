import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const STYLES = [
  {
    name: "Textured crop",
    description: "Short, low-maintenance, textured on top with a tapered back and sides.",
    basePrompt: "textured crop haircut, short textured top, tapered sides, natural finish",
    faceShapeFit: "oval,square",
    guardNumber: "2",
    lengthMm: "20",
    fadeType: "low taper",
    imageUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_065727_d8c2ef49-a08b-455c-9267-dd7b7ddfbe91.png",
  },
  {
    name: "Skin fade pompadour",
    description: "Classic volume on top with a sharp skin fade on the sides.",
    basePrompt: "pompadour haircut with skin fade sides, high volume front, glossy finish",
    faceShapeFit: "oval,diamond,heart",
    guardNumber: "0",
    lengthMm: "40",
    fadeType: "skin fade",
    imageUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_065838_d83acc83-de58-42f7-893c-409685207da0.png",
  },
  {
    name: "Buzz cut",
    description: "Uniform short length all over, minimal upkeep.",
    basePrompt: "buzz cut, uniform short length, clean edges",
    faceShapeFit: "oval,round,square",
    guardNumber: "3",
    lengthMm: "10",
    fadeType: "none",
    imageUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_070415_2c42fbf0-e93e-430a-b5b5-9ae92d530c6b.png",
  },
  {
    name: "Curly crop with fade",
    description: "Natural curls left longer on top, mid fade on the sides.",
    basePrompt: "curly crop haircut, natural curls on top, mid fade sides",
    faceShapeFit: "oval,round",
    guardNumber: "3",
    lengthMm: "30",
    fadeType: "mid fade",
    imageUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_070747_4ec3a01c-47f8-41c5-bc8a-765b8c95279a.png",
  },
  {
    name: "Slick back undercut",
    description: "Longer top styled straight back, disconnected undercut.",
    basePrompt: "slicked back undercut, long top styled backward, disconnected sides",
    faceShapeFit: "square,diamond",
    guardNumber: "1",
    lengthMm: "50",
    fadeType: "undercut",
    imageUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_070846_f9340e31-8b2d-4361-adf8-a56439a68406.png",
  },
];

async function main() {
  const shop = await prisma.shop.upsert({
    where: { entryQrToken: "demo-shop-entry" },
    update: {},
    create: {
      name: "Fade & Co. Barbershop",
      address: "12 High Street, London",
      entryQrToken: "demo-shop-entry",
      exitQrToken: "demo-shop-exit",
      active: true,
    },
  });

  for (const style of STYLES) {
    const existing = await prisma.styleCatalog.findFirst({ where: { name: style.name } });
    if (existing) {
      if (style.imageUrl && existing.imageUrl !== style.imageUrl) {
        await prisma.styleCatalog.update({ where: { id: existing.id }, data: { imageUrl: style.imageUrl } });
      }
    } else {
      await prisma.styleCatalog.create({ data: { id: nanoid(), ...style } });
    }
  }

  console.log("Seeded shop:", shop.name, "entry token:", shop.entryQrToken);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
