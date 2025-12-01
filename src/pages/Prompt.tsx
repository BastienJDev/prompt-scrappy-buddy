import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Zap, ChevronDown, FileDown, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import jsPDF from "jspdf";
import { Document, Paragraph, TextRun, Packer, ExternalHyperlink } from "docx";

interface SiteEntry {
  category: string;
  siteName: string;
  url: string;
}

export default function Prompt() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [result, setResult] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
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
        url: site.url,
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

  const categories = Array.from(new Set(sites.map(s => s.category)))
    .filter(Boolean)
    .filter(cat => cat !== "Offres sportives");

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Titre
    doc.setFontSize(16);
    doc.text("Résultat de recherche", margin, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, 30);
    
    // Contenu avec liens cliquables
    doc.setFontSize(11);
    const lines = result.split('\n');
    
    let y = 40;
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      
      // Détecter les URLs dans le texte
      const urlMatch = line.match(/🔗\s*URL:\s*(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        const url = urlMatch[1];
        const textBeforeUrl = line.substring(0, urlMatch.index);
        
        // Texte avant l'URL
        if (textBeforeUrl) {
          const beforeLines = doc.splitTextToSize(textBeforeUrl, maxWidth);
          for (const beforeLine of beforeLines) {
            if (y > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(beforeLine, margin, y);
            y += 7;
          }
        }
        
        // URL cliquable
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setTextColor(0, 0, 255);
        doc.textWithLink(`🔗 ${url}`, margin, y, { url });
        doc.setTextColor(0, 0, 0);
        y += 7;
      } else {
        // Ligne normale
        const wrappedLines = doc.splitTextToSize(line || " ", maxWidth);
        for (const wrappedLine of wrappedLines) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(wrappedLine, margin, y);
          y += 7;
        }
      }
    }
    
    doc.save(`recherche_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({
      title: "Export réussi",
      description: "Le PDF a été téléchargé avec liens cliquables",
    });
  };

  const exportToCSV = () => {
    const lines = result.split('\n').filter(line => line.trim());
    const csvContent = lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recherche_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Export réussi",
      description: "Le CSV a été téléchargé",
    });
  };

  const exportToDOCX = async () => {
    const lines = result.split('\n');
    const paragraphs: Paragraph[] = [];

    for (const line of lines) {
      // Détecter les URLs dans le texte
      const urlMatch = line.match(/🔗\s*URL:\s*(https?:\/\/[^\s]+)/i);
      
      if (urlMatch) {
        const url = urlMatch[1];
        const textBefore = line.substring(0, urlMatch.index).trim();
        
        // Ajouter le texte avant l'URL s'il existe
        if (textBefore) {
          paragraphs.push(new Paragraph({
            children: [new TextRun(textBefore)],
          }));
        }
        
        // Ajouter l'URL comme lien cliquable dans un nouveau paragraphe
        paragraphs.push(new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: `🔗 ${url}`,
                  style: "Hyperlink",
                }),
              ],
              link: url,
            }),
          ],
        }));
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun(line || " ")],
        }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Résultat de recherche",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date().toLocaleDateString('fr-FR')}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          ...paragraphs,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recherche_${new Date().toISOString().split('T')[0]}.docx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Export réussi",
      description: "Le document DOCX a été téléchargé avec liens cliquables",
    });
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
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

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

      setProgress(100);
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
      clearInterval(progressInterval);
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (loadingSites) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-8 px-4 pb-12">
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
        <main className="pt-8 px-4 pb-12">
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
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
                Bienvenue Enzo
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    {useAI ? "Faites votre recherche" : "Instructions de scraping"}
                  </label>
                  <Textarea
                    placeholder={
                      useAI
                        ? "Décrivez précisément ce que vous cherchez. Ex: Les horaires d'ouverture, les prix, les coordonnées de contact..."
                        : "Instructions optionnelles pour le scraping. Ex: Extraire uniquement les titres et descriptions..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border focus:border-accent transition-colors resize-none"
                    disabled={isLoading}
                  />
                  {useAI ? (
                    <p className="text-xs text-muted-foreground">
                      L'IA extraira uniquement les informations pertinentes à votre recherche
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour récupérer tout le contenu brut
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Catégories
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between text-left font-normal"
                      >
                        <span>
                          {selectedCategories.length === 0
                            ? "Sélectionner des catégories"
                            : selectedCategories.length === categories.length
                            ? "Toutes les catégories sélectionnées"
                            : `${selectedCategories.length} catégorie${selectedCategories.length > 1 ? 's' : ''} sélectionnée${selectedCategories.length > 1 ? 's' : ''}`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 pointer-events-auto" align="start">
                      <div className="p-3 border-b border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="w-full text-xs"
                        >
                          {selectedCategories.length === categories.length ? "Tout désélectionner" : "Tout sélectionner"}
                        </Button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        <div className="p-3 space-y-2">
                          {categories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary transition-colors"
                            >
                              <Checkbox
                                id={`category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => handleCategoryToggle(category)}
                              />
                              <Label
                                htmlFor={`category-${category}`}
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
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Sparkles className={`w-5 h-5 ${useAI ? "text-[hsl(195,100%,50%)]" : "text-muted-foreground"}`} />
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
                    className="data-[state=checked]:bg-[hsl(195,100%,50%)]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[hsl(235,45%,15%)] hover:bg-[hsl(235,45%,20%)] hover:shadow-[0_0_20px_rgba(20,25,70,0.5)] transition-all text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Rechercher
                    </>
                  )}
                </Button>

                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {progress < 30 ? "Connexion aux sites..." : progress < 60 ? "Scraping en cours..." : progress < 90 ? "Traitement des données..." : "Finalisation..."}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {result && (
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-accent/10 to-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <h2 className="text-xl font-semibold text-foreground">Résultat</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={exportToPDF}
                        className="gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="gap-2"
                      >
                        <Table className="w-4 h-4" />
                        CSV
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={exportToDOCX}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        DOCX
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-auto">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed font-mono text-sm">
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
