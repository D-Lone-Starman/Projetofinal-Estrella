import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { populateBooks } from "@/utils/populateBooks";
import { useState } from "react";

export const PopulateBooksButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePopulateBooks = async () => {
    setIsLoading(true);
    try {
      const success = await populateBooks();
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Livros adicionados ao banco de dados.",
        });
        // Refresh the page to show the new books
        window.location.reload();
      } else {
        toast({
          title: "Erro",
          description: "Falha ao adicionar livros.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar livros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePopulateBooks}
      disabled={isLoading}
      className="bookverse-gradient hover:opacity-90"
    >
      {isLoading ? "Adicionando..." : "Adicionar Livros de Exemplo"}
    </Button>
  );
};