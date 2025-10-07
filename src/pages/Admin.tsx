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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);

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

  const { data: advertisements } = useQuery({
    queryKey: ["adminAdvertisements"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements" as any)
        .select("*")
        .order("display_order", { ascending: true });

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

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("advertisements" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAdvertisements"] });
      toast.success("Advertisement deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete advertisement");
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
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Videos</h2>
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
          </TabsContent>

          <TabsContent value="advertisements">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Advertisements</h2>
              <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingAd(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Advertisement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAd ? "Edit Advertisement" : "Add New Advertisement"}</DialogTitle>
                  </DialogHeader>
                  <AdForm
                    ad={editingAd}
                    onClose={() => {
                      setIsAdDialogOpen(false);
                      setEditingAd(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {advertisements?.map((ad: any) => (
                <Card key={ad.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      {ad.image_url && (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placement: {ad.placement}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {ad.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAd(ad);
                          setIsAdDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAdMutation.mutate(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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

function AdForm({ ad, onClose }: { ad?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: ad?.title || "",
    placement: ad?.placement || "header",
    target_url: ad?.target_url || "",
    image_url: ad?.image_url || "",
    is_active: ad?.is_active ?? true,
    display_order: ad?.display_order || 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `ad-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const imageUrl = await uploadImage();
      
      const dataToSave = {
        ...formData,
        image_url: imageUrl,
      };

      if (ad) {
        const { error } = await supabase.from("advertisements" as any).update(dataToSave).eq("id", ad.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("advertisements" as any).insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAdvertisements"] });
      toast.success(ad ? "Advertisement updated!" : "Advertisement added!");
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to save advertisement: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Advertisement Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter the title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="placement">Placement *</Label>
        <Select
          value={formData.placement}
          onValueChange={(value) => setFormData({ ...formData, placement: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select placement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="hero">Hero Section</SelectItem>
            <SelectItem value="sidebar">Sidebar</SelectItem>
            <SelectItem value="video-top">Video Detail - Top</SelectItem>
            <SelectItem value="video-bottom">Video Detail - Bottom</SelectItem>
            <SelectItem value="download-section">Download Section</SelectItem>
            <SelectItem value="footer">Footer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad_image">Advertisement Image *</Label>
        <Input
          id="ad_image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData({ ...formData, image_url: reader.result as string });
              };
              reader.readAsDataURL(file);
            }
          }}
          required={!ad && !formData.image_url}
        />
        {formData.image_url && (
          <div className="mt-2">
            <img
              src={formData.image_url}
              alt="Ad preview"
              className="max-w-full h-auto rounded border"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_url">Target URL *</Label>
        <Input
          id="target_url"
          value={formData.target_url}
          onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
          placeholder="https://example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked as boolean })
          }
        />
        <Label htmlFor="is_active">Active</Label>
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
