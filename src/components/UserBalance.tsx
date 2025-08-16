import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export const UserBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const profileRef = doc(db, "profiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setBalance(profileSnap.data()?.balance || 0);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription for balance changes
    const profileRef = doc(db, "profiles", user.uid);
    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        setBalance(doc.data()?.balance || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  };

  if (!user) return null;

  return (
    <Card className="glass-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">Saldo:</span>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Badge variant="secondary" className="bookverse-secondary-gradient border-0">
              {formatPrice(balance || 0)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};