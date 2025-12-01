import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Send, Loader2, BookOpen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PDF {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
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

        const filePath = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from("pdf_library")
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
          });

        if (dbError) throw dbError;
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
      // Pour l'instant, on envoie juste les noms des PDFs
      // Dans une version complète, il faudrait parser le contenu des PDFs
      const selectedPdfInfo = pdfs
        .filter(pdf => selectedPdfs.includes(pdf.id))
        .map(pdf => `- Fichier: "${pdf.file_name}" (${(pdf.file_size / 1024).toFixed(0)} Ko)`)
        .join("\n");

      const pdfContent = `Documents disponibles pour analyse:
${selectedPdfInfo}

IMPORTANT: Lorsque tu fournis une information, tu DOIS indiquer le fichier source exact en utilisant le format [Source: nom_du_fichier.pdf].

Note technique: Le contenu textuel complet des PDFs n'a pas encore été extrait. Pour une analyse approfondie du contenu, le parsing PDF doit être implémenté.`;

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

  const togglePdfSelection = (pdfId: string) => {
    setSelectedPdfs(prev =>
      prev.includes(pdfId)
        ? prev.filter(id => id !== pdfId)
        : [...prev, pdfId]
    );
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
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePdf(pdf);
                            }}
                            className="hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Chat Interface */}
            <Card className="md:col-span-2 p-6 border-border flex flex-col">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Assistant Juridique IA
              </h2>

              {selectedPdfs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Sélectionnez un ou plusieurs documents pour commencer
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px]">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
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
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
