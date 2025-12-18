CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: artist_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artist_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    source text,
    published_date date,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: artist_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artist_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    image text,
    birth_year integer,
    death_year integer,
    biography text,
    role text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: movie_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movie_articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    source text,
    published_date date,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: movie_artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movie_artists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid NOT NULL,
    artist_id uuid NOT NULL,
    role text NOT NULL
);


--
-- Name: movie_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movie_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: movies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    year integer NOT NULL,
    poster text,
    synopsis text,
    genre text[] DEFAULT '{}'::text[],
    duration integer,
    rating numeric(3,1),
    director text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: artist_articles artist_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_articles
    ADD CONSTRAINT artist_articles_pkey PRIMARY KEY (id);


--
-- Name: artist_gallery artist_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_gallery
    ADD CONSTRAINT artist_gallery_pkey PRIMARY KEY (id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- Name: movie_articles movie_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_articles
    ADD CONSTRAINT movie_articles_pkey PRIMARY KEY (id);


--
-- Name: movie_artists movie_artists_movie_id_artist_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_artists
    ADD CONSTRAINT movie_artists_movie_id_artist_id_role_key UNIQUE (movie_id, artist_id, role);


--
-- Name: movie_artists movie_artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_artists
    ADD CONSTRAINT movie_artists_pkey PRIMARY KEY (id);


--
-- Name: movie_gallery movie_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_gallery
    ADD CONSTRAINT movie_gallery_pkey PRIMARY KEY (id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: artist_articles update_artist_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_artist_articles_updated_at BEFORE UPDATE ON public.artist_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: artists update_artists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: movie_articles update_movie_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_movie_articles_updated_at BEFORE UPDATE ON public.movie_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: movies update_movies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: artist_articles artist_articles_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_articles
    ADD CONSTRAINT artist_articles_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: artist_gallery artist_gallery_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_gallery
    ADD CONSTRAINT artist_gallery_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: movie_articles movie_articles_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_articles
    ADD CONSTRAINT movie_articles_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movie_artists movie_artists_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_artists
    ADD CONSTRAINT movie_artists_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: movie_artists movie_artists_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_artists
    ADD CONSTRAINT movie_artists_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movie_gallery movie_gallery_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_gallery
    ADD CONSTRAINT movie_gallery_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: artist_articles Anyone can view artist_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view artist_articles" ON public.artist_articles FOR SELECT USING (true);


--
-- Name: artist_gallery Anyone can view artist_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view artist_gallery" ON public.artist_gallery FOR SELECT USING (true);


--
-- Name: artists Anyone can view artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);


--
-- Name: movie_articles Anyone can view movie_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view movie_articles" ON public.movie_articles FOR SELECT USING (true);


--
-- Name: movie_artists Anyone can view movie_artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view movie_artists" ON public.movie_artists FOR SELECT USING (true);


--
-- Name: movie_gallery Anyone can view movie_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view movie_gallery" ON public.movie_gallery FOR SELECT USING (true);


--
-- Name: movies Anyone can view movies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);


--
-- Name: artist_articles Authenticated can delete artist_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can delete artist_articles" ON public.artist_articles FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: movie_articles Authenticated can delete movie_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can delete movie_articles" ON public.movie_articles FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: artist_articles Authenticated can insert artist_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can insert artist_articles" ON public.artist_articles FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: movie_articles Authenticated can insert movie_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can insert movie_articles" ON public.movie_articles FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: artist_articles Authenticated can update artist_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can update artist_articles" ON public.artist_articles FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: movie_articles Authenticated can update movie_articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can update movie_articles" ON public.movie_articles FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: artist_gallery Authenticated users can delete artist_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete artist_gallery" ON public.artist_gallery FOR DELETE TO authenticated USING (true);


--
-- Name: artists Authenticated users can delete artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete artists" ON public.artists FOR DELETE TO authenticated USING (true);


--
-- Name: movie_artists Authenticated users can delete movie_artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete movie_artists" ON public.movie_artists FOR DELETE TO authenticated USING (true);


--
-- Name: movie_gallery Authenticated users can delete movie_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete movie_gallery" ON public.movie_gallery FOR DELETE TO authenticated USING (true);


--
-- Name: movies Authenticated users can delete movies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete movies" ON public.movies FOR DELETE TO authenticated USING (true);


--
-- Name: artist_gallery Authenticated users can insert artist_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert artist_gallery" ON public.artist_gallery FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: artists Authenticated users can insert artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert artists" ON public.artists FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: movie_artists Authenticated users can insert movie_artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert movie_artists" ON public.movie_artists FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: movie_gallery Authenticated users can insert movie_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert movie_gallery" ON public.movie_gallery FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: movies Authenticated users can insert movies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert movies" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: artist_gallery Authenticated users can update artist_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update artist_gallery" ON public.artist_gallery FOR UPDATE TO authenticated USING (true);


--
-- Name: artists Authenticated users can update artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update artists" ON public.artists FOR UPDATE TO authenticated USING (true);


--
-- Name: movie_artists Authenticated users can update movie_artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update movie_artists" ON public.movie_artists FOR UPDATE TO authenticated USING (true);


--
-- Name: movie_gallery Authenticated users can update movie_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update movie_gallery" ON public.movie_gallery FOR UPDATE TO authenticated USING (true);


--
-- Name: movies Authenticated users can update movies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update movies" ON public.movies FOR UPDATE TO authenticated USING (true);


--
-- Name: user_roles Only admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: artist_articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artist_articles ENABLE ROW LEVEL SECURITY;

--
-- Name: artist_gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artist_gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: artists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

--
-- Name: movie_articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.movie_articles ENABLE ROW LEVEL SECURITY;

--
-- Name: movie_artists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.movie_artists ENABLE ROW LEVEL SECURITY;

--
-- Name: movie_gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.movie_gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: movies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


