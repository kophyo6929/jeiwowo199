import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import { Advertisement } from "@/components/Advertisement";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, TrendingUp } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const filter = searchParams.get("filter"); // 'movies', 'series', or null for all

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", searchQuery],
    queryFn: async () => {
      let query = supabase.from("videos").select("*").order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const movies = videos?.filter((v) => !v.is_series) || [];
  const series = videos?.filter((v) => v.is_series) || [];
  
  // Get trending (recently added) content - limit to 10
  const trendingMovies = movies.slice(0, 10);
  const trendingSeries = series.slice(0, 10);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Ad */}
      <div className="container py-4">
        <Advertisement placement="hero" />
      </div>

      {/* Main Content */}
      <section className="container py-12 space-y-12">
        {searchQuery ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Search results for "{searchQuery}"
              </h2>
              <p className="text-muted-foreground">Found {videos?.length || 0} results</p>
            </div>
            
            <Tabs defaultValue={movies.length > 0 ? "movies" : "series"} className="space-y-8">
              <TabsList>
                <TabsTrigger value="movies" className="space-x-2">
                  <Film className="h-4 w-4" />
                  <span>Movies ({movies.length})</span>
                </TabsTrigger>
                <TabsTrigger value="series" className="space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>TV Series ({series.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="movies">
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : movies.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {movies.map((video) => (
                      <VideoCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        year={video.year}
                        rating={video.rating}
                        genre={video.genre}
                        posterUrl={video.poster_url}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No movies found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="series">
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : series.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {series.map((video) => (
                      <VideoCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        year={video.year}
                        rating={video.rating}
                        genre={video.genre}
                        posterUrl={video.poster_url}
                        isSeries={video.is_series}
                        seasons={video.seasons}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No series found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : filter === 'movies' ? (
          <>
            {/* Movies Only View */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Film className="h-7 w-7 text-primary" />
                  All Movies
                </h2>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : movies.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {movies.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      year={video.year}
                      rating={video.rating}
                      genre={video.genre}
                      posterUrl={video.poster_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies available</p>
                </div>
              )}
            </div>
          </>
        ) : filter === 'series' ? (
          <>
            {/* Series Only View */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Tv className="h-7 w-7 text-primary" />
                  All Series
                </h2>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : series.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {series.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      year={video.year}
                      rating={video.rating}
                      genre={video.genre}
                      posterUrl={video.poster_url}
                      isSeries={video.is_series}
                      seasons={video.seasons}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No series available</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Sidebar Ad */}
            <Advertisement placement="sidebar" />

            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending Movies
                  </h2>
                  <Button asChild variant="ghost">
                    <Link to="/?filter=movies">View All</Link>
                  </Button>
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {trendingMovies.map((video) => (
                      <VideoCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        year={video.year}
                        rating={video.rating}
                        genre={video.genre}
                        posterUrl={video.poster_url}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Trending Series */}
            {trendingSeries.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending Series
                  </h2>
                  <Button asChild variant="ghost">
                    <Link to="/?filter=series">View All</Link>
                  </Button>
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {trendingSeries.map((video) => (
                      <VideoCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        year={video.year}
                        rating={video.rating}
                        genre={video.genre}
                        posterUrl={video.poster_url}
                        isSeries={video.is_series}
                        seasons={video.seasons}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Movies Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Film className="h-7 w-7 text-primary" />
                  Movies
                </h2>
                {movies.length > 10 && (
                  <Button asChild variant="ghost">
                    <Link to="/?filter=movies">View All</Link>
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : movies.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {movies.slice(0, 10).map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      year={video.year}
                      rating={video.rating}
                      genre={video.genre}
                      posterUrl={video.poster_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies available</p>
                </div>
              )}
            </div>

            {/* All Series Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Tv className="h-7 w-7 text-primary" />
                  Series
                </h2>
                {series.length > 10 && (
                  <Button asChild variant="ghost">
                    <Link to="/?filter=series">View All</Link>
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : series.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {series.slice(0, 10).map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      year={video.year}
                      rating={video.rating}
                      genre={video.genre}
                      posterUrl={video.poster_url}
                      isSeries={video.is_series}
                      seasons={video.seasons}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No series available</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Index;
