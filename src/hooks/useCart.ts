import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
  quantity: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bookverse-cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("bookverse-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (book: Omit<CartItem, "quantity">) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === book.id);
      
      if (existingItem) {
        // Use setTimeout to defer the toast call after state update
        setTimeout(() => {
          toast({
            title: "Item atualizado",
            description: `Quantidade de "${book.title}" atualizada no carrinho.`,
          });
        }, 0);
        return prevItems.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Use setTimeout to defer the toast call after state update
        setTimeout(() => {
          toast({
            title: "Item adicionado",
            description: `"${book.title}" foi adicionado ao carrinho.`,
          });
        }, 0);
        return [...prevItems, { ...book, quantity: 1 }];
      }
    });
  };

  const removeItem = (bookId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === bookId);
      if (item) {
        // Use setTimeout to defer the toast call after state update
        setTimeout(() => {
          toast({
            title: "Item removido",
            description: `"${item.title}" foi removido do carrinho.`,
          });
        }, 0);
      }
      return prevItems.filter(item => item.id !== bookId);
    });
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Use setTimeout to defer the toast call after state update
    setTimeout(() => {
      toast({
        title: "Carrinho limpo",
        description: "Todos os itens foram removidos do carrinho.",
      });
    }, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};