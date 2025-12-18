import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "artist";
  image: string | null;
  subtitle?: string;
}

export const useSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchData = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        // Search movies
        const { data: movies } = await supabase
          .from("movies")
          .select("id, title, poster, year, director")
          .or(`title.ilike.%${query}%,director.ilike.%${query}%`)
          .limit(5);

        // Search artists
        const { data: artists } = await supabase
          .from("artists")
          .select("id, name, image, role")
          .ilike("name", `%${query}%`)
          .limit(5);

        const movieResults: SearchResult[] = (movies || []).map((m) => ({
          id: m.id,
          title: m.title,
          type: "movie" as const,
          image: m.poster,
          subtitle: `${m.year}${m.director ? ` - ${m.director}` : ""}`,
        }));

        const artistResults: SearchResult[] = (artists || []).map((a) => ({
          id: a.id,
          title: a.name,
          type: "artist" as const,
          image: a.image,
          subtitle: a.role?.join("، "),
        }));

        setResults([...movieResults, ...artistResults]);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { results, isLoading };
};
