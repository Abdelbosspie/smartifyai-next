import { redirect } from "next/navigation";

export default function DashboardIndex() {
  redirect("/dashboard/agents");
  return null;
}