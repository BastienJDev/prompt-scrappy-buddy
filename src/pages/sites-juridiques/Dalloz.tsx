import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Dalloz() {
  useEffect(() => {
    triggerAutoLogin('dalloz', SITE_CONFIGS.dalloz.startUrl);
  }, []);

  return null;
}