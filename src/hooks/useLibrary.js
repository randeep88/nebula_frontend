import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import axios from "axios";
import { useMemo } from "react";

export const useLibrary = () => {
  const token = localStorage.getItem("token");

  // ========== Artist IDs and Details ==========
  const {
    data: artistDetails,
    isPending: isArtistDetailsLoading,
    isError: isArtistDetailsError,
    refetch: refetchArtists,
  } = useQuery({
    queryKey: ["libraryArtists"],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await axios.get(
        "https://nebula-music-player-3.onrender.com/library/artist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const artistIds = res.data || [];
      const results = await Promise.allSettled(
        artistIds.map(async (artist) => {
          const res = await api.get(`/artists/${artist.artistId}`);
          return {
            type: "artist",
            success: true,
            id: artist.artistId,
            ...res.data,
          };
        })
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
    },
  });

  // ========== Playlist IDs and Details ==========
  const {
    data: playlistDetails,
    isPending: isPlaylistDetailLoading,
    isError: isPlaylistDetailError,
    refetch: refetchPlaylists,
  } = useQuery({
    queryKey: ["libraryPlaylists"],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await axios.get(
        "https://nebula-music-player-3.onrender.com/library/playlist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const playlistIds = (res.data || []).map((p) => ({
        type: "playlist",
        ...p,
      }));
      const results = await Promise.allSettled(
        playlistIds.map(async (playlist) => {
          const res = await api.get(`/playlists?id=${playlist.playlistId}`);
          return {
            type: "playlist",
            success: true,
            id: playlist.playlistId,
            ...res.data,
          };
        })
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
    },
  });

  // ========== Album IDs and Details ==========
  const {
    data: albumDetails,
    isPending: isAlbumDetailLoading,
    isError: isAlbumDetailError,
    refetch: refetchAlbums,
  } = useQuery({
    queryKey: ["libraryAlbums"],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await axios.get(
        "https://nebula-music-player-3.onrender.com/library/album",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const albumIds = (res.data || []).map((a) => ({ type: "album", ...a }));
      const results = await Promise.allSettled(
        albumIds.map(async (album) => {
          const res = await api.get(`/albums?id=${album.albumId}`);
          return {
            type: "album",
            success: true,
            id: album.albumId,
            ...res.data,
          };
        })
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
    },
  });

  // ========== Combine All ==========
  const libraryItems = useMemo(() => {
    return [
      ...(artistDetails || []),
      ...(albumDetails || []),
      ...(playlistDetails || []),
    ];
  }, [artistDetails, playlistDetails, albumDetails]);

  // ========== Unified Loading/Error ==========
  const isLoading =
    isArtistDetailsLoading || isPlaylistDetailLoading || isAlbumDetailLoading;

  const isError =
    isArtistDetailsError || isPlaylistDetailError || isAlbumDetailError;

  // ========== Unified Refetch ==========
  const refetch = async () => {
    await Promise.all([refetchArtists(), refetchPlaylists(), refetchAlbums()]);
  };

  return {
    libraryItems,
    isLoading,
    isError,
    refetch,
  };
};
