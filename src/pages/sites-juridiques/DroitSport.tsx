import { Card } from "@/components/ui/card";
import { Scale, ExternalLink, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DroitSport() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Droit du sport
              </h1>
            </div>
            <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              Documentation juridique sportive spécialisée
            </p>
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Scale className="w-12 h-12 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">À propos de Droit du sport</h2>
                  <p className="text-muted-foreground">Expertise juridique dédiée au monde sportif</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Ressources disponibles
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Droit des contrats sportifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Réglementation des fédérations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Jurisprudence sportive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Arbitrage et sanctions</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Accéder à Droit du sport
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
