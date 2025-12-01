import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Cairn() {
  useEffect(() => {
    triggerAutoLogin('cairn', SITE_CONFIGS.cairn.startUrl);
  }, []);

  return null;
}