import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import ArticlesSection from "@/components/ArticlesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFestival, useFestivalGallery, useFestivalArticles, useFestivalVideos } from "@/hooks/useFestivals";
import { Calendar, Award, ArrowRight, Video } from "lucide-react";

const getYouTubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const FestivalDetail = () => {
  const { id } = useParams();
  const { data: festival, isLoading } = useFestival(id);
  const { data: gallery = [] } = useFestivalGallery(id);
  const { data: articles = [] } = useFestivalArticles(id);
  const { data: videos = [] } = useFestivalVideos(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="pt-36 pb-20 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">المهرجان غير موجود</p>
          <Link to="/festivals" className="cinema-button inline-block mt-4">العودة للمهرجانات</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero */}
      <section className="relative pt-36 pb-12">
        {festival.cover_url && (
          <div className="absolute inset-0 top-0">
            <img src={festival.cover_url} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/festivals" className="inline-flex items-center gap-2 text-gold hover:text-gold-light mb-6">
            <ArrowRight className="w-4 h-4" /> كل المهرجانات
          </Link>
          <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary border border-gold/20 glow-gold">
              {festival.poster_url ? (
                <img src={festival.poster_url} alt={festival.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="w-24 h-24 text-gold/40" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gradient-gold mb-4">{festival.name}</h1>
              <div className="flex flex-wrap gap-3 mb-6">
                {festival.year && (
                  <span className="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1.5 rounded-full text-sm">
                    <Calendar className="w-4 h-4" /> {festival.year}
                  </span>
                )}
                {festival.edition && (
                  <span className="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1.5 rounded-full text-sm">
                    <Award className="w-4 h-4" /> {festival.edition}
                  </span>
                )}
              </div>
              {festival.description && (
                <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">{festival.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <main className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-xl mx-auto mb-8">
            <TabsTrigger value="gallery">الصور ({gallery.length})</TabsTrigger>
            <TabsTrigger value="articles">الأخبار ({articles.length})</TabsTrigger>
            <TabsTrigger value="videos">الفيديوهات ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            {gallery.length > 0 ? (
              <ImageGallery images={gallery.map((g) => g.image_url)} title="ألبوم صور المهرجان" />
            ) : (
              <p className="text-center text-muted-foreground py-16">لا توجد صور بعد</p>
            )}
          </TabsContent>

          <TabsContent value="articles">
            {articles.length > 0 ? (
              <ArticlesSection articles={articles} title="أخبار ومقالات المهرجان" />
            ) : (
              <p className="text-center text-muted-foreground py-16">لا توجد مقالات بعد</p>
            )}
          </TabsContent>

          <TabsContent value="videos">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((v) => {
                  const ytId = getYouTubeId(v.video_url);
                  return (
                    <div key={v.id} className="cinema-card overflow-hidden">
                      <div className="aspect-video bg-black">
                        {ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={v.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        ) : (
                          <video src={v.video_url} controls poster={v.thumbnail_url || undefined} className="w-full h-full" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gold mb-2">{v.title}</h3>
                        {v.description && <p className="text-sm text-muted-foreground">{v.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Video className="w-12 h-12 text-gold/40 mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد فيديوهات بعد</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default FestivalDetail;
