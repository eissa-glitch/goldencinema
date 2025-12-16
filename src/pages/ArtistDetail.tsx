import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import ImageGallery from "@/components/ImageGallery";
import { artists, movies } from "@/data/mockData";
import { ArrowRight, Calendar, Film } from "lucide-react";

const ArtistDetail = () => {
  const { id } = useParams();
  const artist = artists.find((a) => a.id === id);

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

  const artistMovies = movies.filter((m) => artist.filmography.includes(m.id));
  const lifespan = artist.deathYear
    ? `${artist.birthYear} - ${artist.deathYear}`
    : `${artist.birthYear} - الآن`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-end">
          <div className="absolute inset-0">
            <img
              src={artist.photo}
              alt=""
              className="w-full h-full object-cover opacity-30"
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
                  src={artist.photo}
                  alt={artist.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>

              {/* Info */}
              <div className="lg:col-span-2">
                <div className="bg-gold/90 text-background px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                  {artist.role}
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

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {artist.biography}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <ImageGallery images={artist.gallery} title={artist.name} />

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
              {artists
                .filter((a) => a.id !== artist.id)
                .slice(0, 6)
                .map((a) => (
                  <Link
                    key={a.id}
                    to={`/artist/${a.id}`}
                    className="cinema-card group text-center block"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-amiri font-bold text-foreground group-hover:text-gold transition-colors">
                        {a.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{a.role}</p>
                    </div>
                  </Link>
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
