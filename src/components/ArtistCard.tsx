import { Link } from "react-router-dom";
import { Artist } from "@/hooks/useArtists";
import placeholderArtist from "@/assets/placeholder-artist.jpg";

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

const ArtistCard = ({ artist, index = 0 }: ArtistCardProps) => {
  const lifespan = artist.death_year
    ? `${artist.birth_year} - ${artist.death_year}`
    : `${artist.birth_year || ""} - الآن`;

  const primaryRole = artist.role?.[0] || "فنان";

  return (
    <Link
      to={`/artist/${artist.id}`}
      className="cinema-card group block text-center"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={artist.image || placeholderArtist}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = placeholderArtist;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Role Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gold/90 text-background px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
          {primaryRole}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-amiri font-bold text-foreground group-hover:text-gold transition-colors">
          {artist.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{lifespan}</p>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg" />
    </Link>
  );
};

export default ArtistCard;
