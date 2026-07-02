import DashboardLayout from "@/components/DashboardLayout";
import { ToasterWrapper } from "@/components/ToasterWrapper";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <ToasterWrapper />
    </>
  );
}
