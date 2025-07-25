import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import AlbumPage from "./pages/AlbumPage";
import HomeLayout from "./layout/HomeLayout";
import ArtistPage from "./pages/ArtistPage";
import PlaylistPage from "./pages/PlaylistPage";
import All from "./components/All";
import Artist from "./components/Artist";
import Songs from "./components/Songs";
import Album from "./components/Album";
import Playlist from "./components/Playlist";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import TopAlbums from "./pages/TopAlbums";
import Singles from "./pages/Singles";
import OTPPage from "./pages/OTPPage.jsx";
import OTPForRegister from "./pages/OTPForRegister.jsx";

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  });

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route path="/search" element={<HomeLayout />}>
                <Route index element={<All />} />
                <Route path="songs" element={<Songs />} />
                <Route path="artists" element={<Artist />} />
                <Route path="albums" element={<Album />} />
                <Route path="playlists" element={<Playlist />} />
              </Route>
              <Route path="/artist/:artistId" element={<ArtistPage />} />
              <Route
                path="/artist/:artistId/top-albums"
                element={<TopAlbums />}
              />
              <Route path="/artist/:artistId/singles" element={<Singles />} />

              <Route path="/album/:albumId" element={<AlbumPage />} />
              <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            </Route>
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/otp-register" element={<OTPForRegister />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              zIndex: 999999,
            },
          }}
        />
      </QueryClientProvider>
    </div>
  );
};

export default App;
