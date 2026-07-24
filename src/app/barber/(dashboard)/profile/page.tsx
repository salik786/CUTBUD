import { redirect } from "next/navigation";
import { getBarberUser } from "@/lib/barberAuth";
import { ProfileForm } from "./ProfileForm";

export default async function BarberProfilePage() {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  const shop = barber.shop;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Shop Profile</h1>
      <p className="mt-1 text-sm text-muted">
        This is what customers see after scanning your QR code.
      </p>
      <ProfileForm
        initial={{
          name: shop.name,
          address: shop.address,
          description: shop.description ?? "",
          logoUrl: shop.logoUrl ?? "",
          coverImageUrl: shop.coverImageUrl ?? "",
          phone: shop.phone ?? "",
          whatsapp: shop.whatsapp ?? "",
          instagram: shop.instagram ?? "",
          facebook: shop.facebook ?? "",
          website: shop.website ?? "",
          openingHours: shop.openingHours ?? "",
        }}
      />
    </div>
  );
}
