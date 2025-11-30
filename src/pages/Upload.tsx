import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface SiteEntry {
  id?: string;
  category: string;
  siteName: string;
  url: string;
}

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from("scraped_sites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedSites = data.map((site: any) => ({
        id: site.id,
        category: site.category,
        siteName: site.site_name,
        url: site.url,
      }));

      setSites(formattedSites);
    } catch (error) {
      console.error("Error loading sites:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({
        title: "Format invalide",
        description: "Veuillez uploader un fichier Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
      
      const parsedSites: SiteEntry[] = jsonData.map(row => ({
        category: row.category || row.Category || row.CATEGORY || "",
        siteName: row.siteName || row["Site Name"] || row.site_name || row.SITENAME || "",
        url: row.url || row.URL || row.Url || "",
      })).filter(site => site.category && site.siteName && site.url);

      if (parsedSites.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Le fichier doit contenir les colonnes 'category', 'siteName' et 'url'",
          variant: "destructive",
        });
        return;
      }

      // Save to database
      const sitesToInsert = parsedSites.map(site => ({
        category: site.category,
        site_name: site.siteName,
        url: site.url,
      }));

      const { error } = await supabase
        .from("scraped_sites")
        .insert(sitesToInsert);

      if (error) throw error;

      await loadSites();
      
      toast({
        title: "Succès",
        description: `${parsedSites.length} sites importés et enregistrés`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le fichier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer tous les sites ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("scraped_sites")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      setSites([]);
      toast({
        title: "Succès",
        description: "Tous les sites ont été supprimés",
      });
    } catch (error) {
      console.error("Error clearing sites:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les sites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Importer vos sites
            </h1>
            <p className="text-muted-foreground text-lg">
              Uploadez un fichier Excel avec les colonnes "category", "siteName" et "url"
            </p>
          </div>

          <Card
            className={`relative overflow-hidden transition-all border-2 ${
              isDragging
                ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,200,255,0.3)]"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-glow-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,200,255,0.4)]">
                    {isLoading ? (
                      <Loader2 className="w-10 h-10 text-background animate-spin" />
                    ) : (
                      <UploadIcon className="w-10 h-10 text-background" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Glissez-déposez votre fichier Excel
                  </h3>
                  <p className="text-muted-foreground">ou cliquez pour sélectionner</p>
                </div>

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Sélectionner un fichier
                </Button>
              </div>
            </div>
          </Card>

          {sites.length > 0 && (
            <Card className="border-border overflow-hidden">
              <div className="p-6 border-b border-border bg-card flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Sites enregistrés ({sites.length})
                </h2>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Nom du site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sites.map((site, index) => (
                      <tr key={site.id || index} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">{site.category}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{site.siteName}</td>
                        <td className="px-6 py-4 text-sm text-primary font-mono text-xs">{site.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
