import { usePlayerStore } from "../store/usePlayerStore";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import "../App.css";
import { useSearchResults } from "../hooks/useSearchResults";
import { MdLibraryMusic } from "react-icons/md";

const Album = () => {
  const { searchQuery } = usePlayerStore();
  const { data, isPending } = useSearchResults(searchQuery);

  const albums = data?.albums || [];

  if (albums?.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <MdLibraryMusic size={60} className="mb-4 text-neutral-500" />
        <h2 className="text-xl font-semibold">No albums found</h2>
        <p className="text-sm mt-2 text-center max-w-sm">
          We couldn't find any albums matching your search. Try a different
          artist or keyword.
        </p>
      </div>
    );

  return (
    <div className="p-5">
      {!isPending ? (
        <div>
          {albums.length > 0 && (
            <div>
              <div className="grid grid-cols-6">
                {albums?.map((album, index) => (
                  <Link to={`/album/${album.id}`} key={index}>
                    <div className="cursor-pointer transition-all hover:bg-neutral-700/60 p-3 rounded w-full flex flex-col items-center h-full">
                      <div>
                        {album?.image?.[2]?.url ? (
                          <img
                            src={album.image[2].url}
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
                          {album.name}
                        </h1>
                        <p className="font-semibold text-neutral-400 text-sm">
                          {album.year} &bull;{" "}
                          {capitalizeFirstLetter(album.type)}
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
        <Skeleton
          animation="wave"
          height={250}
          className="rounded"
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
  );
};

export default Album;
