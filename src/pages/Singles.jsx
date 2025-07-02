import { Link, useNavigate, useParams } from "react-router-dom";
import { useArtistData } from "../hooks/useArtistData";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Singles = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { data: artistDetails, isPending } = useArtistData(artistId);

  const scrollRef = useRef(null);
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const content = scrollRef.current;

    const handleScroll = () => {
      if (content?.scrollTop > 0) {
        setHasShadow(true);
      } else {
        setHasShadow(false);
      }
    };

    content?.addEventListener("scroll", handleScroll);
    return () => content?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="w-full h-full bg-neutral-800/60 backdrop-blur-lg overflow-auto hide-scrollbar-buttons scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent select-none"
    >
      {/* Sticky Header */}
      <div
        className={`sticky flex items-center gap-3 top-0 p-4 transition-all ${
          hasShadow ? "bg-neutral-800 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="bg-transparent">
          <Button
            variant="text"
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              minWidth: "unset",
              padding: 0,
              margin: 0,
              color: "white",
              backgroundColor: "rgba(42, 42, 42, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(42, 42, 42, 1)",
              },
            }}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="w-4 h-4 p-2 transition-all rounded-full"
              onClick={() => navigate(-1)}
            />
          </Button>
        </div>
        <h1 className="font-[800] text-neutral-100 text-2xl">Singles</h1>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-6 px-5 gap-4 pb-5">
        {artistDetails?.singles?.map((album, index) => (
          <Link to={`/album/${album.id}`} key={index}>
            <div className="cursor-pointer transition-all hover:bg-neutral-700/60 p-3 rounded w-full flex flex-col items-center h-full">
              <div>
                {album?.image?.[2]?.url ? (
                  <img
                    src={album.image[2].url}
                    className="w-40 rounded-md mb-3"
                    alt={album.name || "Album"}
                    loading="lazy"
                  />
                ) : (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width={160}
                    height={160}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      "&::after": {
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                      },
                    }}
                  />
                )}
              </div>
              <div>
                <h1 className="font-semibold text-neutral-100 line-clamp-2 w-40">
                  {album.name}
                </h1>
                <p className="font-semibold text-neutral-400 text-sm line-clamp-2 w-40">
                  {album.year} • {capitalizeFirstLetter(album.type)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Singles;
