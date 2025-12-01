import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Loader2, Search, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SiteEntry {
  category: string;
  siteName: string;
  url: string;
}

export default function OffresSportives() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState("");
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSitesAndScrape();
  }, []);

  const loadSitesAndScrape = async () => {
    try {
      setIsLoading(true);
      
      // Charger les sites de la catégorie "Offres sportives"
      const { data: scrapedSites, error: sitesError } = await supabase
        .from('scraped_sites')
        .select('*')
        .eq('category', 'Offres sportives');

      if (sitesError) {
        console.error('Error loading sites:', sitesError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sites sportifs",
          variant: "destructive",
        });
        return;
      }

      if (!scrapedSites || scrapedSites.length === 0) {
        toast({
          title: "Aucun site",
          description: "Aucun site sportif configuré",
          variant: "destructive",
        });
        return;
      }

      const formattedSites = scrapedSites.map(site => ({
        category: site.category,
        siteName: site.site_name,
        url: site.url || '',
      }));

      setSites(formattedSites);

      // Lancer le scraping
      const { data, error } = await supabase.functions.invoke('scrape-and-reform', {
        body: {
          sites: formattedSites,
          prompt: searchQuery || "offres d'emploi sportives disponibles",
          useAI: false,
        },
      });

      if (error) {
        console.error('Error scraping:', error);
        toast({
          title: "Erreur de scraping",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResult(data.result || "Aucune offre trouvée");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (sites.length > 0) {
      loadSitesAndScrape();
    }
  };

  // Extraire les URLs du résultat
  const extractUrls = (text: string): Array<{ text: string; url: string }> => {
    const urlPattern = /🔗\s*URL:\s*(https?:\/\/[^\s\n]+)/gi;
    const sections: Array<{ text: string; url: string }> = [];
    const lines = text.split('\n');
    
    let currentSection = '';
    
    for (const line of lines) {
      const urlMatch = line.match(urlPattern);
      if (urlMatch) {
        if (currentSection.trim()) {
          sections.push({
            text: currentSection.trim(),
            url: urlMatch[1] || line.match(/https?:\/\/[^\s\n]+/)?.[0] || '#'
          });
          currentSection = '';
        }
      } else {
        currentSection += line + '\n';
      }
    }
    
    if (currentSection.trim()) {
      sections.push({ text: currentSection.trim(), url: '#' });
    }
    
    return sections;
  };

  const sections = extractUrls(result);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
                Offres d'emploi sportives
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Les opportunités dans le monde du sport
            </p>
          </div>

          <Card className="border-border p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher des offres d'emploi sportives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {isLoading ? (
            <Card className="border-border p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">
                Recherche des offres sportives en cours...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Scraping de {sites.length} sites sportifs
              </p>
            </Card>
          ) : !result ? (
            <Card className="border-border p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                Cliquez sur rechercher pour trouver des offres d'emploi sportives
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card 
                  key={index}
                  className="border-border overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <Trophy className="w-6 h-6 text-accent" />
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {section.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {section.url !== '#' && (
                      <div className="pt-2 border-t border-border">
                        <Button
                          onClick={() => window.open(section.url, '_blank')}
                          className="bg-accent hover:bg-accent/90 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir l'offre
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-1 bg-gradient-to-r from-accent/50 via-primary/50 to-transparent" />
                </Card>
              ))}
            </div>
          )}

          <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Configurez vos alertes sportives
            </h3>
            <p className="text-muted-foreground mb-4">
              Utilisez la page Gestion des sites pour ajouter vos sites d'emploi sportifs préférés et recevoir les dernières offres automatiquement.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Gérer mes sources
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
