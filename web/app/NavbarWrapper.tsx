"use client";

import { usePathname } from "next/navigation";
import FixedNavbar from "./FixedNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Don't show navbar on settings page or edit-gravatar page
  if (pathname === "/settings" || pathname === "/edit-gravatar") {
    return null;
  }

  return <FixedNavbar />;
}
