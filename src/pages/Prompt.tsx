import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SiteEntry {
  category: string;
  siteName: string;
}

export default function Prompt() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [result, setResult] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const { data, error } = await supabase
        .from("scraped_sites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedSites = data.map((site: any) => ({
        category: site.category,
        siteName: site.site_name,
      }));

      setSites(formattedSites);
    } catch (error) {
      console.error("Error loading sites:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites",
        variant: "destructive",
      });
    } finally {
      setLoadingSites(false);
    }
  };

  const categories = Array.from(new Set(sites.map(s => s.category))).filter(Boolean);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Aucune catégorie sélectionnée",
        description: "Veuillez sélectionner au moins une catégorie",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      // Get sites for selected categories
      const selectedSites = sites.filter(s => selectedCategories.includes(s.category));
      
      const { data, error } = await supabase.functions.invoke("scrape-and-reform", {
        body: { 
          sites: selectedSites,
          prompt: prompt.trim() || null,
          useAI 
        },
      });

      if (error) throw error;

      setResult(data.result);
      toast({
        title: "Succès",
        description: useAI 
          ? "Contenu scrappé et reformulé avec succès"
          : "Contenu scrappé avec succès",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSites) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 px-4 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Chargement des sites...</p>
          </div>
        </main>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 px-4 pb-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Card className="p-12 border-border">
              <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Aucun site enregistré
              </h2>
              <p className="text-muted-foreground mb-6">
                Veuillez d'abord importer un fichier Excel sur la page Import
              </p>
              <Button
                onClick={() => window.location.href = "/"}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] transition-all"
              >
                Aller à la page Import
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
                Scrapper & Reformuler
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Sélectionnez les catégories à scrapper
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">
                      Catégories ({selectedCategories.length} sélectionnée{selectedCategories.length > 1 ? 's' : ''})
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      {selectedCategories.length === categories.length ? "Tout désélectionner" : "Tout sélectionner"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                          selectedCategories.includes(category)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label
                          htmlFor={category}
                          className="flex-1 cursor-pointer text-sm font-medium"
                        >
                          {category}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({sites.filter(s => s.category === category).length} sites)
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Sparkles className={`w-5 h-5 ${useAI ? "text-accent" : "text-muted-foreground"}`} />
                    <div>
                      <Label htmlFor="ai-toggle" className="text-sm font-medium cursor-pointer">
                        Reformulation IA
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {useAI ? "Reformule le contenu avec l'IA" : "Retourne le contenu brut"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="ai-toggle"
                    checked={useAI}
                    onCheckedChange={setUseAI}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    {useAI ? "Prompt de reformulation" : "Instructions de scraping"}
                  </label>
                  <Textarea
                    placeholder={
                      useAI
                        ? "Comment souhaitez-vous reformuler le contenu ? Ex: Résume ce texte en 3 points clés..."
                        : "Instructions optionnelles pour le scraping. Ex: Extraire uniquement les titres et descriptions..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border focus:border-accent transition-colors resize-none"
                    disabled={isLoading}
                  />
                  {!useAI && (
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour récupérer tout le contenu brut
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent to-accent-glow hover:shadow-[0_0_20px_rgba(255,153,0,0.4)] transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {useAI ? "Scrapper et reformuler" : "Scrapper uniquement"}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {result && (
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-accent/10 to-primary/10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-semibold text-foreground">Résultat</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {result}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
