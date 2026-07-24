import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopForm } from "../ShopForm";
import { BarberLoginPanel } from "../BarberLoginPanel";

export default async function EditShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({ where: { id }, include: { barberUser: true } });
  if (!shop) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Edit Shop</h1>
      <ShopForm initial={{ id: shop.id, name: shop.name, address: shop.address, active: shop.active }} />

      <div className="mt-6">
        <BarberLoginPanel shopId={shop.id} existingEmail={shop.barberUser?.email ?? null} />
      </div>
    </div>
  );
}
