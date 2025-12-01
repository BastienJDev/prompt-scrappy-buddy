import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Trophy } from "lucide-react";

export default function ActualitesSportives() {
  const actualites = [
    {
      id: 1,
      titre: "Ligue 1 : PSG en tête du championnat",
      date: "2025-01-14",
      categorie: "Football",
      description: "Le Paris Saint-Germain conserve sa première place après une victoire convaincante 3-0 face à Lyon.",
      badge: "Football",
      badgeColor: "bg-green-600 text-white"
    },
    {
      id: 2,
      titre: "Roland-Garros : Les inscriptions sont ouvertes",
      date: "2025-01-12",
      categorie: "Tennis",
      description: "Le tournoi de tennis de Roland-Garros ouvre ses inscriptions pour l'édition 2025 avec de nouvelles modalités.",
      badge: "Tennis",
      badgeColor: "bg-orange-600 text-white"
    },
    {
      id: 3,
      titre: "NBA : Record historique battu",
      date: "2025-01-08",
      categorie: "Basketball",
      description: "Un nouveau record de points marqués en une saison a été établi par une star montante de la NBA.",
      badge: "Basketball",
      badgeColor: "bg-blue-600 text-white"
    },
    {
      id: 4,
      titre: "Tour de France : Nouveau parcours dévoilé",
      date: "2025-01-03",
      categorie: "Cyclisme",
      description: "L'organisation du Tour de France a dévoilé un parcours inédit avec plusieurs étapes de montagne spectaculaires.",
      badge: "Cyclisme",
      badgeColor: "bg-yellow-600 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Actualités sportives
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Toutes les actualités du monde du sport
            </p>
          </div>

          <div className="grid gap-6">
            {actualites.map((actu, index) => (
              <Card 
                key={actu.id}
                className="border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-foreground">
                          {actu.titre}
                        </h2>
                        <Badge className={actu.badgeColor}>
                          {actu.badge}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(actu.date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{actu.categorie}</span>
                        </div>
                      </div>
                    </div>
                    <Trophy className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                  
                  <p className="text-foreground/80 leading-relaxed">
                    {actu.description}
                  </p>
                </div>
                
                <div className="h-1 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-transparent" />
              </Card>
            ))}
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-green-500/5 to-blue-500/5 p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Actualités sportives
            </h3>
            <p className="text-muted-foreground">
              Retrouvez toutes les actualités du monde du sport : football, tennis, basketball et plus encore !
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
