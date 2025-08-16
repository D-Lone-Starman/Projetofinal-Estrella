import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const sampleBooks = [
  {
    title: "Dom Casmurro",
    author: "Machado de Assis",
    description: "Um dos maiores clássicos da literatura brasileira, que narra a história de Bentinho e sua obsessão por Capitu.",
    price: 2500, // Price in cents (R$ 25,00)
    cover_image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    genre: "Clássico",
    stock: 10,
    created_at: new Date()
  },
  {
    title: "O Alquimista",
    author: "Paulo Coelho",
    description: "A jornada de Santiago em busca de seu tesouro pessoal e da realização de seus sonhos.",
    price: 3000,
    cover_image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    genre: "Ficção",
    stock: 15,
    created_at: new Date()
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "Uma distopia sobre controle totalitário e vigilância em uma sociedade futurista.",
    price: 2800,
    cover_image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    genre: "Distopia",
    stock: 8,
    created_at: new Date()
  },
  {
    title: "O Senhor dos Anéis",
    author: "J.R.R. Tolkien",
    description: "A épica jornada de Frodo para destruir o Um Anel e salvar a Terra Média.",
    price: 4500,
    cover_image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    genre: "Fantasia",
    stock: 12,
    created_at: new Date()
  },
  {
    title: "Cem Anos de Solidão",
    author: "Gabriel García Márquez",
    description: "A saga da família Buendía na cidade fictícia de Macondo, uma obra-prima do realismo mágico.",
    price: 3500,
    cover_image_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop",
    genre: "Realismo Mágico",
    stock: 6,
    created_at: new Date()
  },
  {
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    description: "Uma fábula poética sobre amizade, amor e crítica à sociedade adulta.",
    price: 2200,
    cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    genre: "Fábula",
    stock: 20,
    created_at: new Date()
  },
  {
    title: "Crime e Castigo",
    author: "Fiódor Dostoiévski",
    description: "A história psicológica de Raskólnikov e suas consequências após cometer um assassinato.",
    price: 3200,
    cover_image_url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=600&fit=crop",
    genre: "Clássico",
    stock: 9,
    created_at: new Date()
  },
  {
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    description: "O início da jornada mágica de Harry Potter no mundo dos bruxos.",
    price: 2900,
    cover_image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    genre: "Fantasia",
    stock: 25,
    created_at: new Date()
  }
];

export const populateBooks = async () => {
  try {
    console.log("Começando a popular o banco com livros...");
    
    for (const book of sampleBooks) {
      await addDoc(collection(db, "books"), book);
      console.log(`Livro "${book.title}" adicionado com sucesso!`);
    }
    
    console.log("Todos os livros foram adicionados com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao adicionar livros:", error);
    return false;
  }
};