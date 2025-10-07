import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Calendar, Clock, Film, Download } from "lucide-react";
import { Header } from "@/components/Header";

export default function VideoDetail() {
  const { id } = useParams();

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: cast } = useQuery({
    queryKey: ["cast", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_cast")
        .select("*")
        .eq("video_id", id);

      if (error) throw error;
      return data;
    },
  });

  const { data: downloadLinks } = useQuery({
    queryKey: ["downloadLinks", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_links")
        .select("*")
        .eq("video_id", id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-secondary rounded-lg mb-6" />
            <div className="h-8 bg-secondary rounded w-1/3 mb-4" />
            <div className="h-4 bg-secondary rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        {video.poster_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
              style={{ backgroundImage: `url(${video.poster_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </>
        )}

        <div className="container relative h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {video.poster_url && (
              <img
                src={video.poster_url}
                alt={video.title}
                className="w-64 rounded-lg shadow-2xl glow"
              />
            )}

            <div className="flex-1 pb-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>

              <h1 className="text-5xl font-bold mb-4">{video.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                {video.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-gold text-gold" />
                    <span className="text-xl font-semibold">{video.rating}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{video.year}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{video.duration}</span>
                </div>

                {video.is_series && video.seasons && (
                  <Badge variant="secondary">{video.seasons} Seasons</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {video.genre.split(",").map((g) => (
                  <Badge key={g.trim()} variant="outline">
                    {g.trim()}
                  </Badge>
                ))}
              </div>

              {video.director && (
                <p className="text-muted-foreground mb-2">
                  <span className="font-semibold">Director:</span> {video.director}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Synopsis */}
            <Card>
              <CardHeader>
                <CardTitle>Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {video.synopsis || "No synopsis available."}
                </p>
              </CardContent>
            </Card>

            {/* Cast */}
            {cast && cast.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cast.map((member) => (
                      <div key={member.id} className="text-center">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">{member.name[0]}</span>
                          </div>
                        )}
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.character}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Links */}
            {(video.telegram_link || (downloadLinks && downloadLinks.length > 0)) && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Download Links</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left text-xs font-semibold p-3 border-b">No</th>
                          <th className="text-left text-xs font-semibold p-3 border-b">Server Name</th>
                          <th className="text-left text-xs font-semibold p-3 border-b">Size</th>
                          <th className="text-left text-xs font-semibold p-3 border-b">Resolution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {video.telegram_link && (
                          <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-sm">1</td>
                            <td className="p-3">
                              <a 
                                href={video.telegram_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                Telegram
                              </a>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">-</td>
                            <td className="p-3 text-sm">
                              <Badge variant="secondary">HD</Badge>
                            </td>
                          </tr>
                        )}
                        {downloadLinks?.map((link, index) => (
                          <tr key={link.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-sm">{video.telegram_link ? index + 2 : index + 1}</td>
                            <td className="p-3">
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                {link.server}
                              </a>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{link.size}</td>
                            <td className="p-3">
                              {link.resolution_img ? (
                                <img src={link.resolution_img} alt={link.resolution} className="h-5" />
                              ) : (
                                <Badge variant="secondary">{link.resolution}</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
