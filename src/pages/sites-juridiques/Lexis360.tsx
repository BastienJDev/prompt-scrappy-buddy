import { useEffect } from "react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Lexis360() {
  useEffect(() => {
    triggerAutoLogin('lexisnexis', SITE_CONFIGS.lexisnexis.startUrl);
  }, []);

  return null;
}