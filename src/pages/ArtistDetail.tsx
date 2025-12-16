import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import ImageGallery from "@/components/ImageGallery";
import ArtistCard from "@/components/ArtistCard";
import { useArtist, useArtists, useArtistMovies } from "@/hooks/useArtists";
import { Movie } from "@/hooks/useMovies";
import { ArrowRight, Calendar, Film } from "lucide-react";

const ArtistDetail = () => {
  const { id } = useParams();
  const { data: artist, isLoading } = useArtist(id);
  const { data: allArtists = [] } = useArtists();
  const { data: artistMoviesData = [] } = useArtistMovies(id);

  const artistMovies = artistMoviesData as Movie[];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="aspect-[3/4] bg-muted rounded-xl" />
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-amiri font-bold text-foreground mb-4">
            الفنان غير موجود
          </h1>
          <Link to="/artists" className="cinema-button">
            العودة للفنانين
          </Link>
        </div>
      </div>
    );
  }

  const lifespan = artist.death_year
    ? `${artist.birth_year} - ${artist.death_year}`
    : `${artist.birth_year || ""} - الآن`;

  const galleryImages = artist.gallery?.map(g => g.image_url) || [];
  const primaryRole = artist.role?.[0] || "فنان";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-end">
          <div className="absolute inset-0">
            <img
              src={artist.image || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover opacity-30"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-l from-background via-background/50 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 pb-12 pt-32">
            <Link
              to="/artists"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-6"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للفنانين
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
              {/* Photo */}
              <div className="cinema-card overflow-hidden glow-gold">
                <img
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
                  className="w-full aspect-[3/4] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Info */}
              <div className="lg:col-span-2">
                <div className="bg-gold/90 text-background px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                  {primaryRole}
                </div>

                <h1 className="text-4xl md:text-6xl font-amiri font-bold text-gradient-gold mb-4">
                  {artist.name}
                </h1>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-gold" />
                    <span>{lifespan}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Film className="w-5 h-5 text-gold" />
                    <span>{artistMovies.length} أفلام</span>
                  </div>
                </div>

                {artist.biography && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {artist.biography}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <ImageGallery images={galleryImages} title={artist.name} />
        )}

        {/* Filmography */}
        {artistMovies.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="section-title">الأعمال السينمائية</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {artistMovies.map((movie, idx) => (
                  <MovieCard key={movie.id} movie={movie} index={idx} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other Artists */}
        <section className="py-16 bg-gradient-cinema">
          <div className="container mx-auto px-4">
            <h2 className="section-title">فنانون آخرون</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {allArtists
                .filter((a) => a.id !== artist.id)
                .slice(0, 6)
                .map((a, idx) => (
                  <ArtistCard key={a.id} artist={a} index={idx} />
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistDetail;
