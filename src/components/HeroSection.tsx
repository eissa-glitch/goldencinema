import { Link } from "react-router-dom";
import { Play, Calendar, Star, Sparkles } from "lucide-react";
import { useMovies } from "@/hooks/useMovies";

const HeroSection = () => {
  const { data: movies, isLoading } = useMovies();
  const featuredMovie = movies?.[0];

  if (isLoading || !featuredMovie) {
    return (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cinema" />
        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="animate-pulse">
            <div className="h-16 bg-gold/20 rounded w-3/4 mb-6" />
            <div className="h-8 bg-muted rounded w-1/2 mb-8" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={featuredMovie.poster || "/placeholder.svg"}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Film Strip Decoration */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-background flex items-center justify-around opacity-50">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gold/30 rounded-sm" />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-gold/20 text-gold px-4 py-1 rounded-full text-sm font-medium">
                فيلم مميز
              </span>
              {featuredMovie.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="text-gold font-bold">{featuredMovie.rating}</span>
                </div>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-amiri font-bold text-gradient-gold mb-6 leading-tight">
              الأرشيف السينمائي العربي
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              اكتشف روائع السينما العربية من الحقبة الذهبية إلى اليوم. 
              أكبر مجموعة من الأفلام العربية الكلاسيكية والحديثة في مكان واحد.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/movies" className="cinema-button">
                <Play className="w-5 h-5" />
                استكشف الأفلام
              </Link>
              <Link to="/artists" className="cinema-button-outline">
                <Calendar className="w-5 h-5" />
                تصفح الفنانين
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: "١٠٠٠+", label: "فيلم" },
                { value: "٥٠٠+", label: "فنان" },
                { value: "٧٠+", label: "عام" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-amiri font-bold text-gold">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Movie Card with Animations */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              {/* Animated Glow Ring */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 blur-xl animate-pulse-glow opacity-60" />
              
              {/* Rotating Border */}
              <div className="absolute -inset-1 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold animate-rotate-slow origin-center" style={{ backgroundSize: "200% 200%" }} />
              </div>
              
              {/* Main Card */}
              <div className="cinema-card overflow-hidden animate-float relative bg-card">
                <img
                  src={featuredMovie.poster || "/placeholder.svg"}
                  alt={featuredMovie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
                
                {/* Sparkle Effects */}
                <div className="absolute top-4 right-4">
                  <Sparkles className="w-6 h-6 text-gold animate-sparkle" style={{ animationDelay: "0s" }} />
                </div>
                <div className="absolute top-8 left-6">
                  <Sparkles className="w-4 h-4 text-gold-light animate-sparkle" style={{ animationDelay: "0.5s" }} />
                </div>
                <div className="absolute bottom-20 right-8">
                  <Sparkles className="w-5 h-5 text-gold animate-sparkle" style={{ animationDelay: "1s" }} />
                </div>
                
                {/* Movie Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
                  <h3 className="text-2xl font-amiri font-bold text-foreground mb-2">
                    {featuredMovie.title}
                  </h3>
                  <p className="text-muted-foreground">{featuredMovie.year} • {featuredMovie.director}</p>
                </div>
              </div>

              {/* Decorative Elements with Animation */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-2 border-gold/40 rounded-xl -z-10 animate-border-glow" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-gold/40 rounded-xl -z-10 animate-border-glow" style={{ animationDelay: "1s" }} />
              
              {/* Floating Sparkles Around */}
              <div className="absolute -top-2 left-1/2 w-2 h-2 bg-gold rounded-full animate-sparkle" style={{ animationDelay: "0.2s" }} />
              <div className="absolute top-1/3 -left-3 w-3 h-3 bg-gold-light rounded-full animate-sparkle" style={{ animationDelay: "0.7s" }} />
              <div className="absolute bottom-1/4 -right-2 w-2 h-2 bg-gold rounded-full animate-sparkle" style={{ animationDelay: "1.2s" }} />
              <div className="absolute -bottom-3 right-1/3 w-2.5 h-2.5 bg-gold-dark rounded-full animate-sparkle" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Film Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-background flex items-center justify-around opacity-50">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gold/30 rounded-sm" />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
