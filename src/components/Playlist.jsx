import { usePlayerStore } from "../store/usePlayerStore";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import "../App.css";
import { useSearchResults } from "../hooks/useSearchResults";

const Playlist = () => {
  const { searchQuery } = usePlayerStore();
  const { data, isPending } = useSearchResults(searchQuery);

  const playlists = data?.playlists || [];
  return (
    <div className="p-5 bg-neutral-800/60 backdrop-blur-lg">
      {!isPending ? (
        <div>
          {playlists.length > 0 && (
            <div>
              <div className="grid grid-cols-6">
                {playlists?.map((playlist, index) => (
                  <Link to={`/playlist/${playlist.id}`} key={index}>
                    <div className="cursor-pointer transition-all hover:bg-neutral-800 p-3 rounded w-full flex flex-col items-center h-full">
                      <div>
                        {playlist?.image[2]?.url ? (
                          <img
                            src={playlist.image[2].url}
                            className="w-40 rounded-md mb-3"
                          />
                        ) : (
                          <Skeleton
                            variant="circular"
                            animation="wave"
                            width={208}
                            height={208}
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
                      <div className="flex flex-col items-start w-full">
                        <h1 className="font-semibold text-neutral-100 w-40 line-clamp-2">
                          {playlist.name}
                        </h1>
                        <p className="font-semibold text-neutral-400 text-sm">
                          {capitalizeFirstLetter(playlist.type)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 p-3 grid grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-center items-center mb-5"
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                height={140}
                width={140}
                className="rounded mb-2"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  "&::after": {
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                  },
                }}
              />
              <Skeleton
                animation="wave"
                width={140}
                className="rounded"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  "&::after": {
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                  },
                }}
              />
              <Skeleton
                animation="wave"
                width={100}
                className="rounded"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  "&::after": {
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                  },
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlist;
