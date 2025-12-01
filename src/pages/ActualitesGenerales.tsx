import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ActualitesGenerales() {
  const [actualites, setActualites] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActualites = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('scrape-and-reform', {
          body: {
            sites: [
              {
                category: "Actualités générales",
                siteName: "Les Échos",
                url: "https://www.lesechos.fr/"
              }
            ],
            prompt: "Extraire les dernières actualités économiques et générales",
            useAI: true
          }
        });

        if (error) {
          console.error("Erreur lors du scraping:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les actualités des Échos",
            variant: "destructive"
          });
          return;
        }

        if (data?.result) {
          setActualites(data.result);
        }
      } catch (err) {
        console.error("Erreur:", err);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des actualités",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActualites();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Actualités générales
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Les dernières mises à jour et nouvelles de la plateforme
            </p>
          </div>

          {isLoading ? (
            <Card className="border-border p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">
                Chargement des actualités des Échos...
              </p>
            </Card>
          ) : actualites ? (
            <Card className="border-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Les Échos - Actualités du jour
                  </h2>
                  <Badge className="bg-primary text-white">En direct</Badge>
                </div>
                <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {actualites}
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-transparent" />
            </Card>
          ) : (
            <Card className="border-border p-12 text-center">
              <p className="text-muted-foreground text-lg">
                Aucune actualité disponible pour le moment
              </p>
            </Card>
          )}

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Restez informé
            </h3>
            <p className="text-muted-foreground">
              De nouvelles fonctionnalités et améliorations arrivent régulièrement. Consultez cette page pour ne rien manquer !
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
