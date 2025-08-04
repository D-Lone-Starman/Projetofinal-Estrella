import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image_url: string;
  genre: string;
}

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  };

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_image_url: book.cover_image_url,
    });
  };

  return (
    <Card className="bookverse-card h-full flex flex-col">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={book.cover_image_url}
            alt={`Capa do livro ${book.title}`}
            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bookverse-secondary-gradient border-0 text-black"
          >
            {book.genre}
          </Badge>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
          <p className="text-muted-foreground text-sm mb-2">por {book.author}</p>
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-3">
            {book.description}
          </p>
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4 ? "fill-secondary text-secondary" : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">(4.0)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(book.price)}
          </span>
          <span className="text-sm text-muted-foreground">à vista</span>
        </div>
        <Button 
          onClick={handleAddToCart}
          className="bookverse-gradient hover:opacity-90 gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};