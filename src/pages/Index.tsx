import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MovieCard from "@/components/MovieCard";
import ArtistCard from "@/components/ArtistCard";
import YearTimeline from "@/components/YearTimeline";
import VideoPlayer from "@/components/VideoPlayer";
import { useMovies } from "@/hooks/useMovies";
import { useArtists } from "@/hooks/useArtists";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Index = () => {
  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: artists = [], isLoading: artistsLoading } = useArtists();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />

        {/* Featured Movies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">أفلام مميزة</h2>
              <Link
                to="/movies"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                عرض الكل
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            {moviesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="cinema-card animate-pulse">
                    <div className="aspect-[2/3] bg-muted" />
                    <div className="p-4">
                      <div className="h-5 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {movies.slice(0, 6).map((movie, idx) => (
                  <MovieCard key={movie.id} movie={movie} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد أفلام حالياً</p>
              </div>
            )}
          </div>
        </section>


        {/* Year Timeline */}
        <YearTimeline />

        {/* Featured Artists */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">نجوم السينما</h2>
              <Link
                to="/artists"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                عرض الكل
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            {artistsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="cinema-card animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4">
                      <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : artists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {artists.slice(0, 6).map((artist, idx) => (
                  <ArtistCard key={artist.id} artist={artist} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا يوجد فنانون حالياً</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-amiri font-bold text-gradient-gold mb-6">
              اكتشف تراث السينما العربية
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              انضم إلينا في رحلة عبر الزمن لاكتشاف أجمل ما أنتجته السينما العربية
            </p>
            <Link to="/movies" className="cinema-button">
              ابدأ الاستكشاف
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
