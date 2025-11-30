import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Prompt() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim() || !prompt.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir l'URL et le prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-and-reform", {
        body: { url, prompt },
      });

      if (error) throw error;

      setResult(data.result);
      toast({
        title: "Succès",
        description: "Contenu scrappé et reformulé avec succès",
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
                Reformuler avec IA
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Scrappez un site et reformulez son contenu avec l'IA
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    URL du site
                  </label>
                  <Input
                    type="url"
                    placeholder="https://exemple.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-secondary border-border focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Prompt de reformulation
                  </label>
                  <Textarea
                    placeholder="Comment souhaitez-vous reformuler le contenu ? Ex: Résume ce texte en 3 points clés..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border focus:border-accent transition-colors resize-none"
                    disabled={isLoading}
                  />
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
                      Scrapper et reformuler
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
