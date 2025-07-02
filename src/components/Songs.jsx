import { usePlayerStore } from "../store/usePlayerStore";
import { formatDuration } from "../utils/formatDuration";
import gif from "../assets/gif3.gif";
import { useSearchResults } from "../hooks/useSearchResults";
import { IoPlaySharp } from "react-icons/io5";
import { IoPauseSharp } from "react-icons/io5";

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

  return (
    <div className="bg-neutral-800/60 backdrop-blur-lg">
      <div className="flex items-center gap-3 text-neutral-400 font-semibold border-b border-neutral-700 mx-5 p-2">
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
