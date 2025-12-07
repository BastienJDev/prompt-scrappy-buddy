import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Send, Loader2, BookOpen, Search, MessageSquare, FileSpreadsheet, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PDF {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  content: string | null;
  parsed_at: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BibliotequePDF() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);
  const [searchPrompt, setSearchPrompt] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPdfs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadPdfs = async () => {
    try {
      const { data, error } = await supabase
        .from("pdf_library")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPdfs(data || []);
      // Sélectionner automatiquement tous les PDFs
      setSelectedPdfs((data || []).map(pdf => pdf.id));
    } catch (error) {
      console.error("Erreur lors du chargement des PDFs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les PDFs",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.type !== "application/pdf") {
          toast({
            title: "Erreur",
            description: `${file.name} n'est pas un fichier PDF`,
            variant: "destructive",
          });
          continue;
        }

        // Nettoyer le nom de fichier pour éviter les caractères non-ASCII dans les headers
        const sanitizedFileName = file.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
          .replace(/[^a-zA-Z0-9.-]/g, "_"); // Remplacer les caractères spéciaux
        const filePath = `${Date.now()}-${sanitizedFileName}`;

        // Upload to storage avec options explicites pour éviter les problèmes d'encodage
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, file, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Insert metadata
        const { data: insertedPdf, error: dbError } = await supabase
          .from("pdf_library")
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Parse PDF content in background
        toast({
          title: "Analyse en cours",
          description: `Extraction du texte de ${file.name}...`,
        });

        supabase.functions
          .invoke("parse-pdf", {
            body: { pdfId: insertedPdf.id, filePath },
          })
          .then(({ data, error }) => {
            if (error) {
              console.error("Parse error:", error);
              toast({
                title: "Avertissement",
                description: `Le contenu de ${file.name} n'a pas pu être extrait complètement`,
                variant: "destructive",
              });
            } else {
              console.log("PDF parsed:", data);
              toast({
                title: "Extraction terminée",
                description: `${file.name} : ${data.pages} pages analysées`,
              });
              loadPdfs(); // Refresh to show parsed status
            }
          });
      }

      await loadPdfs();
      toast({
        title: "Succès",
        description: `${files.length} PDF(s) importé(s)`,
      });
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'importation des PDFs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePdf = async (pdf: PDF) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("pdfs")
        .remove([pdf.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("pdf_library")
        .delete()
        .eq("id", pdf.id);

      if (dbError) throw dbError;

      await loadPdfs();
      setSelectedPdfs(prev => prev.filter(id => id !== pdf.id));
      
      toast({
        title: "Succès",
        description: "PDF supprimé",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le PDF",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedPdfs.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un PDF et saisir un message",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsAiLoading(true);

    try {
      // Récupérer le contenu textuel des PDFs sélectionnés
      const { data: selectedPdfsData, error: fetchError } = await supabase
        .from("pdf_library")
        .select("*")
        .in("id", selectedPdfs);

      if (fetchError) throw fetchError;

      // Construire le contenu avec le texte extrait
      const pdfContent = selectedPdfsData
        .map((pdf: any) => {
          if (pdf.content) {
            return `
=== Document: ${pdf.file_name} ===
${pdf.content}
============================================
`;
          } else {
            return `
=== Document: ${pdf.file_name} ===
[ATTENTION: Le contenu de ce document n'a pas encore été extrait. Le parsing est en cours.]
============================================
`;
          }
        })
        .join("\n\n");

      const { data, error } = await supabase.functions.invoke("pdf-chat", {
        body: {
          messages: [...messages, userMessage],
          pdfContent,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir une réponse de l'IA",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchPrompt.trim() || selectedPdfs.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un PDF et saisir une recherche",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      // Récupérer le contenu textuel des PDFs sélectionnés
      const { data: selectedPdfsData, error: fetchError } = await supabase
        .from("pdf_library")
        .select("*")
        .in("id", selectedPdfs);

      if (fetchError) throw fetchError;

      // Construire le contenu avec le texte extrait
      const pdfContent = selectedPdfsData
        .map((pdf: any) => {
          if (pdf.content) {
            return `
=== Document: ${pdf.file_name} ===
${pdf.content}
============================================
`;
          } else {
            return `
=== Document: ${pdf.file_name} ===
[ATTENTION: Le contenu de ce document n'a pas encore été extrait.]
============================================
`;
          }
        })
        .join("\n\n");

      const { data, error } = await supabase.functions.invoke("pdf-chat", {
        body: {
          messages: [{ role: "user", content: searchPrompt }],
          pdfContent,
          isSearch: true,
        },
      });

      if (error) throw error;

      setSearchResults(data.response);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const togglePdfSelection = (pdfId: string) => {
    setSelectedPdfs(prev =>
      prev.includes(pdfId)
        ? prev.filter(id => id !== pdfId)
        : [...prev, pdfId]
    );
  };

  const [parsingPdfId, setParsingPdfId] = useState<string | null>(null);

  const handleReParsePdf = async (pdf: PDF) => {
    setParsingPdfId(pdf.id);
    
    toast({
      title: "Analyse en cours",
      description: `Extraction du texte de ${pdf.file_name}...`,
    });

    try {
      const { data, error } = await supabase.functions.invoke("parse-pdf", {
        body: { pdfId: pdf.id, filePath: pdf.file_path },
      });

      if (error) {
        console.error("Parse error:", error);
        toast({
          title: "Erreur",
          description: `Échec de l'extraction: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("PDF parsed:", data);
        toast({
          title: "Extraction terminée",
          description: `${pdf.file_name} analysé avec succès`,
        });
        await loadPdfs();
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser le PDF",
        variant: "destructive",
      });
    } finally {
      setParsingPdfId(null);
    }
  };

  const handleExportXLS = () => {
    if (!searchResults) {
      toast({
        title: "Attention",
        description: "Aucun résultat à exporter",
        variant: "destructive",
      });
      return;
    }

    const selectedPdfNames = pdfs
      .filter(pdf => selectedPdfs.includes(pdf.id))
      .map(pdf => pdf.file_name)
      .join(", ");

    const data = [
      { Recherche: searchPrompt, Sources: selectedPdfNames, Résultats: searchResults }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Résultats");
    XLSX.writeFile(wb, `recherche-pdf-${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast({
      title: "Export réussi",
      description: "Le fichier XLS a été téléchargé",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Bibliothèque PDF
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Importez vos documents juridiques et posez des questions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Liste des PDFs */}
            <Card className="md:col-span-1 p-6 border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Mes documents
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {pdfs.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Aucun document importé
                    </p>
                  ) : (
                    pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedPdfs.includes(pdf.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => togglePdfSelection(pdf.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {pdf.file_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(pdf.file_size / 1024).toFixed(0)} Ko
                                {pdf.parsed_at && " • Analysé"}
                                {!pdf.content && pdf.parsed_at === null && " • En attente"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReParsePdf(pdf);
                              }}
                              disabled={parsingPdfId === pdf.id}
                              className="hover:text-primary"
                              title="Re-analyser le PDF"
                            >
                              {parsingPdfId === pdf.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePdf(pdf);
                              }}
                              className="hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Interface avec onglets */}
            <Card className="md:col-span-2 p-6 border-border flex flex-col">
              {selectedPdfs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <p className="text-muted-foreground text-center">
                    Sélectionnez un ou plusieurs documents pour commencer
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="search" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Recherche
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat IA
                    </TabsTrigger>
                  </TabsList>

                  {/* Onglet Recherche */}
                  <TabsContent value="search" className="flex-1 flex flex-col space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Votre recherche
                        </label>
                        <Textarea
                          value={searchPrompt}
                          onChange={(e) => setSearchPrompt(e.target.value)}
                          placeholder="Ex: Quelles sont les clauses de non-concurrence dans ce contrat ?"
                          className="resize-none"
                          rows={3}
                          disabled={isSearching}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchPrompt.trim()}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(0,200,255,0.4)]"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Rechercher dans les PDFs
                          </>
                        )}
                      </Button>
                    </div>

                    {searchResults && (
                      <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-foreground">Résultats</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleExportXLS}
                              className="flex items-center gap-2"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              Export XLS
                            </Button>
                          </div>
                          <div className="text-foreground/90 whitespace-pre-wrap text-sm">
                            {searchResults}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Onglet Chat */}
                  <TabsContent value="chat" className="flex-1 flex flex-col">
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[400px]">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                          <p className="text-muted-foreground text-center">
                            Posez votre première question sur les documents sélectionnés
                          </p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg ${
                              message.role === "user"
                                ? "bg-primary/10 ml-8"
                                : "bg-secondary/50 mr-8"
                            }`}
                          >
                            <p className="text-sm font-medium mb-1 text-foreground">
                              {message.role === "user" ? "Vous" : "Assistant"}
                            </p>
                            <p className="text-foreground/90 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))
                      )}
                      {isAiLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">L'assistant réfléchit...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Posez votre question sur les documents..."
                        className="resize-none"
                        rows={3}
                        disabled={isAiLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isAiLoading || !inputMessage.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
