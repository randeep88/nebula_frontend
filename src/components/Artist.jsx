import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Skeleton } from "@mui/material";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { useSearchResults } from "../hooks/useSearchResults";

const Artist = () => {
  const { setCurrentSong, setIsPlaying, searchQuery } = usePlayerStore();

  const { data, isPending } = useSearchResults(searchQuery);

  const artists = data?.artists || null;
  console.log(artists);

  return (
    <div className="p-5 bg-neutral-800/60 backdrop-blur-lg h-screen">
      {!isPending ? (
        <div>
          {artists && (
            <div>
              <div className="grid grid-cols-6">
                <Link to={`/artist/${artists?.id}`}>
                  <div className="transition-all hover:bg-neutral-700/60 p-3 rounded w-full flex flex-col items-center h-full">
                    <div>
                      {Array.isArray(artists?.image) &&
                      artists.image.length > 2 &&
                      artists.image[2].url ? (
                        <img
                          src={artists?.image[2]?.url}
                          className="w-40 rounded-full mb-3"
                        />
                      ) : (
                        <div className="mb-3">
                          <Skeleton
                            variant="circular"
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
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start w-full">
                      <h1 className="text-neutral-100 font-semibold w-40 line-clamp-2">
                        {artists?.name}
                      </h1>
                      <p className="text-neutral-400 text-sm font-semibold">
                        {capitalizeFirstLetter(artists?.type)}
                      </p>
                    </div>
                  </div>
                </Link>

                {artists?.similarArtists?.slice(0, 5).map((artist, index) => (
                  <Link to={`/artist/${artist?.id}`} key={index}>
                    <div className="transition-all hover:bg-neutral-700/60 p-3 rounded w-full flex flex-col items-center h-full">
                      <img
                        src={artist?.image[2]?.url}
                        className="w-40 rounded-full mb-3"
                      />

                      <div className="flex flex-col items-start w-full">
                        <h1 className="text-neutral-100 font-semibold w-40 line-clamp-2">
                          {artist?.name}
                        </h1>
                        <p className="text-neutral-400 text-sm font-semibold">
                          {capitalizeFirstLetter(artist?.type)}
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
            <div className="flex flex-col justify-center items-center mb-5">
              <Skeleton
                animation="wave"
                variant="circular"
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

export default Artist;
