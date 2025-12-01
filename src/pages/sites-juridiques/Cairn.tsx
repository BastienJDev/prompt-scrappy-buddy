import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { triggerAutoLogin, SITE_CONFIGS } from "@/lib/auto-login";

export default function Cairn() {
  const handleClick = () => {
    triggerAutoLogin('cairn', SITE_CONFIGS.cairn.startUrl);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Button
        onClick={handleClick}
        size="lg"
        className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 h-auto"
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        Accéder à Cairn
      </Button>
    </div>
  );
}