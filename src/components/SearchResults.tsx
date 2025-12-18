import { Link } from "react-router-dom";
import { Film, User, Loader2 } from "lucide-react";
import placeholderMovie from "@/assets/placeholder-movie.jpg";
import placeholderArtist from "@/assets/placeholder-artist.jpg";

interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "artist";
  image: string | null;
  subtitle?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onResultClick: () => void;
  query: string;
}

const SearchResults = ({ results, isLoading, onResultClick, query }: SearchResultsProps) => {
  if (!query || query.length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-gold/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="divide-y divide-gold/10">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              to={`/${result.type === "movie" ? "movie" : "artist"}/${result.id}`}
              onClick={onResultClick}
              className="flex items-center gap-4 p-4 hover:bg-gold/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                <img
                  src={result.image || (result.type === "movie" ? placeholderMovie : placeholderArtist)}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = result.type === "movie" ? placeholderMovie : placeholderArtist;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {result.type === "movie" ? (
                    <Film className="w-4 h-4 text-gold shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-gold shrink-0" />
                  )}
                  <span className="font-medium truncate">{result.title}</span>
                </div>
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                {result.type === "movie" ? "فيلم" : "فنان"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          لا توجد نتائج لـ "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchResults;
