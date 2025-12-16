import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import { movies, artists } from "@/data/mockData";
import { Star, Clock, Calendar, User, Play, ArrowRight } from "lucide-react";

const MovieDetail = () => {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-amiri font-bold text-foreground mb-4">
            الفيلم غير موجود
          </h1>
          <Link to="/movies" className="cinema-button">
            العودة للأفلام
          </Link>
        </div>
      </div>
    );
  }

  const relatedMovies = movies
    .filter((m) => m.id !== movie.id && m.genre.some((g) => movie.genre.includes(g)))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-end">
          <div className="absolute inset-0">
            <img
              src={movie.poster}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-l from-background via-background/50 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 pb-12 pt-32">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-6"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للأفلام
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="cinema-card overflow-hidden glow-gold">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </div>

              {/* Info */}
              <div className="lg:col-span-2">
                <h1 className="text-4xl md:text-6xl font-amiri font-bold text-gradient-gold mb-4">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-gold/20 px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 text-gold fill-gold" />
                    <span className="text-gold font-bold">{movie.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-5 h-5" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{movie.duration} دقيقة</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="bg-secondary text-foreground px-4 py-1 rounded-full text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {movie.synopsis}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gold" />
                    <span className="text-muted-foreground">المخرج:</span>
                    <span className="text-foreground font-medium">{movie.director}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gold mt-1" />
                    <span className="text-muted-foreground">البطولة:</span>
                    <span className="text-foreground">{movie.cast.join("، ")}</span>
                  </div>
                </div>

                <button className="cinema-button">
                  <Play className="w-5 h-5" />
                  مشاهدة العرض
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <ImageGallery images={movie.gallery} title={movie.title} />

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="section-title">أفلام مشابهة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedMovies.map((m, idx) => (
                  <Link
                    key={m.id}
                    to={`/movie/${m.id}`}
                    className="cinema-card group block"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-amiri font-bold text-foreground group-hover:text-gold transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{m.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetail;
