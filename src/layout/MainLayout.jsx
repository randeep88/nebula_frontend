import { Outlet, useNavigate } from "react-router-dom";
import Player from "../components/Player";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { usePlayerStore } from "../store/usePlayerStore";
import { useEffect } from "react";
import LiquidChrome from "../../src/Backgrounds/LiquidChrome/LiquidChrome";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo5.png";

const MainLayout = () => {
  const { searchQuery, currentSong, isBgOn, bgColor } = usePlayerStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (searchQuery) {
      navigate("/search");
    }
  }, [searchQuery]);

  const hasValidSong = currentSong && currentSong.downloadUrl?.[4]?.url;

  return (
    <div className="relative flex flex-col h-screen w-full bg-black overflow-hidden">
      {isBgOn && (
        <div className="absolute inset-0 opacity-30 h-full">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {bgColor === "red" && (
              <LiquidChrome
                baseColor={[0.3, 0.1, 0.1]}
                speed={0.08}
                amplitude={0.6}
                interactive={false}
              />
            )}
            {bgColor === "green" && (
              <LiquidChrome
                baseColor={[0.1, 0.3, 0.1]}
                speed={0.08}
                amplitude={0.6}
                interactive={false}
              />
            )}
            {bgColor === "blue" && (
              <LiquidChrome
                baseColor={[0.1, 0.1, 0.3]}
                speed={0.08}
                amplitude={0.6}
                interactive={false}
              />
            )}
            {bgColor === "white" && (
              <LiquidChrome
                baseColor={[0.1, 0.1, 0.1]}
                speed={0.08}
                amplitude={0.6}
                interactive={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 w-full z-[999]">
        <Header />
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-2 w-full overflow-auto z-50 mb-2 h-full">
        <div className="w-[350px] text-neutral-200 overflow-hidden rounded-lg">
          <Sidebar />
        </div>
        <div className="flex-1 flex rounded-lg overflow-hidden w-2/3">
          {!isHomePage ? (
            <Outlet />
          ) : (
            <div className="flex select-none items-center justify-center w-full text-lg h-full text-white bg-neutral-800/60 backdrop-blur-lg">
              <div className="text-center text-white space-y-4">
                <div className="flex flex-col items-center justify-center w-full mb-10">
                  <img src={logo} className="w-20" alt="" />
                  <h2 className="text-4xl logoFont text-center select-none font-extrabold text-white">
                    Welcome to Nebula
                  </h2>
                </div>
                <p className="text-lg">
                  Start exploring by searching for your favorite songs, artists,
                  albums, or playlists.
                </p>
                <p className="text-sm text-neutral-400">
                  Try: "Arijit Singh", "Moosewala", or "Workout Playlist"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      {hasValidSong && (
        <div className="h-20 w-full bg-gray-800 z-50">
          <Player />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
