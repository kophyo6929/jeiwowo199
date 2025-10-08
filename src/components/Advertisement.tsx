import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface AdvertisementProps {
  placement: string;
}

export function Advertisement({ placement }: AdvertisementProps) {
  const { data: ads } = useQuery({
    queryKey: ["advertisements", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements" as any)
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1);

      if (error) throw error;
      return data;
    },
  });

  const ad: any = ads?.[0];

  if (!ad) {
    // Fallback placeholder
    return (
      <div className="w-full bg-secondary/50 rounded-lg p-8 text-center border-2 border-dashed border-border">
        <p className="text-muted-foreground mb-4">Advertisement Space</p>
        <Button asChild variant="outline">
          <a 
            href="https://t.me/ceo_metaverse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Advertise with us
          </a>
        </Button>
      </div>
    );
  }

  return (
    <a
      href={ad.target_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
    >
      {ad.media_type === 'video' ? (
        <video
          src={ad.image_url}
          controls
          className="w-full h-auto"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-auto"
        />
      )}
    </a>
  );
}
