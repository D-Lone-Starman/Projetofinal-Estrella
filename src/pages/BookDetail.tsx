import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image_url: string;
  genre: string;
  stock: number;
  created_at: string;
}

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchBook = async () => {
      if (!id) {
        navigate("/");
        return;
      }

    const fetchBook = async () => {
      try {
        const bookRef = doc(db, "books", id);
        const bookSnap = await getDoc(bookRef);
        
        if (bookSnap.exists()) {
          setBook({ id: bookSnap.id, ...bookSnap.data() } as Book);
        } else {
          console.log("No such document!");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };
    };

    fetchBook();
  }, [id, user, navigate]);

  const handleAddToCart = () => {
    if (book) {
      addItem({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image_url: book.cover_image_url,
      });
      toast.success("Livro adicionado ao carrinho!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Carregando detalhes do livro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Book Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Book Cover */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md">
              <img
                src={book.cover_image_url || "/placeholder.svg"}
                alt={`Capa do livro ${book.title}`}
                className="w-full h-auto rounded-lg shadow-lg object-cover aspect-[3/4]"
              />
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {book.genre}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                por {book.author}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description || "Descrição não disponível."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Estoque: {book.stock} unidades</span>
                <span>•</span>
                <span>Adicionado em {new Date(book.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {(book.price / 100).toFixed(2)}
                  </p>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full sm:w-auto flex items-center gap-2"
                  disabled={book.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {book.stock === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetail;