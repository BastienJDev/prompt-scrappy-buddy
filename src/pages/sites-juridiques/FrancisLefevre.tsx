import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function FrancisLefevre() {
  useEffect(() => {
    triggerAutoLogin('francislefebvre', SITE_CONFIGS.francislefebvre.startUrl);
  }, []);

  return null;
}