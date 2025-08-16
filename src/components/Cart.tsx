import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebaseConfig";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar sua compra.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione alguns livros ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check user balance
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        toast({
          title: "Erro",
          description: "Perfil de usuário não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const profileData = profileSnap.data();
      const userBalance = profileData?.balance || 0;
      const totalPrice = getTotalPrice();

      if (userBalance < totalPrice) {
        toast({
          title: "Saldo insuficiente",
          description: `Você precisa de ${formatPrice(totalPrice - userBalance)} a mais para completar esta compra.`,
          variant: "destructive",
        });
        return;
      }

      // Create order
      const orderRef = await addDoc(collection(db, "orders"), {
        user_id: user.uid,
        total_amount: totalPrice,
        status: "completed",
        created_at: serverTimestamp(),
      });

      // Create order items
      for (const item of items) {
        await addDoc(collection(db, "order_items"), {
          order_id: orderRef.id,
          book_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        });
      }

      // Update user balance
      await updateDoc(profileRef, {
        balance: userBalance - totalPrice,
      });

      // Add transaction record
      await addDoc(collection(db, "transactions"), {
        user_id: user.uid,
        amount: -totalPrice,
        type: "purchase",
        description: `Compra de ${getTotalItems()} livro(s)`,
        created_at: serverTimestamp(),
      });

      clearCart();
      setIsOpen(false);
      
      toast({
        title: "Compra realizada com sucesso! 🎉",
        description: `Você comprou ${getTotalItems()} livro(s) por ${formatPrice(totalPrice)}.`,
      });

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro na compra",
        description: "Ocorreu um erro ao processar sua compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seu carrinho está vazio</p>
                <p className="text-sm">Adicione alguns livros para começar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-lg border">
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.author}</p>
                      <p className="font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bookverse-gradient hover:opacity-90 gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {loading ? "Processando..." : "Finalizar Compra"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};