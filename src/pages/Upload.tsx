import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface SiteEntry {
  category: string;
  siteName: string;
}

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const { toast } = useToast();

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
      })).filter(site => site.category && site.siteName);

      if (parsedSites.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Le fichier ne contient pas de colonnes 'category' et 'siteName'",
          variant: "destructive",
        });
      } else {
        setSites(parsedSites);
        // Save to localStorage for use in Prompt page
        localStorage.setItem("scraped-sites", JSON.stringify(parsedSites));
        toast({
          title: "Succès",
          description: `${parsedSites.length} sites importés avec succès`,
        });
      }
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
              Uploadez un fichier Excel avec les colonnes "category" et "siteName"
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
              <div className="p-6 border-b border-border bg-card">
                <h2 className="text-xl font-semibold text-foreground">
                  Sites importés ({sites.length})
                </h2>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sites.map((site, index) => (
                      <tr key={index} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">{site.category}</td>
                        <td className="px-6 py-4 text-sm text-primary">{site.siteName}</td>
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
