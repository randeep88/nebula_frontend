import { useState } from "react";
import { Button, Skeleton } from "@mui/material";
import "../App.css";
import { Link, Outlet } from "react-router-dom";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { usePlayerStore } from "../store/usePlayerStore";
import { useSearchResults } from "../hooks/useSearchResults";

const categories = ["all", "songs", "artists", "albums", "playlists"];

const HomeLayout = () => {
  const [active, setActive] = useState("all");

  const { searchQuery } = usePlayerStore();
  const { isPending } = useSearchResults(searchQuery);

  return (
    <div className="w-full h-full select-none overflow-auto scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent">
      <div className="flex sticky bg-neutral-800/60 backdrop-blur-lg z-20 top-0 ps-5 py-3 overflow-x-auto">
        {!isPending ? (
          <div className="space-x-3">
            {categories.map((category) => (
              <Link
                to={`${category === "all" ? `/search` : category}`}
                key={category}
              >
                <Button
                  key={category}
                  onClick={() => setActive(category)}
                  variant="text"
                  sx={{
                    borderRadius: "9999px",
                    textTransform: "none",
                    fontSize: "13px",
                    minWidth: "unset",
                    paddingX: 1.5,
                    paddingY: 0.5,
                    color: active === category ? "black" : "#f5f5f5",
                    backgroundColor: active === category ? "white" : "#303030",
                    borderColor: "transparent",
                    "&:hover": {
                      backgroundColor:
                        active === category ? "white" : "#3a3a3a",
                      borderColor: "transparent",
                    },
                  }}
                >
                  {capitalizeFirstLetter(category)}
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  className="rounded-3xl"
                  width={60}
                  height={30}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    "&::after": {
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                    },
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
