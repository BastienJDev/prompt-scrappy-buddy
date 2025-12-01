import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Lamyline() {
  useEffect(() => {
    triggerAutoLogin('lamyline', SITE_CONFIGS.lamyline.startUrl);
  }, []);

  return null;
}