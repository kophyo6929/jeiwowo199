import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session!.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["adminVideos"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVideos"] });
      toast.success("Video deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete video");
    },
  });

  if (!session) {
    navigate("/auth");
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVideo(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
              </DialogHeader>
              <VideoForm
                video={editingVideo}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingVideo(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {videos?.map((video) => (
            <Card key={video.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  {video.poster_url && (
                    <img
                      src={video.poster_url}
                      alt={video.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {video.year} • {video.genre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingVideo(video);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoForm({ video, onClose }: { video?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: video?.title || "",
    year: video?.year || "",
    rating: video?.rating || "",
    genre: video?.genre || "",
    poster_url: video?.poster_url || "",
    duration: video?.duration || "",
    director: video?.director || "",
    release_date: video?.release_date || "",
    synopsis: video?.synopsis || "",
    file_size: video?.file_size || "",
    quality: video?.quality || "",
    format: video?.format || "",
    subtitle_info: video?.subtitle_info || "",
    is_series: video?.is_series || false,
    seasons: video?.seasons || null,
  });

  const [downloadLinks, setDownloadLinks] = useState([
    { server: "", size: "", resolution: "", resolution_img: "", url: "" },
  ]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (video) {
        const { error } = await supabase.from("videos").update(data).eq("id", video.id);
        if (error) throw error;
        return video.id;
      } else {
        const { data: newVideo, error } = await supabase
          .from("videos")
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return newVideo.id;
      }
    },
    onSuccess: async (videoId) => {
      if (downloadLinks.some((link) => link.url)) {
        await supabase.from("download_links").delete().eq("video_id", videoId);

        const validLinks = downloadLinks.filter((link) => link.url);
        if (validLinks.length > 0) {
          await supabase.from("download_links").insert(
            validLinks.map((link) => ({
              ...link,
              video_id: videoId,
            }))
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["adminVideos"] });
      toast.success(video ? "Video updated!" : "Video added!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to save video");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre">Genre *</Label>
        <Input
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          placeholder="Action, Drama, Sci-Fi"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="poster_url">Poster URL</Label>
        <Input
          id="poster_url"
          value={formData.poster_url}
          onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="director">Director</Label>
        <Input
          id="director"
          value={formData.director}
          onChange={(e) => setFormData({ ...formData, director: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsis">Synopsis</Label>
        <Textarea
          id="synopsis"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_series"
          checked={formData.is_series}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_series: checked as boolean })
          }
        />
        <Label htmlFor="is_series">Is this a TV series?</Label>
      </div>

      {formData.is_series && (
        <div className="space-y-2">
          <Label htmlFor="seasons">Number of Seasons</Label>
          <Input
            id="seasons"
            type="number"
            value={formData.seasons || ""}
            onChange={(e) => setFormData({ ...formData, seasons: parseInt(e.target.value) })}
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Download Links</Label>
        {downloadLinks.map((link, index) => (
          <Card key={index}>
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Server (e.g., Yoteshin)"
                  value={link.server}
                  onChange={(e) => {
                    const newLinks = [...downloadLinks];
                    newLinks[index].server = e.target.value;
                    setDownloadLinks(newLinks);
                  }}
                />
                <Input
                  placeholder="Size (e.g., 5.8 GB)"
                  value={link.size}
                  onChange={(e) => {
                    const newLinks = [...downloadLinks];
                    newLinks[index].size = e.target.value;
                    setDownloadLinks(newLinks);
                  }}
                />
              </div>
              <Input
                placeholder="Resolution (e.g., 1080p Full HD)"
                value={link.resolution}
                onChange={(e) => {
                  const newLinks = [...downloadLinks];
                  newLinks[index].resolution = e.target.value;
                  setDownloadLinks(newLinks);
                }}
              />
              <Input
                placeholder="Resolution Image URL (optional)"
                value={link.resolution_img}
                onChange={(e) => {
                  const newLinks = [...downloadLinks];
                  newLinks[index].resolution_img = e.target.value;
                  setDownloadLinks(newLinks);
                }}
              />
              <Input
                placeholder="Telegram Bot URL *"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...downloadLinks];
                  newLinks[index].url = e.target.value;
                  setDownloadLinks(newLinks);
                }}
              />
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setDownloadLinks([
              ...downloadLinks,
              { server: "", size: "", resolution: "", resolution_img: "", url: "" },
            ])
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
