import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  year: string;
  rating?: string;
  genre: string;
  posterUrl?: string;
  isSeries?: boolean;
  seasons?: number;
}

export const VideoCard = ({
  id,
  title,
  year,
  rating,
  genre,
  posterUrl,
  isSeries,
  seasons,
}: VideoCardProps) => {
  return (
    <Link to={`/video/${id}`}>
      <Card className="group overflow-hidden border-0 bg-card card-hover cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground">No Poster</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {rating && (
            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="text-xs font-semibold">{rating}</span>
            </div>
          )}

          {isSeries && seasons && (
            <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">
              {seasons} Season{seasons > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-1">{title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{year}</span>
            </div>
            <span className="line-clamp-1">{genre.split(",")[0]}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
