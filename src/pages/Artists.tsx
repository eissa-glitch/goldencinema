import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtistCard from "@/components/ArtistCard";
import { useArtists, useRoles } from "@/hooks/useArtists";
import { Users } from "lucide-react";

const Artists = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: artists = [], isLoading } = useArtists();
  const { data: roles = [] } = useRoles();

  const filteredArtists = artists.filter((artist) => {
    if (selectedRole && !artist.role?.includes(selectedRole)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gradient-gold mb-4">
              نجوم السينما العربية
            </h1>
            <p className="text-muted-foreground text-lg">
              تعرف على أبرز الفنانين الذين صنعوا تاريخ السينما العربية
            </p>
          </div>

          {/* Role Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedRole("")}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedRole === ""
                  ? "bg-gold text-background"
                  : "bg-secondary text-foreground hover:bg-gold/20"
              }`}
            >
              الكل
            </button>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedRole === role
                    ? "bg-gold text-background"
                    : "bg-secondary text-foreground hover:bg-gold/20"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="cinema-card p-6 mb-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-gold" />
              <span className="text-foreground">
                <strong className="text-gold">{filteredArtists.length}</strong> فنان
              </span>
            </div>
          </div>

          {/* Artists Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="cinema-card animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4">
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filteredArtists.map((artist, idx) => (
                <ArtistCard key={artist.id} artist={artist} index={idx} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredArtists.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                لم يتم العثور على فنانين
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Artists;
