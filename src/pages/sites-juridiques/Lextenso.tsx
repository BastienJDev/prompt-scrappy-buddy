import { Card } from "@/components/ui/card";
import { Scale, ExternalLink, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Lextenso() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                La Base Lextenso
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-muted-foreground text-lg">
                Plateforme juridique intelligente
              </p>
              <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
            </div>
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Scale className="w-12 h-12 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">À propos de La Base Lextenso</h2>
                  <p className="text-muted-foreground">Recherche juridique augmentée par l'intelligence artificielle</p>
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
                    <span>Recherche assistée par IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Base documentaire unifiée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Suggestions intelligentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Synthèses automatisées</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Accéder à La Base Lextenso
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
