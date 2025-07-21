import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePlayerStore } from "../store/usePlayerStore";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { Link } from "react-router";
import { Button, CircularProgress } from "@mui/material";
import { useLibrary } from "../hooks/useLibrary";
import useUser from "../hooks/useUser";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";
import { Library } from "lucide-react";
import { TriangleAlert } from "lucide-react";

const Sidebar = () => {
  const {
    songsQueue,
    isQueueOpen,
    currentSong,
    currentIndex,
    isPlaying,
    setIsPlaying,
    setCurrentSong,
    setIsQueueOpen,
  } = usePlayerStore();

  const { libraryItems, isLoading, isError } = useLibrary();

  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full w-full min-w-[300px] max-w-[400px] overflow-hidden select-none bg-neutral-800/60 backdrop-blur-lg">
        <div className="text-neutral-400 font-semibold w-full h-full flex items-center justify-center gap-1">
          <Link to="/login" className="underline text-[#00CDAC] font-bold">
            Login
          </Link>
          <p>to access your library</p>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex flex-col h-full w-full min-w-[300px] max-w-[400px] overflow-hidden select-none bg-neutral-800/60 backdrop-blur-lg">
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress sx={{ color: "#00CDAC" }} />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full min-w-[300px] max-w-[400px] overflow-hidden select-none bg-neutral-800/60 backdrop-blur-lg">
      <div className="flex flex-col h-full">
        {isQueueOpen ? (
          <>
            <div className="p-4 font-bold flex items-center justify-between shrink-0">
              <h1>Queue</h1>
              {songsQueue.length > 0 && (
                <div
                  onClick={() => setIsQueueOpen(false)}
                  className="rounded-full"
                >
                  <Button
                    variant="text"
                    sx={{
                      borderRadius: "100%",
                      width: "30px",
                      height: "30px",
                      textTransform: "none",
                      minWidth: "unset",
                      padding: "10px",
                      margin: 0,
                      color: "#a3a3a4",
                      backgroundColor: "rgba(55, 55, 55, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(66, 66, 66, 1)",
                        color: "white",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </Button>
                </div>
              )}
            </div>

            {/* Scrollable Queue Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent px-1 pb-3">
              {songsQueue.length > 0 ? (
                <>
                  {/* Now Playing */}
                  {currentSong && (
                    <div className="min-w-max">
                      <h1 className="font-bold ps-3 mb-1">Now playing</h1>
                      <div className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group">
                        <div className="flex items-center justify-between w-full min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="relative group flex items-center justify-center w-10 h-10">
                              <img
                                src={currentSong?.image?.[2]?.url || ""}
                                className="rounded w-10 overflow-hidden"
                                alt={currentSong?.name || "Song"}
                                loading="lazy"
                              />
                              <div className="w-10 h-10 absolute bg-black rounded group-hover:bg-opacity-50 bg-opacity-0"></div>
                              {isPlaying ? (
                                <IoPauseSharp
                                  className="text-white text-xl absolute group-hover:visible invisible"
                                  onClick={() => setIsPlaying(false)}
                                />
                              ) : (
                                <IoPlaySharp
                                  className="text-white text-xl absolute group-hover:visible invisible"
                                  onClick={() => {
                                    setCurrentSong(currentSong);
                                    setIsPlaying(true);
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <h1 className="text-neutral-100 font-semibold overflow-hidden truncate max-w-[200px]">
                                {currentSong?.name || "Unknown Song"}
                              </h1>
                              <p className="text-neutral-400 group-hover:text-neutral-100 text-sm font-semibold truncate max-w-[200px]">
                                {currentSong?.artists?.primary?.[0]?.name ||
                                  "Unknown Artist"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Up */}
                  <div className="mt-5 min-w-max">
                    <h1 className="font-bold ps-3 mb-1">Next up</h1>
                    {songsQueue.slice(currentIndex + 1).map((song, index) => (
                      <div
                        key={song?.id || index}
                        className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
                      >
                        <div className="flex items-center justify-between w-full min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="relative group flex items-center justify-center w-10 h-10">
                              <img
                                src={song?.image?.[2]?.url || ""}
                                className="rounded w-10 overflow-hidden"
                                alt={song?.name || "Song"}
                                loading="lazy"
                              />
                              <div className="w-10 h-10 absolute bg-black rounded group-hover:bg-opacity-50 bg-opacity-0"></div>
                              <IoPlaySharp
                                className="text-white text-xl absolute group-hover:visible invisible"
                                onClick={() => {
                                  setCurrentSong(song);
                                  setIsPlaying(true);
                                }}
                              />
                            </div>
                            <div>
                              <h1 className="text-neutral-100 font-semibold overflow-hidden truncate max-w-[200px]">
                                {song?.name || "Unknown Song"}
                              </h1>
                              <p className="text-neutral-400 group-hover:text-neutral-100 text-sm font-semibold truncate max-w-[200px]">
                                {song?.artists?.primary?.[0]?.name ||
                                  "Unknown Artist"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center font-semibold mt-10 min-w-max">
                  Queue is Empty <br />
                  <span className="text-sm text-neutral-400">
                    Try adding some songs
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col h-full">
              <h1 className="p-4 font-bold flex items-center justify-between shrink-0">
                Your Library
              </h1>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent px-1 pb-3">
                {isError ? (
                  <p className="flex flex-col items-center justify-center text-red-500 font-semibold mt-32">
                    <TriangleAlert
                      size={50}
                      strokeWidth={1.5}
                      className="mb-2"
                    />
                    <p className="font-bold text-center">
                      Failed to load your library.
                    </p>
                  </p>
                ) : libraryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-neutral-400 font-semibold mt-32 px-3">
                    <Library
                      size={50}
                      strokeWidth={1.5}
                      className="text-neutral-400 mb-2"
                    />
                    <h1 className="font-bold mb-2 text-center">
                      Your library is empty
                    </h1>
                    <p className="text-sm text-center">
                      Add your favorite artists, albums, and playlists to build
                      your collection.
                    </p>
                  </div>
                ) : (
                  libraryItems.map((item, index) => (
                    <Link
                      key={item?.id || index}
                      to={
                        item?.type === "artist"
                          ? `/artist/${item?.id}`
                          : item?.type === "album"
                          ? `/album/${item?.id}`
                          : item?.type === "playlist"
                          ? `/playlist/${item?.id}`
                          : ""
                      }
                    >
                      <div className="hover:bg-neutral-700/60 transition-all p-2 m-1 rounded flex items-center gap-3 cursor-pointer min-w-[280px]">
                        <img
                          src={item?.data?.image?.[2]?.url || ""}
                          className="w-12 rounded"
                        />
                        <div>
                          <h1 className="font-semibold line-clamp-1">
                            {item?.data?.name || "Unknown"}
                          </h1>
                          {item?.type === "album" ? (
                            <p className="text-sm text-neutral-400 font-semibold">
                              {capitalizeFirstLetter(item?.type || "")} &bull;{" "}
                              {item?.data?.artists?.primary[0]?.name}
                            </p>
                          ) : (
                            <p className="text-sm text-neutral-400 font-semibold">
                              {capitalizeFirstLetter(item?.type || "")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
