import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, User, LogOut, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BookCard } from "@/components/BookCard";
import { Cart } from "@/components/Cart";
import { UserBalance } from "@/components/UserBalance";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image_url: string;
  genre: string;
}

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(db, "books");
        const snapshot = await getDocs(booksRef);
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];
        setBooks(booksData);
        
        // Extract unique genres
        const uniqueGenres = [...new Set(booksData.map(book => book.genre).filter(Boolean))];
        setGenres(uniqueGenres);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBooks();
    }
  }, [user]);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Carregando BookVerse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="bookverse-title text-2xl font-bold text-primary">
                BookVerse
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserBalance />
              <Cart />
              <Button
                variant="outline"
                size="icon"
                onClick={signOut}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bookverse-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="bookverse-title text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            Descubra seu próximo livro favorito
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Explore nossa coleção cuidadosamente selecionada de livros digitais e 
            físicos com preços incríveis.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg glass-card border-0"
              />
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Filter className="h-4 w-4 text-primary-foreground" />
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48 glass-card border-0">
                  <SelectValue placeholder="Filtrar por gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gêneros</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre} className="text-foreground">
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Catálogo de Livros</h3>
            <p className="text-muted-foreground">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
              <p>Carregando livros...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || selectedGenre !== "all" 
                  ? "Nenhum livro encontrado com os filtros aplicados." 
                  : "Nenhum livro disponível no momento."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="bookverse-title text-xl font-bold">BookVerse</span>
          </div>
          <p className="text-muted-foreground mb-2">
            Sua livraria digital favorita. Descubra, compre e desfrute dos melhores livros.
          </p>
          <p className="text-muted-foreground text-sm">
            © 2025 BookVerse. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
