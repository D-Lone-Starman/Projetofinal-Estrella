import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
        const { data, error } = await supabase
          .from("profiles")
          .select("balance")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setBalance(data?.balance || 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription for balance changes
    const channel = supabase
      .channel("balance_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new.balance === "number") {
            setBalance(payload.new.balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <span className="text-sm font-medium">Saldo:</span>
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