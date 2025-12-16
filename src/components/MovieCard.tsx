import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Movie } from "@/data/mockData";

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

const MovieCard = ({ movie, index = 0 }: MovieCardProps) => {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="cinema-card group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="text-sm font-medium text-gold">{movie.rating}</span>
        </div>

        {/* Year Badge */}
        <div className="absolute top-3 right-3 bg-gold/90 text-background px-3 py-1 rounded-full text-sm font-bold">
          {movie.year}
        </div>

        {/* Hover Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{movie.duration} دقيقة</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-amiri font-bold text-foreground group-hover:text-gold transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{movie.director}</p>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Link>
  );
};

export default MovieCard;
