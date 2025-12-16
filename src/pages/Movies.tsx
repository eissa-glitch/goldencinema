import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { useMovies, useGenres, useYears } from "@/hooks/useMovies";
import { Filter } from "lucide-react";

const Movies = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data: movies = [], isLoading } = useMovies();
  const { data: genres = [] } = useGenres();
  const { data: years = [] } = useYears();

  const filteredMovies = movies.filter((movie) => {
    if (selectedGenre && !movie.genre?.includes(selectedGenre)) return false;
    if (selectedYear && movie.year !== selectedYear) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gradient-gold mb-4">
              مكتبة الأفلام
            </h1>
            <p className="text-muted-foreground text-lg">
              تصفح مجموعتنا الشاملة من الأفلام العربية
            </p>
          </div>

          {/* Filters */}
          <div className="cinema-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-gold" />
              <h3 className="text-lg font-bold text-foreground">تصفية النتائج</h3>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Genre Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-muted-foreground mb-2">
                  التصنيف
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-secondary border border-gold/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="">جميع التصنيفات</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-muted-foreground mb-2">
                  السنة
                </label>
                <select
                  value={selectedYear || ""}
                  onChange={(e) =>
                    setSelectedYear(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full bg-secondary border border-gold/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="">جميع السنوات</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedGenre || selectedYear) && (
                <button
                  onClick={() => {
                    setSelectedGenre("");
                    setSelectedYear(null);
                  }}
                  className="self-end px-4 py-2 text-gold hover:text-gold-light transition-colors"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            عرض {filteredMovies.length} فيلم
          </p>

          {/* Movies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="cinema-card animate-pulse">
                  <div className="aspect-[2/3] bg-muted" />
                  <div className="p-4">
                    <div className="h-5 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map((movie, idx) => (
                <MovieCard key={movie.id} movie={movie} index={idx} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredMovies.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                لم يتم العثور على أفلام تطابق معايير البحث
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Movies;
