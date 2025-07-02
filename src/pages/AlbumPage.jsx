import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Skeleton, Button, CircularProgress } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdPlayCircle } from "react-icons/md";
import { MdPauseCircle } from "react-icons/md";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import gif from "../assets/gif3.gif";
import { formatDuration } from "../utils/formatDuration";
import "../App.css";
import ColorThief from "colorthief";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLibrary } from "../hooks/useLibrary";
import { useAlbumData } from "../hooks/useAlbumData";
import toast from "react-hot-toast";

const AlbumPage = () => {
  const { albumId } = useParams();
  const {
    artistDetails,
    isPlaying,
    currentSong,
    setIsPlaying,
    setCurrentSong,
    setSongsQueue,
  } = usePlayerStore();
  const navigate = useNavigate();
  const [gradientColor, setGradientColor] = useState("#1e3264");
  const imgRef = useRef(null);

  const { data: albumDetails, isPending } = useAlbumData(albumId);

  console.log(albumDetails);
  useEffect(() => {
    if (!albumDetails?.image?.[2]?.url || !imgRef.current) return;

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
  }, [albumDetails?.image]);

  const handleSongClick = useCallback(
    (song) => {
      if (!song?.id) return;

      if (currentSong?.id === song.id && isPlaying) {
        setIsPlaying(false);
      } else {
        setCurrentSong(song);
        setIsPlaying(true);
      }
    },
    [currentSong?.id, isPlaying, setCurrentSong, setIsPlaying]
  );

  const isSongInAlbum = albumDetails?.songs?.some(
    (song) => song?.id === currentSong?.id
  );

  const { libraryItems, refetch } = useLibrary();

  const token = localStorage.getItem("token");

  const addAlbum = async (albumId) => {
    if (!token) throw new Error("No token found");
    const res = await axios.post(
      "https://nebula-music-player-3.onrender.com/library/album/add",
      { albumId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Add album response:", res.data);
    return res.data;
  };

  console.log(gradientColor);

  const removeAlbum = async (albumId) => {
    if (!token) throw new Error("No token found");
    const res = await axios.delete(
      "https://nebula-music-player-3.onrender.com/library/album/remove",
      {
        data: { albumId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Remove album response:", res.data);
    return res.data;
  };

  const queryClient = useQueryClient();

  const { mutate: addAlbumMutate, isPending: isAddingAlbum } = useMutation({
    mutationFn: addAlbum,
    onMutate: async (albumId) => {
      await queryClient.cancelQueries({ queryKey: ["libraryAlbums"] });
      const previousAlbums = queryClient.getQueryData(["libraryAlbums"]);
      queryClient.setQueryData(["libraryAlbums"], (old) => [
        ...(old || []),
        { type: "album", id: albumId, success: true, ...albumDetails },
      ]);
      return { previousAlbums };
    },
    onError: (context) => {
      queryClient.setQueryData(["libraryAlbums"], context.previousAlbums);
      toast.error("Failed to add album to library");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryAlbums"] });
    },
    onSuccess: (data) => {
      toast.success("Album added to your library", {
        style: {
          border: "1px solid #00CDAC99",
          background: "#333333",
          padding: "10px",
          color: "#00CDAC",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#00CDAC",
          secondary: "#FFFAEE",
        },
      });
    },
  });

  const { mutate: removeAlbumMutate, isPending: isRemovingAlbum } = useMutation(
    {
      mutationFn: removeAlbum,
      onMutate: async (albumId) => {
        await queryClient.cancelQueries({ queryKey: ["libraryAlbums"] });
        const previousAlbums = queryClient.getQueryData(["libraryAlbums"]);
        queryClient.setQueryData(["libraryAlbums"], (old) =>
          (old || []).filter((a) => a.id !== albumId)
        );
        return { previousAlbums };
      },
      onError: (error, albumId, context) => {
        queryClient.setQueryData(["libraryAlbums"], context.previousAlbums);
        toast.error(error.response?.data?.message || "Failed to remove album");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["libraryAlbums"] });
      },
      onSuccess: (data) => {
        toast.success("Album removed from your library", {
          style: {
            border: "1px solid #00CDAC99",
            background: "#333333",
            padding: "10px",
            color: "#00CDAC",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#00CDAC",
            secondary: "#FFFAEE",
          },
        });
      },
    }
  );

  const isExist = libraryItems.some(
    (entry) => entry.type === "album" && entry.success && entry.id === albumId
  );

  const handleAddToLibrary = () => {
    addAlbumMutate(albumId);
  };

  const handleRemove = () => {
    removeAlbumMutate(albumId);
  };

  const headerRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, []);

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
          {albumDetails?.image?.[2]?.url ? (
            <img
              ref={imgRef}
              src={albumDetails.image[2].url}
              className="w-52 rounded"
              alt={albumDetails?.name || "Album"}
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
              {capitalizeFirstLetter(albumDetails?.type || "")}
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
            <h1 className="text-neutral-100 text-8xl font-[900] line-clamp-2 w-[60vw]">
              {albumDetails?.name || ""}
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
              {albumDetails?.description || ""} • {albumDetails?.songCount || 0}{" "}
              songs
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
      <div ref={sentinelRef} className="h-[0px] w-full"></div>

      {!isPending ? (
        <div
          ref={headerRef}
          className={`${
            isStuck
              ? "shadow-lg flex items-center gap-4 sticky top-0 z-10 px-5 py-2 transition-all"
              : "bg-transparent flex items-center gap-5 sticky top-0 z-10 p-5 transition-all"
          }`}
          style={isStuck ? { backgroundColor: gradientColor } : {}}
        >
          <div>
            {isSongInAlbum && isPlaying ? (
              <MdPauseCircle
                className="text-6xl text-[#00CDAC] cursor-pointer transition-all active:scale-95"
                onClick={() => setIsPlaying(false)}
              />
            ) : (
              <MdPlayCircle
                className="text-6xl text-[#00CDAC] cursor-pointer transition-all active:scale-95"
                onClick={() => {
                  if (albumDetails.songs.length === 0)
                    return toast.error("Album is empty");
                  setSongsQueue(albumDetails.songs);
                  setCurrentSong(albumDetails.songs[0]);
                }}
              />
            )}
          </div>
          {isStuck ? (
            <p className="text-white transition-all font-bold text-3xl -ms-2">
              {albumDetails?.name}
            </p>
          ) : (
            <div className="flex items-center justify-center">
              {!isExist ? (
                <button onClick={handleAddToLibrary} disabled={isAddingAlbum}>
                  {isAddingAlbum ? (
                    <CircularProgress size={20} />
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
                <button onClick={handleRemove} disabled={isRemovingAlbum}>
                  {isRemovingAlbum ? (
                    <CircularProgress size={20} />
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
          )}
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
        <div
          ref={headerRef}
          className={`flex sticky top-[76px] mb-5 z-20 items-center gap-3 text-neutral-400 font-semibold border-b border-neutral-700 px-7 p-1 transition-colors duration-300 ${
            isStuck ? `bg-neutral-800 shadow-lg` : `bg-transparent`
          }`}
        >
          <div className="text-center text-lg w-14">#</div>
          <div className="w-full text-sm">Title</div>
          <div className="w-2/12 text-center text-sm">Duration</div>
        </div>
        {!isPending && albumDetails?.songs?.length > 0 ? (
          <div className="px-5 pb-5">
            {albumDetails.songs.map((song, index) => (
              <div
                key={song?.id || index}
                className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
              >
                <div className="font-semibold w-14 h-10 flex items-center group-hover:invisible justify-center text-neutral-400 relative cursor-pointer">
                  {currentSong?.id === song?.id && isPlaying ? (
                    <img src={gif} className="w-6" alt="Playing" />
                  ) : (
                    <div>{index + 1}</div>
                  )}
                  {currentSong?.id === song?.id && isPlaying ? (
                    <IoPauseSharp
                      onClick={() => setIsPlaying(false)}
                      className="text-white text-xl absolute group-hover:visible invisible"
                    />
                  ) : (
                    <IoPlaySharp
                      onClick={() => handleSongClick(song)}
                      className="text-white text-xl absolute group-hover:visible invisible"
                    />
                  )}
                </div>
                <div className="flex items-center w-full">
                  <div>
                    {/* <img
                      src={song?.image?.[2]?.url || ""}
                      className="rounded w-10"
                      alt={song?.name || "Song"}
                      loading="lazy"
                    /> */}
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
          <div className="px-5 text-neutral-400">
            No songs available in this album.
          </div>
        )}
      </div>

      {artistDetails?.topAlbums?.length > 0 && (
        <div className="py-16 px-5">
          <h1 className="font-[800] text-neutral-100 text-2xl mb-3 px-3">
            More by {artistDetails?.name || "Artist"}
          </h1>
          <div className="grid grid-cols-6">
            {artistDetails.topAlbums.slice(0, 6).map((album) => (
              <Link to={`/album/${album?.id}`} key={album?.id || album?.name}>
                <div className="cursor-pointer transition-all hover:bg-neutral-700/60 p-3 rounded w-full flex flex-col items-center h-full">
                  <div>
                    {album?.image?.[2]?.url ? (
                      <img
                        src={album.image[2].url}
                        className="w-40 rounded-md mb-3"
                        alt={album?.name || "Album"}
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
                      {album?.name || "Unknown Album"}
                    </h1>
                    <p className="font-semibold text-neutral-400 line-clamp-2 w-40 text-sm">
                      {album?.year || "Unknown Year"} •{" "}
                      {capitalizeFirstLetter(album?.type || "")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumPage;
