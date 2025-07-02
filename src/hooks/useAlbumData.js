import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useAlbumData = (albumId) => {
  return useQuery({
    queryKey: ["albums-details", albumId],
    queryFn: async () => {
      const res = await api.get(`/albums?id=${albumId}`);
      const albumDetails = res.data.data;
      return albumDetails;
    },
  });
};
