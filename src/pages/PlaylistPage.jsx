import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Skeleton, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdPlayCircle } from "react-icons/md";
import { MdPauseCircle } from "react-icons/md";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";
import {
  faArrowLeft,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import gif from "../assets/gif3.gif";
import { formatDuration } from "../utils/formatDuration";
import "../App.css";
import ColorThief from "colorthief";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLibrary } from "../hooks/useLibrary";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import toast, { LoaderIcon } from "react-hot-toast";
import axios from "axios";
import { usePlaylistData } from "../hooks/usePlaylistData";

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const {
    isPlaying,
    setIsPlaying,
    setCurrentSong,
    currentSong,
    setSongsQueue,
  } = usePlayerStore();
  const navigate = useNavigate();
  const [gradientColor, setGradientColor] = useState("#070608");
  const imgRef = useRef(null);

  const { data: playlistDetails, isPending } = usePlaylistData(playlistId);

  useEffect(() => {
    if (!playlistDetails?.image?.[2]?.url || !imgRef.current) return;

    const colorThief = new ColorThief();
    const img = imgRef.current;

    const handleImageLoad = () => {
      try {
        const dominantColor = colorThief.getColor(img);
        setGradientColor(`rgb(${dominantColor.join(",")})`);
      } catch (err) {
        console.error("Error extracting color:", err);
        setGradientColor("#1e3264");
      }
    };

    img.crossOrigin = "Anonymous";
    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener("load", handleImageLoad);
      return () => img.removeEventListener("load", handleImageLoad);
    }
  }, [playlistDetails?.image]);

  const handleSongClick = useCallback(
    (song) => {
      if (!song?.id) return;

      if (currentSong?.id === song.id && isPlaying) {
        setIsPlaying(false);
      } else {
        setSongsQueue(playlistDetails.songs);
        setCurrentSong(song);
        setIsPlaying(true);
      }
    },
    [
      currentSong?.id,
      isPlaying,
      setCurrentSong,
      setIsPlaying,
      setSongsQueue,
      playlistDetails?.songs,
    ]
  );

  const { libraryItems } = useLibrary();

  const isSongInPlaylist = playlistDetails?.songs?.some(
    (song) => song?.id === currentSong?.id
  );

  const addPlaylist = async (playlistId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const res = await axios.post(
      "https://nebula-music-player-3.onrender.com/library/playlist/add",
      { playlistId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  const removePlaylist = async (playlistId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const res = await axios.delete(
      "https://nebula-music-player-3.onrender.com/library/playlist/remove",
      {
        data: { playlistId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  };

  const queryClient = useQueryClient();

  const { mutate: addPlaylistMutate, isPending: isAddingPlaylist } =
    useMutation({
      mutationFn: addPlaylist,
      onMutate: async (playlistId) => {
        await queryClient.cancelQueries({ queryKey: ["libraryPlaylists"] });
        const previousPlaylists = queryClient.getQueryData([
          "libraryPlaylists",
        ]);
        queryClient.setQueryData(["libraryPlaylists"], (old) => [
          ...(old || []),
          {
            type: "playlist",
            id: playlistId,
            success: true,
            ...playlistDetails,
          },
        ]);
        return { previousPlaylists };
      },
      onError: (error, playlistId, context) => {
        queryClient.setQueryData(
          ["libraryPlaylists"],
          context.previousPlaylists
        );
        toast.error("Failed to add playlist to library", {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#FF0000",
            secondary: "#FFFAEE",
          },
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["libraryPlaylists"] });
      },
      onSuccess: (data) => {
        toast.success("Playlist added to your library", {
          style: {
            background: "#14532d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#FFFAEE",
          },
        });
      },
    });

  const { mutate: removePlaylistMutate, isPending: isRemovingPlaylist } =
    useMutation({
      mutationFn: removePlaylist,
      onMutate: async (playlistId) => {
        await queryClient.cancelQueries({ queryKey: ["libraryPlaylists"] });
        const previousPlaylists = queryClient.getQueryData([
          "libraryPlaylists",
        ]);
        queryClient.setQueryData(["libraryPlaylists"], (old) =>
          (old || []).filter((p) => p.id !== playlistId)
        );
        return { previousPlaylists };
      },
      onError: (error, context) => {
        queryClient.setQueryData(
          ["libraryPlaylists"],
          context.previousPlaylists
        );
        toast.error("Failed to remove playlist from library", {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#FF0000",
            secondary: "#FFFAEE",
          },
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["libraryPlaylists"] });
      },
      onSuccess: (data) => {
        toast.success("Playlist removed from your library", {
          style: {
            background: "#14532d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#FFFAEE",
          },
        });
      },
    });

  const isExist = libraryItems.some(
    (entry) =>
      entry.type === "playlist" && entry.success && entry.id === playlistId
  );

  const handleAddToLibrary = () => {
    addPlaylistMutate(playlistId);
  };

  const handleRemove = () => {
    removePlaylistMutate(playlistId);
  };

  return (
    <div className="relative w-full overflow-auto bg-neutral-800/60 backdrop-blur-lg scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent select-none">
      <div className="p-2 absolute bg-transparent">
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

      <div
        className="flex items-center gap-5 w-full p-5 pt-7"
        style={{
          background: `linear-gradient(to bottom, ${gradientColor}, #26262699)`,
          minHeight: "300px",
        }}
      >
        <div>
          {playlistDetails?.image?.[2]?.url ? (
            <img
              ref={imgRef}
              src={playlistDetails.image[2].url}
              className="w-52 rounded"
              alt={playlistDetails.name || "Playlist"}
              loading="lazy"
            />
          ) : (
            <Skeleton
              variant="rectangular"
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
        <div className="space-y-2">
          {!isPending ? (
            <h1 className="text-neutral-100 font-semibold">
              {capitalizeFirstLetter(playlistDetails?.type || "")}
            </h1>
          ) : (
            <Skeleton
              animation="wave"
              height={60}
              width={600}
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
          {!isPending ? (
            <h1 className="text-neutral-100 text-8xl font-[900] line-clamp-2 w-[55vw]">
              {playlistDetails?.name || ""}
            </h1>
          ) : (
            <Skeleton
              animation="wave"
              height={60}
              width={600}
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
          {!isPending ? (
            <p className="text-neutral-100 font-semibold">
              {playlistDetails?.description || ""} •{" "}
              {playlistDetails?.songCount || 0} songs
            </p>
          ) : (
            <Skeleton
              animation="wave"
              height={60}
              width={600}
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
      </div>

      {!isPending ? (
        <div className="p-5 flex items-center gap-5">
          <div>
            {isSongInPlaylist && isPlaying ? (
              <MdPauseCircle
                className="text-6xl text-[#00CDAC] cursor-pointer transition-all active:scale-95"
                onClick={() => setIsPlaying(false)}
              />
            ) : (
              <MdPlayCircle
                className="text-6xl text-[#00CDAC] cursor-pointer transition-all active:scale-95"
                onClick={() => {
                  if (playlistDetails.songs.length === 0)
                    return toast.error("No songs available in this playlist", {
                      style: {
                        background: "#7f1d1d99",
                        backdropFilter: "blur(5px)",
                        padding: "10px",
                        color: "#fff",
                        fontWeight: "600",
                      },
                      iconTheme: {
                        primary: "#FF0000",
                        secondary: "#FFFAEE",
                      },
                    });
                  setSongsQueue(playlistDetails.songs);
                  setCurrentSong(playlistDetails.songs[0]);
                  setIsPlaying(true);
                }}
              />
            )}
          </div>
          <div className="flex items-center justify-center">
            {!isExist ? (
              <button onClick={handleAddToLibrary} disabled={isAddingPlaylist}>
                {isAddingPlaylist ? (
                  <LoaderIcon />
                ) : (
                  <div className="group relative flex items-center justify-center">
                    <AddCircleOutlineOutlinedIcon
                      fontSize="large"
                      className="text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                    />
                    <div className="absolute bottom-12 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[7rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                      Add to library
                    </div>
                  </div>
                )}
              </button>
            ) : (
              <button onClick={handleRemove} disabled={isRemovingPlaylist}>
                {isRemovingPlaylist ? (
                  <LoaderIcon />
                ) : (
                  <div className="group relative flex items-center justify-center">
                    <CheckCircleIcon
                      fontSize="large"
                      className="text-[#00CDAC] transition-all active:scale-95 cursor-pointer"
                    />
                    <div className="absolute bottom-12 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[9rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                      Remove from library
                    </div>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 flex items-center gap-5">
          <Skeleton
            variant="circular"
            animation="wave"
            width={50}
            height={50}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              "&::after": {
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
              },
            }}
          />
          <Skeleton
            variant="circular"
            animation="wave"
            width={40}
            height={40}
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

      <div>
        <div className="flex sticky top-0 mb-5 z-20 items-center gap-3 pt-5 text-neutral-400 font-semibold border-b border-neutral-700 mx-5 p-2 transition-colors duration-300">
          <div className="text-center text-lg w-14">#</div>
          <div className="w-full text-sm">Title</div>
          <div className="w-2/12 text-center text-sm">Duration</div>
        </div>
        {!isPending && playlistDetails?.songs?.length ? (
          <div className="px-5">
            {playlistDetails.songs.map((song, index) => (
              <div
                key={song?.id || index}
                className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
                onClick={() => handleSongClick(song)}
              >
                <div className="font-semibold w-14 h-10 flex items-center group-hover:invisible justify-center text-neutral-400 relative cursor-pointer">
                  {currentSong?.id === song?.id && isPlaying ? (
                    <img src={gif} className="w-6" alt="Playing" />
                  ) : (
                    <div>{index + 1}</div>
                  )}
                  {currentSong?.id === song?.id && isPlaying ? (
                    <IoPauseSharp
                      className="text-white text-xl absolute group-hover:visible invisible"
                      onClick={() => setIsPlaying(false)}
                    />
                  ) : (
                    <IoPlaySharp
                      className="text-white text-xl absolute group-hover:visible invisible"
                      onClick={() => {
                        setCurrentSong(song);
                        setIsPlaying(true);
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div>
                    <img
                      src={song?.image?.[2]?.url || ""}
                      className="rounded w-10"
                      alt={song?.name || "Song"}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h1 className="text-neutral-100 font-semibold truncate overflow-hidden">
                      {song?.name || "Unknown Song"}
                    </h1>
                    <p className="text-neutral-400 group-hover:text-neutral-100 text-sm font-semibold truncate overflow-hidden">
                      {song?.artists?.primary?.[0]?.name || "Unknown Artist"}
                    </p>
                  </div>
                </div>
                <div className="w-2/12 group-hover:text-neutral-100 text-center text-sm text-neutral-400 font-semibold">
                  {formatDuration(song?.duration || 0)}
                </div>
              </div>
            ))}
          </div>
        ) : isPending ? (
          <div className="px-5">
            {[...Array(3)].map((_, index) => (
              <Skeleton
                key={index}
                animation="wave"
                height={60}
                className="rounded"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  "&::after": {
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 text-neutral-400 text-center font-semibold mt-7">
            No songs available in this playlist.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
