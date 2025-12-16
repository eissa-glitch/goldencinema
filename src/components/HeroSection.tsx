import { Link } from "react-router-dom";
import { Play, Calendar, Star } from "lucide-react";
import { movies } from "@/data/mockData";

const HeroSection = () => {
  const featuredMovie = movies[0];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={featuredMovie.poster}
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
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <span className="text-gold font-bold">{featuredMovie.rating}</span>
              </div>
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

          {/* Featured Movie Card */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <div className="cinema-card overflow-hidden glow-gold">
                <img
                  src={featuredMovie.poster}
                  alt={featuredMovie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
                  <h3 className="text-2xl font-amiri font-bold text-foreground mb-2">
                    {featuredMovie.title}
                  </h3>
                  <p className="text-muted-foreground">{featuredMovie.year} • {featuredMovie.director}</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-gold/30 rounded-lg -z-10" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-gold/30 rounded-lg -z-10" />
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
