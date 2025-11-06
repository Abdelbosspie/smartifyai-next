"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Overview from "./overview/page";

export default function Page() {
  return <Overview />;
}