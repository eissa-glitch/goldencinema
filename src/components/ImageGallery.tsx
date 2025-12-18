import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const closeLightbox = () => {
    setSelectedImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const goNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };
  
  const goPrev = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
    if (zoom <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
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
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Images className="w-8 h-8 text-gold" />
          <h2 className="section-title mb-0">معرض الصور</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-gold transition-all duration-300"
            >
              <img
                src={image}
                alt={`${title} - صورة ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-background" />
                </div>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0s" }} />
              <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-gold-light rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0.3s" }} />
              <div className="absolute bottom-3 right-6 w-1 h-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0.6s" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox with Zoom */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoom >= 4}
              className="bg-card border-gold/30 hover:bg-gold hover:text-background"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoom <= 1}
              className="bg-card border-gold/30 hover:bg-gold hover:text-background"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="bg-card border-gold/30 hover:bg-gold hover:text-background"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Image Container */}
          <div 
            className="max-w-5xl max-h-[80vh] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              src={images[selectedImage]}
              alt={`${title} - صورة ${selectedImage + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg animate-scale-in border-2 border-gold/50 shadow-[0_0_60px_hsl(var(--gold)/0.3)] transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: 'center center',
              }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Info Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gold/30 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              تكبير: {Math.round(zoom * 100)}%
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-gold font-bold">{selectedImage + 1}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{images.length}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;
