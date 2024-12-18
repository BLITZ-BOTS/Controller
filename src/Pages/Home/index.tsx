// Packages
import { useEffect, useState } from "react";

// Backend Functions
import { fetch_user_bots } from "../../Backend/API/Commands/File System/fetch_user_bots";

interface Bot {
  name: string;
  locationPath: string;
}

const Home = () => {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    const loadBots = async () => {
      try {
        const returnedBots = await fetch_user_bots();
        setBots(returnedBots);
      } catch (error) {
        console.error("Error fetching bots:", error);
      }
    };

    loadBots();
  }, []);

  return (
    <div className="mt-[200px]">
      <h1>User Bots</h1>
      {bots.length > 0
        ? (
          <ul>
            {bots.map((bot, index) => (
              <li key={index}>
                <strong>Name:</strong> {bot.name} <br />
                <strong>Path:</strong> {bot.locationPath}
              </li>
            ))}
          </ul>
        )
        : <p>No bots found.</p>}
    </div>
  );
};

export default Home;
