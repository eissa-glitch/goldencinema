import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  
  const goNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };
  
  const goPrev = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
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
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                  <Images className="w-6 h-6 text-background" />
                </div>
              </div>
              {/* Sparkle effect on hover */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0s" }} />
              <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-gold-light rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0.3s" }} />
              <div className="absolute bottom-3 right-6 w-1 h-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-sparkle" style={{ animationDelay: "0.6s" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-gold/30 flex items-center justify-center text-foreground hover:bg-gold hover:text-background transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div 
            className="max-w-5xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage]}
              alt={`${title} - صورة ${selectedImage + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg animate-scale-in border-2 border-gold/50 shadow-[0_0_60px_hsl(var(--gold)/0.3)]"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gold/30">
              <span className="text-gold font-bold">{selectedImage + 1}</span>
              <span className="text-muted-foreground mx-2">/</span>
              <span className="text-muted-foreground">{images.length}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;
