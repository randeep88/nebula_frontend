import { usePlayerStore } from "../store/usePlayerStore";
import Slider from "@mui/material/Slider";
import { Volume1, Volume2, VolumeOff, Volume } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "../utils/formatDuration";
import { Repeat } from "lucide-react";
import { Shuffle } from "lucide-react";
import { Repeat1 } from "lucide-react";
import { MdPlayCircle } from "react-icons/md";
import { MdPauseCircle } from "react-icons/md";
import { BiSkipNext } from "react-icons/bi";
import { MdQueueMusic } from "react-icons/md";
import { BiSkipPrevious } from "react-icons/bi";
import useUser from "../hooks/useUser";

const Player = () => {
  const {
    currentSong,
    isPlaying,
    canPlay,
    setCanPlay,
    setIsPlaying,
    nextSong,
    prevSong,
    setIsLoading,
    isQueueOpen,
    toggleQueueOpen,
    isRepeat,
    toggleShuffle,
    setRepeat,
    isShuffle,
    setVolume,
    volume,
  } = usePlayerStore();
  const audioRef = useRef();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (audioRef.current && currentSong?.downloadUrl?.[4]?.url) {
      setIsLoading(true);
      setCanPlay(false);
      audioRef.current.load();
      setCurrentTime(0);
      setIsLoading(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current && currentSong && canPlay) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying, setIsPlaying, canPlay]);

  const handleRepeat = () => {
    if (isRepeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setCanPlay(true);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff className="text-neutral-400" />;
    if (volume > 0 && volume <= 30)
      return <Volume className="text-neutral-400" />;
    if (volume > 30 && volume <= 70)
      return <Volume1 className="text-neutral-400" />;
    return <Volume2 className="text-neutral-400" />;
  };

  const hasValidSong = currentSong && currentSong.downloadUrl?.[4]?.url;

  if (!hasValidSong) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black backdrop-blur-lg text-neutral-400 font-semibold">
        Play a song
      </div>
    );
  }

  return (
    <div className="w-full shadow-lg h-full flex items-center justify-between bg-black backdrop-blur-lg font-semibold select-none z-[9999]">
      {/* Audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={() => setCanPlay(true)}
        onEnded={handleRepeat}
      >
        <source src={currentSong.downloadUrl[4].url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Left side */}
      <div className="w-96 ps-4">
        <div className="flex items-center gap-3">
          <img
            src={currentSong.image[2].url}
            className="w-16 h-16 rounded-md"
            alt="Album art"
          />
          <div>
            <h1 className="text-neutral-200">{currentSong.name}</h1>
            <p className="text-neutral-400 text-sm">
              {currentSong.artists.primary[0].name}
            </p>
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col justify-center items-center w-2/5">
        <div className="flex items-center gap-3 justify-center">
          <div>
            {isShuffle ? (
              <div className="relative group flex items-center justify-center">
                <Shuffle
                  onClick={() => toggleShuffle()}
                  className="text-[#00CDAC] cursor-pointer transition-all active:scale-95 size-[17px]"
                />
                <div className="absolute bottom-8 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[7rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                  Disable shuffle
                </div>
              </div>
            ) : (
              <div className="relative group flex items-center justify-center">
                <Shuffle
                  onClick={() => toggleShuffle()}
                  className="text-neutral-400 cursor-pointer transition-all active:scale-95 size-[17px]"
                />
                <div className="absolute bottom-8 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[7rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                  Enable shuffle
                </div>
              </div>
            )}
          </div>
          <BiSkipPrevious
            className="text-4xl text-neutral-400 hover:text-white cursor-pointer transition-all active:scale-95"
            onClick={prevSong}
          />
          {isPlaying ? (
            <MdPauseCircle
              className="text-[42px] text-white active:scale-95 transition-all cursor-pointer"
              onClick={() => setIsPlaying(false)}
            />
          ) : (
            <MdPlayCircle
              className="text-[42px] text-white active:scale-95 transition-all cursor-pointer"
              onClick={() => setIsPlaying(true)}
            />
          )}
          <BiSkipNext
            className="text-4xl text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            onClick={nextSong}
          />
          <div>
            {isRepeat === "false" && (
              <div className="relative group flex items-center justify-center">
                <Repeat
                  onClick={() => setRepeat("true")}
                  className="text-neutral-400 cursor-pointer transition-all active:scale-95 size-[18px]"
                />
                <div className="absolute bottom-8 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[6.3rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                  Enable repeat
                </div>
              </div>
            )}
            {isRepeat === "true" && (
              <div className="relative group flex items-center justify-center">
                <Repeat
                  onClick={() => setRepeat("one")}
                  className="text-[#00CDAC] cursor-pointer transition-all active:scale-95 size-[18px]"
                />
                <div className="absolute bottom-8 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[8rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                  Enable repeat one
                </div>
              </div>
            )}
            {isRepeat === "one" && (
              <div className="relative group flex items-center justify-center">
                <Repeat1
                  onClick={() => setRepeat("false")}
                  className="text-[#00CDAC] cursor-pointer transition-all active:scale-95 size-[18px]"
                />
                <div className="absolute bottom-8 group-hover:visible delay-500 text-sm invisible text-neutral-100 w-[6.5rem] text-center bg-neutral-700 font-semibold p-1 rounded">
                  Disable repeat
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-7 flex items-center justify-center text-neutral-400 text-xs gap-3">
          <span>{formatDuration(currentTime)}</span>
          <Slider
            size="small"
            value={currentTime}
            max={duration || 1}
            onChange={(e, newValue) => {
              if (audioRef.current) {
                audioRef.current.currentTime = newValue;
                setCurrentTime(newValue);
              }
            }}
            aria-label="Progress"
            sx={{
              color: "#ddd",
              "& .MuiSlider-thumb": {
                opacity: 0,
                transition: "opacity 0.3s ease",
              },
              "&:hover .MuiSlider-thumb": {
                opacity: 1,
                color: "#00CDAC",
              },
              "& .MuiSlider-track": {
                height: 2,
                transition: "background-color 0.3s",
              },
              "&:hover .MuiSlider-track": {
                backgroundColor: "#00CDAC",
              },
              "& .MuiSlider-rail": {
                height: 2,
                opacity: 0.3,
              },
            }}
          />
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="w-96 flex items-center justify-end pe-6 gap-6">
        {isAuthenticated ? (
          <div className="relative group flex items-center justify-center">
            <MdQueueMusic
              onClick={() => toggleQueueOpen()}
              className={`${
                isQueueOpen
                  ? `text-[#00CDAC] cursor-pointer text-2xl transition-all active:scale-95`
                  : `text-neutral-400 transition-all text-2xl cursor-pointer active:scale-95`
              }`}
            />
            <div className="absolute bottom-8 group-hover:visible delay-1000 text-sm invisible text-neutral-100 w-[6.5rem] text-center bg-neutral-700 font-semibold p-1 rounded">
              Toggle queue
            </div>
          </div>
        ) : (
          <div className="group relative flex items-center justify-center">
            <MdQueueMusic className="text-neutral-400 transition-all text-2xl" />
            <div className="absolute bottom-8 group-hover:opacity-100 text-sm opacity-0 text-neutral-300 w-40 text-center transition-all">
              Login to access queue
            </div>
          </div>
        )}

        <div className="w-32 flex items-center gap-2">
          {getVolumeIcon()}
          <Slider
            valueLabelDisplay="auto"
            size="small"
            defaultValue={90}
            onChange={(e, newValue) => {
              setVolume(e.target.value);
              if (audioRef.current) {
                audioRef.current.volume = newValue / 100;
              }
            }}
            aria-label="Volume"
            sx={{
              color: "#999",
              "& .MuiSlider-thumb": {
                opacity: 0,
                transition: "opacity 0.3s ease",
              },
              "&:hover .MuiSlider-thumb": {
                opacity: 1,
                color: "#00CDAC",
              },
              "& .MuiSlider-track": {
                height: 2,
                transition: "background-color 0.3s",
              },
              "&:hover .MuiSlider-track": {
                backgroundColor: "#00CDAC",
              },
              "& .MuiSlider-rail": {
                height: 2,
                opacity: 0.3,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
