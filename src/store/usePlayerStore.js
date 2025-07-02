import { create } from "zustand";

const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const usePlayerStore = create((set, get) => ({
  bgColor: "white",
  setBgColor: (opt) => set({ bgColor: opt }),
  isOpen: false,
  setIsOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  isBgOn: false,
  setIsBgOn: () => set((state) => ({ isBgOn: !state.isBgOn })),
  currentSong: null,
  currentIndex: 0,
  isPlaying: false,
  nextSongEnabled: false,
  prevSongEnabled: false,
  searchQuery: null,
  isLoading: false,
  canPlay: false,
  setCanPlay: (opt) => set({ canPlay: opt }),
  isQueueOpen: false,
  active: "",
  historyQueue: [],
  originalQueue: [],
  songsQueue: [],
  isRepeat: "false",
  isShuffle: false,

  libraryDetails: [],
  setLibraryDetails: (data) => set({ libraryDetails: data }),

  library: [],
  setLibrary: (data) => set({ library: data }),

  volume: 90,
  setVolume: (value) => set({ volume: value }),

  setActive: (state) => set({ active: state }),

  setSongsQueue: (songs) =>
    set({
      originalQueue: [...songs],
      songsQueue: [...songs],
      historyQueue: [],
      currentIndex: 0,
    }),

  songs: [],
  albums: [],
  albumDetails: [],
  setAlbumDetails: (data) => set({ albumDetails: data }),
  setAlbum: (data) => set({ album: data }),
  artists: [],
  playlists: [],
  single: [],
  setSingle: (data) => set({ single: data }),

  setRepeat: (option) => set({ isRepeat: option }),

  toggleShuffle: () => {
    const state = get();
    const isShuffle = !state.isShuffle;
    let newSongsQueue;
    if (isShuffle) {
      // When enabling shuffle
      if (state.currentSong) {
        const otherSongs = state.originalQueue.filter(
          (song) => song.id !== state.currentSong.id
        );
        newSongsQueue = [state.currentSong, ...shuffle(otherSongs)];
      } else {
        newSongsQueue = shuffle(state.originalQueue);
      }
    } else {
      // When disabling shuffle, revert to original queue
      newSongsQueue = state.originalQueue;
    }
    const newCurrentIndex = state.currentSong
      ? newSongsQueue.findIndex((song) => song.id === state.currentSong.id)
      : 0;
    set({
      isShuffle,
      songsQueue: newSongsQueue,
      currentIndex: newCurrentIndex,
    });
  },

  playlistDetails: [],
  artistDetails: [],
  artistSongs: [],
  artistAlbums: [],
  setArtistDetails: (data) => set({ artistDetails: data }),
  setPlaylistDetails: (data) => set({ playlistDetails: data }),
  setArtistSongs: (data) => set({ artistSongs: data }),
  setArtistAlbums: (data) => set({ artistAlbums: data }),

  setSongs: (data) => set({ songs: data }),
  setAlbums: (data) => set({ albums: data }),
  setArtists: (data) => set({ artists: data }),
  setPlaylists: (data) => set({ playlists: data }),
  setIsLoading: (option) => set({ isLoading: option }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setCurrentSong: (song) => {
    const state = get();
    const index = state.songsQueue.findIndex((s) => s.id === song.id);

    // If song exists in queue
    if (index >= 0) {
      set({
        currentSong: song,
        currentIndex: index,
        nextSongEnabled:
          index < state.songsQueue.length - 1 || state.isRepeat === "all",
        prevSongEnabled: state.historyQueue.length > 0,
        isPlaying: true,
      });
    } else {
      // Handle gracefully: either add to queue or log warning
      console.warn("setCurrentSong: Song not found in songsQueue", song);

      // Optional: add it to front of queue and play it
      const updatedQueue = [song, ...state.songsQueue];

      set({
        currentSong: song,
        currentIndex: 0,
        songsQueue: updatedQueue,
        originalQueue: [song, ...state.originalQueue], // optional
        nextSongEnabled: updatedQueue.length > 1 || state.isRepeat === "all",
        prevSongEnabled: state.historyQueue.length > 0,
        isPlaying: true,
      });
    }
  },

  setIsPlaying: (option) => set({ isPlaying: option }),
  setIsQueueOpen: (option) => set({ isQueueOpen: option }),
  toggleQueueOpen: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),

  // nextSong: () => {
  //   const state = get();
  //   console.log(state.historyQueue);

  //   if (!state.songsQueue.length) {
  //     console.log("nextSong: Queue is empty");
  //     return;
  //   }

  //   const currentSong = state.currentSong;

  //   const currentIndex = state.songsQueue.findIndex(
  //     (song) => song.id === currentSong?.id
  //   );

  //   if (currentIndex === -1) {
  //     console.log("nextSong: Current song not found in queue", currentIndex);
  //     return;
  //   }

  //   const nextIndex = currentIndex + 1;

  //   if (nextIndex >= state.songsQueue.length && state.isRepeat === "true") {
  //     const newSong = state.songsQueue[0];
  //     set({
  //       currentSong: newSong,
  //       historyQueue: [...state.historyQueue, currentSong],
  //       songsQueue: state.songsQueue,
  //       currentIndex: 0,
  //       isPlaying: true,
  //       nextSongEnabled: true,
  //       prevSongEnabled: true,
  //     });
  //     return;
  //   }

  //   if (nextIndex < state.songsQueue.length) {
  //     const nextSong = state.songsQueue[nextIndex];

  //     const updatedQueue = state.songsQueue.filter(
  //       (_, i) => i !== currentIndex
  //     );

  //     set({
  //       currentSong: nextSong,
  //       songsQueue: updatedQueue,
  //       historyQueue: [...state.historyQueue, currentSong],
  //       currentIndex: 0,
  //       isPlaying: true,
  //       nextSongEnabled: updatedQueue.length > 1 || state.isRepeat === "true",
  //       prevSongEnabled: true,
  //     });
  //   } else {
  //     set({
  //       isPlaying: false,
  //       nextSongEnabled: false,
  //       prevSongEnabled: state.historyQueue.length > 0,
  //     });
  //   }
  // },

  nextSong: () => {
    const state = get();
    console.log("History Queue:", state.historyQueue);

    if (!state.songsQueue.length) {
      console.log("nextSong: Queue is empty");
      return;
    }

    const currentSong = state.currentSong;
    const currentIndex = state.currentIndex;

    // Current song ko history me add karo
    const newHistoryQueue = currentSong
      ? [...state.historyQueue, currentSong]
      : state.historyQueue;

    // If repeat is enabled and we're at the end, go to beginning
    if (
      currentIndex >= state.songsQueue.length - 1 &&
      state.isRepeat === "true"
    ) {
      // Queue ko reset karo with original songs (excluding current)
      const newQueue = state.songsQueue.slice(1); // Remove first song (current one)
      const newSong = newQueue[0];

      set({
        currentSong: newSong,
        songsQueue: newQueue,
        historyQueue: newHistoryQueue,
        currentIndex: 0,
        isPlaying: true,
        nextSongEnabled: newQueue.length > 1 || state.isRepeat === "true",
        prevSongEnabled: true,
      });
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < state.songsQueue.length) {
      // Current song ko queue se remove karo
      const updatedQueue = state.songsQueue.filter(
        (_, index) => index !== currentIndex
      );
      const nextSong = updatedQueue[0]; // Next song ab first position me aa gaya

      set({
        currentSong: nextSong,
        songsQueue: updatedQueue,
        historyQueue: newHistoryQueue,
        currentIndex: 0, // Hamesha 0 because current song hamesha first position me hoga
        isPlaying: true,
        nextSongEnabled: updatedQueue.length > 1 || state.isRepeat === "true",
        prevSongEnabled: true,
      });
    } else {
      // End of queue and no repeat
      set({
        isPlaying: false,
        nextSongEnabled: false,
        prevSongEnabled: state.historyQueue.length > 0,
      });
    }
  },

  prevSong: () => {
    const state = get();
    console.log("History Queue:", state.historyQueue);
    console.log("Current Index:", state.currentIndex);

    // If there's history, play the last song from history
    if (state.historyQueue.length > 0) {
      const prevSong = state.historyQueue[state.historyQueue.length - 1];
      console.log("Playing from history:", prevSong);

      // Current song ko queue ke start me add karo
      let newSongsQueue = [...state.songsQueue];

      if (state.currentSong) {
        // Check karo ki current song already queue me hai ya nahi
        const currentSongExists = newSongsQueue.some(
          (song) => song.id === state.currentSong.id
        );

        if (!currentSongExists) {
          newSongsQueue = [state.currentSong, ...newSongsQueue];
        }
      }

      set({
        currentSong: prevSong,
        songsQueue: newSongsQueue,
        historyQueue: state.historyQueue.slice(0, -1), // Remove last item from history
        currentIndex: 0, // Previous song ab current ban gaya
        isPlaying: true,
        nextSongEnabled: newSongsQueue.length > 0,
        prevSongEnabled: state.historyQueue.length > 1, // Check if more history exists
      });
    }
    // If no history but repeat is "all" and we're at the beginning
    else if (state.isRepeat === "all" && state.songsQueue.length > 0) {
      // Original queue se last song lao
      const originalLastSong =
        state.originalQueue[state.originalQueue.length - 1];

      if (originalLastSong) {
        // Current song ko queue ke start me add karo
        const newSongsQueue = state.currentSong
          ? [state.currentSong, ...state.songsQueue]
          : [...state.songsQueue];

        set({
          currentSong: originalLastSong,
          songsQueue: newSongsQueue,
          currentIndex: 0,
          isPlaying: true,
          nextSongEnabled: true,
          prevSongEnabled: true,
        });
      }
    }
  },
}));
