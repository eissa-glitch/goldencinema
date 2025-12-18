import { useState } from "react";
import { FileText, ExternalLink, Calendar, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
}

interface ArticlesSectionProps {
  articles: Article[];
  title?: string;
}

const ArticlesSection = ({ articles, title = "مقالات وأخبار" }: ArticlesSectionProps) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const openImageZoom = (imageUrl: string) => {
    setZoomedImage(imageUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeImageZoom = () => {
    setZoomedImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-amiri font-bold text-gradient-gold mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="cinema-card overflow-hidden group cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              {article.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                {article.content && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {article.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {article.source && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {article.source}
                    </span>
                  )}
                  {article.published_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_date).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Article Reader Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0" dir="rtl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-amiri font-bold text-gradient-gold">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)]">
            <div className="p-6 pt-4">
              {selectedArticle?.image_url && (
                <div 
                  className="mb-6 rounded-lg overflow-hidden cursor-zoom-in group relative"
                  onClick={() => openImageZoom(selectedArticle.image_url!)}
                >
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    className="w-full max-h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                {selectedArticle?.source && (
                  <span className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    المصدر: {selectedArticle.source}
                  </span>
                )}
                {selectedArticle?.published_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedArticle.published_date).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>

              {selectedArticle?.content && (
                <div className="prose prose-lg dark:prose-invert max-w-none text-right">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                    {selectedArticle.content}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Lightbox */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          onClick={closeImageZoom}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 rounded-full p-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeImageZoom}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image */}
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
          >
            <img
              src={zoomedImage}
              alt="صورة مكبرة"
              className="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ArticlesSection;
