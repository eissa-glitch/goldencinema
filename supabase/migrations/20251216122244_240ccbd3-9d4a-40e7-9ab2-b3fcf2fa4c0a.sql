-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  poster TEXT,
  synopsis TEXT,
  genre TEXT[] DEFAULT '{}',
  duration INTEGER,
  rating DECIMAL(3,1),
  director TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  biography TEXT,
  role TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movie_artists junction table
CREATE TABLE public.movie_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  UNIQUE(movie_id, artist_id, role)
);

-- Create movie_gallery table
CREATE TABLE public.movie_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artist_gallery table
CREATE TABLE public.artist_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_gallery ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Anyone can view movie_artists" ON public.movie_artists FOR SELECT USING (true);
CREATE POLICY "Anyone can view movie_gallery" ON public.movie_gallery FOR SELECT USING (true);
CREATE POLICY "Anyone can view artist_gallery" ON public.artist_gallery FOR SELECT USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert movies" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movies" ON public.movies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete movies" ON public.movies FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert artists" ON public.artists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update artists" ON public.artists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete artists" ON public.artists FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert movie_artists" ON public.movie_artists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movie_artists" ON public.movie_artists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete movie_artists" ON public.movie_artists FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert movie_gallery" ON public.movie_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movie_gallery" ON public.movie_gallery FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete movie_gallery" ON public.movie_gallery FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert artist_gallery" ON public.artist_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update artist_gallery" ON public.artist_gallery FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete artist_gallery" ON public.artist_gallery FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();