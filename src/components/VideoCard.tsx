import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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
      <Card className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm card-hover cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
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
          
          {/* Quality Badge */}
          <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-600 text-white font-bold px-2 py-0.5 text-xs">
            4K
          </Badge>

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-white">{rating}</span>
            </div>
          )}

          {/* Series Badge */}
          {isSeries && seasons && (
            <Badge className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm">
              {seasons} Season{seasons > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <CardContent className="p-3 space-y-1">
          <h3 className="font-bold text-base line-clamp-2 leading-tight">{title}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400 font-medium">{year}</span>
            <span className="text-muted-foreground text-xs line-clamp-1">{genre.split(",")[0]}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
