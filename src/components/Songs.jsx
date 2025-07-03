import { usePlayerStore } from "../store/usePlayerStore";
import { formatDuration } from "../utils/formatDuration";
import gif from "../assets/gif3.gif";
import { useSearchResults } from "../hooks/useSearchResults";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";
import { MdLibraryMusic } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

const Songs = () => {
  const {
    isPlaying,
    setIsPlaying,
    setCurrentSong,
    currentSong,
    setSongsQueue,
    searchQuery,
  } = usePlayerStore();

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setSongsQueue(songs);
    setIsPlaying(true);
  };

  const { data } = useSearchResults(searchQuery);

  const songs = data?.songs || [];

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

  if (songs?.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <MdLibraryMusic size={60} className="mb-4 text-neutral-500" />
        <h2 className="text-xl font-semibold">No songs found</h2>
        <p className="text-sm mt-2 text-center max-w-sm">
          We couldn't find any songs matching your search. Try a different song
          or keyword.
        </p>
      </div>
    );

  return (
    <div>
      <div ref={sentinelRef} className="h-[0px] w-full"></div>
      <div
        ref={headerRef}
        className={`flex sticky top-0 z-20 items-center gap-3 text-neutral-400 font-semibold border-b border-neutral-700 px-7 p-1 transition-colors duration-300 ${
          isStuck ? `bg-[#303030] shadow-lg` : `bg-transparent`
        }`}
      >
        <div className="text-center text-lg w-14">#</div>
        <div className="w-2/3 text-sm">Title</div>
        <div className="w-2/4 text-center text-sm">Album</div>
        <div className="w-2/12 text-center text-sm">Duration</div>
      </div>

      <div className="p-5">
        {songs?.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center rounded gap-3 p-2 hover:bg-neutral-700/60 bg-opacity-20 transition-all group"
          >
            <div className="font-semibold w-14 h-10 flex items-center group-hover:invisible justify-center text-neutral-400 relative cursor-pointer">
              {currentSong?.id === song?.id && isPlaying ? (
                <div>
                  <img src={gif} className="w-6" />
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
                  onClick={() => handlePlaySong(song)}
                />
              )}
            </div>
            <div className="flex items-center gap-3 w-2/3 ">
              <div>
                <img src={song.image[2].url} className="rounded w-10" />
              </div>
              <div>
                <h1 className="text-neutral-100 font-semibold truncate line-clamp-1 w-96 overflow-hidden">
                  {song.name}
                </h1>
                <p className="text-neutral-400 group-hover:text-neutral-100 text-sm line-clamp-1 w-96 font-semibold truncate overflow-hidden">
                  {song.artists.primary[0].name}
                </p>
              </div>
            </div>
            <div className="w-2/4 group-hover:text-neutral-100 text-center text-sm line-clamp-1 text-neutral-400 font-semibold truncate overflow-hidden">
              {song.album.name}
            </div>
            <div className="w-2/12 group-hover:text-neutral-100 text-center text-sm line-clamp-1 text-neutral-400 font-semibold ">
              {formatDuration(song.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
