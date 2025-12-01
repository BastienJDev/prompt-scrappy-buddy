import { Card } from "@/components/ui/card";
import { Scale, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Lexis360() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Lexis 360
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Solution de recherche juridique intelligente
            </p>
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Scale className="w-12 h-12 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">À propos de Lexis 360</h2>
                  <p className="text-muted-foreground">Plateforme complète de documentation et recherche juridique</p>
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
                    <span>Fonds documentaire complet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Recherche intelligente par IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Alertes et veille juridique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Analyse jurisprudentielle</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Accéder à Lexis 360
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
