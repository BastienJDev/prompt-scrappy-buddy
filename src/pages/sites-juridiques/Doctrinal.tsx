import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Doctrinal() {
  useEffect(() => {
    triggerAutoLogin('ledoctrinal', SITE_CONFIGS.ledoctrinal.startUrl);
  }, []);

  return null;
}