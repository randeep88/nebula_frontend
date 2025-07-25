import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Skeleton, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCirclePlay,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import gif from "../assets/gif3.gif";
import { formatDuration } from "../utils/formatDuration";
import "../App.css";
import ColorThief from "colorthief";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useArtistData } from "../hooks/useArtistData";
import { useLibrary } from "../hooks/useLibrary";
import { MdPlayCircle } from "react-icons/md";
import { MdPauseCircle } from "react-icons/md";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";

const ArtistPage = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const {
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    setSongsQueue,
  } = usePlayerStore();

  const { data: artistDetails, isPending } = useArtistData(artistId);
  const { libraryItems } = useLibrary();

  const [seeMoreSongs, setSeeMoreSongs] = useState(false);

  const [gradientColor, setGradientColor] = useState("#070608");
  const imgRef = useRef(null);

  useEffect(() => {
    if (!artistDetails?.image?.[2]?.url || !imgRef.current) return;

    const colorThief = new ColorThief();
    const img = imgRef.current;

    img.crossOrigin = "Anonymous";
    const handleImageLoad = () => {
      try {
        const dominantColor = colorThief.getColor(img);
        setGradientColor(`rgb(${dominantColor.join(",")})`);
      } catch (error) {
        console.error("Error extracting color:", error);
        setGradientColor("#1e3264");
      }
    };

    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener("load", handleImageLoad);
      return () => img.removeEventListener("load", handleImageLoad);
    }
  }, [artistDetails?.image]);

  const isSongInAlbum = artistDetails?.topSongs?.some(
    (song) => song?.id === currentSong?.id
  );
  const token = localStorage.getItem("token");

  const addArtist = async (artistId) => {
    if (!token) throw new Error("No token found");
    const res = await axios.post(
      "https://nebula-music-player-3.onrender.com/library/artist/add",
      { artistId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  const removeArtist = async (artistId) => {
    if (!token) throw new Error("No token found");
    const res = await axios.delete(
      "https://nebula-music-player-3.onrender.com/library/artist/remove",
      {
        data: { artistId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  };

  const queryClient = useQueryClient();

  const { mutate: addArtistMutate, isPending: isAddingArtist } = useMutation({
    mutationFn: addArtist,
    onMutate: async (artistId) => {
      await queryClient.cancelQueries({ queryKey: ["libraryArtists"] });
      const previousArtists = queryClient.getQueryData(["libraryArtists"]);
      queryClient.setQueryData(["libraryArtists"], (old) => [
        ...(old || []),
        { type: "artist", id: artistId, success: true, ...artistDetails },
      ]);
      return { previousArtists };
    },
    onError: (error, artistId, context) => {
      queryClient.setQueryData(["libraryArtists"], context.previousArtists);
      toast.error("Failed to add artist to library", {
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
      queryClient.invalidateQueries({ queryKey: ["libraryArtists"] });
    },
    onSuccess: (data) => {
      toast.success("Artist added to your library", {
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

  const { mutate: removeArtistMutate, isPending: isRemovingArtist } =
    useMutation({
      mutationFn: removeArtist,
      onMutate: async (artistId) => {
        await queryClient.cancelQueries({ queryKey: ["libraryArtists"] });
        const previousArtists = queryClient.getQueryData(["libraryArtists"]);
        queryClient.setQueryData(["libraryArtists"], (old) =>
          (old || []).filter((a) => a.id !== artistId)
        );
        return { previousArtists };
      },
      onError: (error, context) => {
        queryClient.setQueryData(["libraryArtists"], context.previousArtists);
        toast.error("Failed to remove artist from library", {
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
        queryClient.invalidateQueries({ queryKey: ["libraryArtists"] });
      },
      onSuccess: (data) => {
        toast.success("Artist removed from your library", {
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
    (entry) => entry.type === "artist" && entry.success && entry.id === artistId
  );

  const handleAddToLibrary = () => {
    addArtistMutate(artistId);
  };

  const handleRemove = () => {
    removeArtistMutate(artistId);
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
    <div className="relative w-full bg-neutral-800/60 backdrop-blur-lg overflow-auto hide-scrollbar-buttons scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent select-none">
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
        className="flex items-center gap-5 w-full p-5"
        style={{
          background: `linear-gradient(to bottom, ${gradientColor}, #26262699)`,
          minHeight: "300px",
        }}
      >
        <div>
          {artistDetails?.image?.[2]?.url ? (
            <img
              ref={imgRef}
              src={artistDetails?.image[2]?.url}
              className="w-52 rounded-full"
              alt={artistDetails.name || "Artist"}
              loading="lazy"
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
        {!isPending ? (
          <div className="space-y-2">
            {artistDetails?.isVerified ? (
              <div className="flex items-center gap-2">
                <VerifiedIcon className="text-blue-400" />
                <p className="text-neutral-100 font-semibold">
                  Verified Artist
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-neutral-100 font-semibold">
                  {capitalizeFirstLetter(artistDetails?.type || "")}
                </h1>
              </div>
            )}
            <h1 className="text-neutral-100 text-8xl font-[900]">
              {artistDetails?.name}
            </h1>
            <p className="text-neutral-100 font-semibold">
              {artistDetails?.followerCount} followers
            </p>
          </div>
        ) : (
          <div className="w-[600px]">
            <Skeleton
              animation="wave"
              height={30}
              width={200}
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
              height={90}
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
              height={30}
              width={200}
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
        )}
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
                icon={faCirclePlay}
                className="text-6xl text-[#00CDAC] cursor-pointer transition-all active:scale-95"
                onClick={() => {
                  if (artistDetails.topSongs.length === 0)
                    return toast.error("No songs available in this artist", {
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
                  setSongsQueue(artistDetails.topSongs);
                  setCurrentSong(artistDetails.topSongs[0]);
                  setIsPlaying(true);
                }}
              />
            )}
          </div>
          {isStuck ? (
            <p className="text-white transition-all font-bold text-3xl -ms-2">
              {artistDetails?.name}
            </p>
          ) : (
            <div className="flex items-center justify-center">
              {!isExist ? (
                <button onClick={handleAddToLibrary} disabled={isAddingArtist}>
                  {isAddingArtist ? (
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
                <button onClick={handleRemove} disabled={isRemovingArtist}>
                  {isRemovingArtist ? (
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

      {/* songs */}
      <div>
        {!isPending ? (
          <h1 className="font-[800] text-neutral-100 text-2xl mb-3 px-5">
            Top Songs
          </h1>
        ) : (
          <Skeleton
            animation="wave"
            height={30}
            width={200}
            className="rounded mx-5"
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
          <div>
            {seeMoreSongs ? (
              <div>
                <div className="px-5 mb-3">
                  {artistDetails?.topSongs?.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
                    >
                      <div className="font-semibold w-14 h-10 flex items-center group-hover:invisible justify-center text-neutral-400 relative cursor-pointer">
                        {currentSong?.id === song?.id && isPlaying ? (
                          <div>
                            <img src={gif} className="w-6" alt="Playing" />
                          </div>
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
                      <div className="flex items-center gap-3 w-2/3">
                        <div>
                          <img
                            src={song.image[2].url}
                            className="rounded w-10"
                            alt={song.name || "Song"}
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h1 className="text-neutral-100 font-semibold truncate overflow-hidden line-clamp-1 w-96">
                            {song.name}
                          </h1>
                          <p className="text-neutral-400 group-hover:text-neutral-100 text-sm font-semibold line-clamp-1 w-96 truncate overflow-hidden">
                            {song.artists.primary[0].name}
                          </p>
                        </div>
                      </div>
                      <div className="w-2/4 group-hover:text-neutral-100 text-center text-sm text-neutral-400 font-semibold truncate overflow-hidden">
                        {song.album.name}
                      </div>
                      <div className="w-2/12 group-hover:text-neutral-100 text-center text-sm text-neutral-400 font-semibold">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  ))}
                </div>
                <span
                  onClick={() => setSeeMoreSongs(false)}
                  className="font-bold text-neutral-400 hover:text-white transition-all ps-10"
                >
                  See less
                </span>
              </div>
            ) : (
              <div>
                <div className="px-5 mb-3">
                  {artistDetails?.topSongs?.slice(0, 5).map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
                    >
                      <div className="font-semibold w-14 h-10 flex items-center group-hover:invisible justify-center text-neutral-400 relative cursor-pointer">
                        {currentSong?.id === song?.id && isPlaying ? (
                          <div>
                            <img src={gif} className="w-6" alt="Playing" />
                          </div>
                        ) : (
                          <div>{index + 1}</div>
                        )}
                        {currentSong?.id === song?.id && isPlaying ? (
                          <IoPauseSharp
                            className="text-white text-lg absolute group-hover:visible invisible"
                            onClick={() => setIsPlaying(false)}
                          />
                        ) : (
                          <IoPlaySharp
                            className="text-white text-lg absolute group-hover:visible invisible"
                            onClick={() => {
                              setCurrentSong(song);
                              setIsPlaying(true);
                            }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 w-2/3">
                        <div>
                          <img
                            src={song.image[2].url}
                            className="rounded w-10"
                            alt={song.name || "Song"}
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h1 className="text-neutral-100 font-semibold truncate overflow-hidden line-clamp-1 w-96">
                            {song.name}
                          </h1>
                          <p className="text-neutral-400 group-hover:text-neutral-100 text-sm font-semibold truncate line-clamp-1 w-96 overflow-hidden">
                            {song.artists.primary[0].name}
                          </p>
                        </div>
                      </div>
                      <div className="w-2/4 group-hover:text-neutral-100 text-center text-sm text-neutral-400 font-semibold truncate overflow-hidden">
                        {song.album.name}
                      </div>
                      <div className="w-2/12 group-hover:text-neutral-100 text-center text-sm text-neutral-400 font-semibold">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  ))}
                </div>
                {artistDetails.topSongs.length > 5 && (
                  <span
                    onClick={() => setSeeMoreSongs(true)}
                    className="font-bold text-neutral-400 hover:text-white transition-all ps-10"
                  >
                    See more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>

      {/* albums */}
      {artistDetails?.topAlbums.length > 0 && (
        <div className="mt-10 px-5">
          <div className="flex items-center justify-between">
            <h1 className="font-[800] text-neutral-100 text-2xl mb-3 px-3">
              Top Albums
            </h1>
            <span
              onClick={() => navigate("top-albums")}
              className="font-bold text-neutral-400 hover:text-white hover:underline transition-all"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-6">
            {artistDetails?.topAlbums?.slice(0, 6).map((album, index) => (
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
      )}

      {/* singles */}
      {artistDetails?.singles.length > 0 && (
        <div className="my-10 px-5">
          <div className="flex items-center justify-between">
            <h1 className="font-[800] text-neutral-100 text-2xl mb-3 px-3">
              Singles
            </h1>
            <span
              onClick={() => navigate("singles")}
              className="font-bold text-neutral-400 hover:text-white hover:underline transition-all"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-6">
            {artistDetails?.singles?.slice(0, 6).map((album, index) => (
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
      )}
    </div>
  );
};

export default ArtistPage;
