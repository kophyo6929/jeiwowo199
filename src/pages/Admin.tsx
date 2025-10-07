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

  // Check if logged-in user is admin
  const ADMIN_EMAIL = "thewayofthedragg@gmail.com";
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

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
    genre: video?.genre || "",
    poster_url: video?.poster_url || "",
    director: video?.director || "",
    synopsis: video?.synopsis || "",
    is_series: video?.is_series || false,
    seasons: video?.seasons || null,
    rating: video?.rating || "",
    duration: video?.duration || "",
  });

  const [telegramLink, setTelegramLink] = useState(video?.telegram_link || "");
  const [cast, setCast] = useState(video?.cast || "");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadPoster = async () => {
    if (!posterFile) return formData.poster_url;

    setUploading(true);
    try {
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, posterFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload poster: " + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const posterUrl = await uploadPoster();
      
      const dataToSave = {
        ...formData,
        poster_url: posterUrl,
        telegram_link: telegramLink,
        cast,
      };

      if (video) {
        const { error } = await supabase.from("videos").update(dataToSave).eq("id", video.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVideos"] });
      toast.success(video ? "Video updated!" : "Video added!");
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to save video: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{formData.is_series ? "Series" : "Movie"} Name *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter the title"
          required
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

      <div className="space-y-2">
        <Label htmlFor="poster_image">Poster Image *</Label>
        <Input
          id="poster_image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPosterFile(file);
              // Show preview
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData({ ...formData, poster_url: reader.result as string });
              };
              reader.readAsDataURL(file);
            }
          }}
          required={!video && !formData.poster_url}
        />
        {formData.poster_url && (
          <div className="mt-2">
            <img
              src={formData.poster_url}
              alt="Poster preview"
              className="w-32 h-48 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsis">Details / Movie Guide *</Label>
        <Textarea
          id="synopsis"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          placeholder="Enter the plot, storyline, or description"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cast">Cast (Actors/Actresses - separate by comma)</Label>
        <Input
          id="cast"
          value={cast}
          onChange={(e) => setCast(e.target.value)}
          placeholder="Actor 1, Actor 2, Actor 3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Release Year *</Label>
          <Input
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="2024"
            required
          />
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
      </div>

      {formData.is_series && (
        <div className="space-y-2">
          <Label htmlFor="seasons">Number of Seasons *</Label>
          <Input
            id="seasons"
            type="number"
            value={formData.seasons || ""}
            onChange={(e) => setFormData({ ...formData, seasons: parseInt(e.target.value) })}
            placeholder="1"
            required={formData.is_series}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="director">Director</Label>
        <Input
          id="director"
          value={formData.director}
          onChange={(e) => setFormData({ ...formData, director: e.target.value })}
          placeholder="Director name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (IMDb/Rotten Tomatoes)</Label>
          <Input
            id="rating"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            placeholder="8.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="2h 30m"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telegram_link">Telegram Watch/Download Link *</Label>
        <Input
          id="telegram_link"
          value={telegramLink}
          onChange={(e) => setTelegramLink(e.target.value)}
          placeholder="https://t.me/..."
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveMutation.isPending || uploading}>
          {uploading ? "Uploading..." : saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
