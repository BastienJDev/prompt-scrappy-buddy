import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, Search, ExternalLink, MapPin, Briefcase, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SiteEntry {
  category: string;
  siteName: string;
  url: string;
}

interface JobOffer {
  title: string;
  location: string;
  contract: string;
  salary: string;
  description: string;
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

      // Lancer le scraping avec reformulation IA
      const promptText = searchQuery || "Extrais toutes les offres d'emploi sportives disponibles";
      const { data, error } = await supabase.functions.invoke('scrape-and-reform', {
        body: {
          sites: formattedSites,
          prompt: `${promptText}. Pour chaque offre, structure les informations ainsi :

**Titre du poste**
📍 Localisation | 📅 Type de contrat | 💰 Salaire (si disponible)

Description courte de l'offre

🔗 URL: [lien exact de l'offre]

Sépare chaque offre par une ligne vide. Inclus UNIQUEMENT les offres d'emploi actuelles et disponibles.`,
          useAI: true,
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

  // Parser les offres du résultat
  const parseOffers = (text: string): JobOffer[] => {
    const offers: JobOffer[] = [];
    const sections = text.split(/\n\n+/);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      const lines = section.split('\n');
      let title = '';
      let location = '';
      let contract = '';
      let salary = '';
      let description = '';
      let url = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Titre (ligne qui commence par ** ou est la première ligne importante)
        if (line.startsWith('**') && line.endsWith('**')) {
          title = line.replace(/\*\*/g, '');
        } else if (!title && line && !line.includes('URL:') && !line.includes('📍')) {
          title = line;
        }
        
        // Métadonnées (localisation, contrat, salaire)
        if (line.includes('📍') || line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          for (const part of parts) {
            if (part.includes('📍')) {
              location = part.replace('📍', '').trim();
            } else if (part.includes('📅')) {
              contract = part.replace('📅', '').trim();
            } else if (part.includes('💰')) {
              salary = part.replace('💰', '').trim();
            }
          }
        }
        
        // URL
        if (line.includes('🔗') || line.toLowerCase().includes('url:')) {
          const urlMatch = line.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            url = urlMatch[0];
          }
        }
        
        // Description (lignes normales sans métadonnées)
        if (!line.includes('URL:') && !line.includes('🔗') && !line.includes('📍') && 
            !line.includes('**') && line.length > 20 && !title.includes(line)) {
          description += line + ' ';
        }
      }
      
      if (title && url) {
        offers.push({
          title: title.trim(),
          location: location || 'Non spécifié',
          contract: contract || 'Non spécifié',
          salary: salary || 'Non spécifié',
          description: description.trim() || 'Aucune description disponible',
          url: url.trim()
        });
      }
    }
    
    return offers;
  };

  const offers = parseOffers(result);

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
                Cliquez sur rechercher pour trouver des offres d&apos;emploi sportives
              </p>
            </Card>
          ) : offers.length === 0 ? (
            <Card className="border-border p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                Aucune offre trouvée. Essayez une autre recherche.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer, index) => (
                <Card 
                  key={index}
                  className="border-border overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-2xl font-bold text-foreground flex-1">
                          {offer.title}
                        </h2>
                        <Trophy className="w-6 h-6 text-accent flex-shrink-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {offer.location !== 'Non spécifié' && (
                          <Badge variant="secondary" className="bg-secondary/50">
                            <MapPin className="w-3 h-3 mr-1" />
                            {offer.location}
                          </Badge>
                        )}
                        {offer.contract !== 'Non spécifié' && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {offer.contract}
                          </Badge>
                        )}
                        {offer.salary !== 'Non spécifié' && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {offer.salary}
                          </Badge>
                        )}
                      </div>

                      {offer.description && (
                        <p className="text-foreground/80 leading-relaxed">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border">
                      <Button
                        onClick={() => window.open(offer.url, '_blank')}
                        className="bg-accent hover:bg-accent/90 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l&apos;offre
                      </Button>
                    </div>
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
