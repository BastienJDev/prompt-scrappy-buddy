import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Lextenso() {
  useEffect(() => {
    triggerAutoLogin('lextenso', SITE_CONFIGS.lextenso.startUrl);
  }, []);

  return null;
}