import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Sparkles, Trophy } from "lucide-react";

export default function Actualites() {
  const actualitesGenerales = [
    {
      id: 1,
      titre: "Nouvelle fonctionnalité IA",
      date: "2025-01-15",
      categorie: "Mise à jour",
      description: "La reformulation IA est maintenant disponible avec des résultats encore plus précis et pertinents.",
      badge: "Nouveau",
      badgeColor: "bg-primary text-white"
    },
    {
      id: 2,
      titre: "Amélioration du scraping",
      date: "2025-01-10",
      categorie: "Performance",
      description: "Le système de scraping a été optimisé pour des temps de réponse jusqu'à 40% plus rapides.",
      badge: "Performance",
      badgeColor: "bg-accent text-white"
    },
    {
      id: 3,
      titre: "Nouvelles catégories disponibles",
      date: "2025-01-05",
      categorie: "Contenu",
      description: "Plusieurs nouvelles catégories de sites ont été ajoutées pour élargir vos possibilités de recherche.",
      badge: "Contenu",
      badgeColor: "bg-[hsl(235,45%,15%)] text-white"
    },
    {
      id: 4,
      titre: "Interface utilisateur améliorée",
      date: "2024-12-28",
      categorie: "Design",
      description: "Une nouvelle interface plus moderne et intuitive pour une meilleure expérience utilisateur.",
      badge: "Design",
      badgeColor: "bg-secondary text-foreground"
    }
  ];

  const actualitesSportives = [
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

  const renderActualites = (actualites: typeof actualitesGenerales) => (
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
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
            </div>
            
            <p className="text-foreground/80 leading-relaxed">
              {actu.description}
            </p>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-transparent" />
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Actualités
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Les dernières mises à jour et nouvelles
            </p>
          </div>

          <Tabs defaultValue="generales" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="generales" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Actualités générales
              </TabsTrigger>
              <TabsTrigger value="sportives" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Actualités sportives
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generales" className="space-y-6">
              {renderActualites(actualitesGenerales)}
              
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Restez informé
                </h3>
                <p className="text-muted-foreground">
                  De nouvelles fonctionnalités et améliorations arrivent régulièrement. Consultez cette page pour ne rien manquer !
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="sportives" className="space-y-6">
              {renderActualites(actualitesSportives)}
              
              <Card className="border-primary/30 bg-gradient-to-br from-green-500/5 to-blue-500/5 p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Actualités sportives
                </h3>
                <p className="text-muted-foreground">
                  Retrouvez toutes les actualités du monde du sport : football, tennis, basketball et plus encore !
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
