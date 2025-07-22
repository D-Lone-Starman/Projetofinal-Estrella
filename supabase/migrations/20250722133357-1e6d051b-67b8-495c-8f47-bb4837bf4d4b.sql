-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  balance INTEGER DEFAULT 0, -- Balance in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  cover_image_url TEXT,
  stock INTEGER DEFAULT 100,
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL, -- Total in cents
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL -- Price per unit in cents
);

-- Create transactions table for balance history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents (positive for credit, negative for debit)
  type TEXT NOT NULL, -- 'deposit', 'purchase', 'refund'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Books policies (public read access)
CREATE POLICY "Books are viewable by everyone" ON public.books
  FOR SELECT USING (true);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, balance)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    50000 -- Initial balance of R$ 500,00 for testing
  );
  
  -- Add initial deposit transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (NEW.id, 50000, 'deposit', 'Saldo inicial de boas-vindas');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample books
INSERT INTO public.books (title, author, description, price, genre, cover_image_url) VALUES
('O Guardião dos Segredos', 'Marina Silva', 'Um thriller eletrizante sobre mistérios ancestrais e segredos guardados por gerações.', 2990, 'Thriller', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
('Café e Sonhos', 'Roberto Santos', 'Uma história tocante sobre amor, perda e segundas chances em uma pequena cidade do interior.', 1990, 'Romance', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('A Revolução Digital', 'Ana Pereira', 'Um guia essencial sobre como a tecnologia está transformando nosso mundo e nosso futuro.', 3490, 'Tecnologia', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400'),
('Aventuras na Amazônia', 'Carlos Mendoza', 'Uma jornada épica pela floresta amazônica repleta de descobertas e perigos.', 2790, 'Aventura', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Mistérios do Cosmos', 'Dr. Elena Rodriguez', 'Descubra os segredos do universo através dos olhos de uma astrofísica renomada.', 4590, 'Ciência', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400'),
('O Último Samurai', 'Takeshi Yamamoto', 'Uma saga histórica sobre honra, tradição e a luta pela preservação da cultura japonesa.', 3290, 'História', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Receitas da Vovó', 'Maria das Graças', 'Um livro de culinária repleto de receitas tradicionais e histórias de família.', 2490, 'Culinária', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400');