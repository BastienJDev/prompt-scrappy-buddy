import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function DroitSport() {
  useEffect(() => {
    triggerAutoLogin('droitdusport', SITE_CONFIGS.droitdusport.startUrl);
  }, []);

  return null;
}