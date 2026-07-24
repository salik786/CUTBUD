import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";
import { getDisplayImageUrl } from "@/lib/styleImage";
import { ShopStylesList } from "./ShopStylesList";

export default async function BarberStylesPage() {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  const [styles, shopStyles] = await Promise.all([
    prisma.styleCatalog.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.shopStyle.findMany({ where: { shopId: barber.shopId } }),
  ]);

  const shopStyleByStyleId = new Map(shopStyles.map((s) => [s.styleCatalogId, s]));

  const rows = styles.map((style) => {
    const shopStyle = shopStyleByStyleId.get(style.id);
    return {
      styleCatalogId: style.id,
      name: style.name,
      category: style.category,
      imageUrl: getDisplayImageUrl(style),
      available: shopStyle?.available ?? false,
      skillLevel: shopStyle?.skillLevel ?? "",
      price: shopStyle?.price ?? "",
      durationMin: shopStyle?.durationMin ?? null,
      requiresAppointment: shopStyle?.requiresAppointment ?? false,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Hairstyles</h1>
      <p className="mt-1 text-sm text-muted">
        Customers who scan your QR code only see styles you turn on here. Set a price and time so
        they know what to expect before they ask.
      </p>
      <ShopStylesList initialRows={rows} />
    </div>
  );
}
