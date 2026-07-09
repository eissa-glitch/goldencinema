import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFestivals } from "@/hooks/useFestivals";
import { Award, Calendar } from "lucide-react";

const Festivals = () => {
  const { data: festivals = [], isLoading } = useFestivals();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gradient-gold mb-4">
              مهرجانات المركز الكاثوليكي
            </h1>
            <p className="text-muted-foreground text-lg">
              صور وأخبار وفيديوهات من دورات مهرجان المركز الكاثوليكي المصري للسينما
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="cinema-card animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4"><div className="h-5 bg-muted rounded w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : festivals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festivals.map((f) => (
                <Link key={f.id} to={`/festival/${f.id}`} className="cinema-card overflow-hidden group">
                  <div className="aspect-video overflow-hidden bg-secondary relative">
                    {f.cover_url || f.poster_url ? (
                      <img
                        src={f.cover_url || f.poster_url!}
                        alt={f.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award className="w-16 h-16 text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-gold">
                      {f.year && (
                        <span className="flex items-center gap-1 text-sm bg-background/70 px-2 py-1 rounded">
                          <Calendar className="w-3.5 h-3.5" />
                          {f.year}
                        </span>
                      )}
                      {f.edition && (
                        <span className="text-sm bg-background/70 px-2 py-1 rounded">{f.edition}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gold group-hover:text-gold-light transition-colors line-clamp-2">
                      {f.name}
                    </h3>
                    {f.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{f.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-gold/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">لم يتم إضافة مهرجانات بعد</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Festivals;
