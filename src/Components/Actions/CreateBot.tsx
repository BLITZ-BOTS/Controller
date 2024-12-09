import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { BaseDirectory, exists, mkdir } from "@tauri-apps/plugin-fs";
import { appDataDir, homeDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";

interface CreateBotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBotCreated: () => void; // Callback to notify parent when a bot is created
}

export default function CreateBot(
  { isOpen, onClose, onBotCreated }: CreateBotDialogProps,
) {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("https://discord.com/api/v10/users/@me", {
        method: "GET",
        headers: { Authorization: `Bot ${token}` },
      });
      if (!response.ok) throw new Error("Invalid token");
      return true;
    } catch {
      return false;
    }
  };

  const isFormValid = name.trim() !== "" && token.trim() !== "" && !error;

  useEffect(() => {
    if (token) {
      validateToken(token).then((isValid) => {
        setError(
          isValid
            ? null
            : "Invalid Discord bot token. Please enter a valid token.",
        );
      });
    } else {
      setError(null);
    }
  }, [token]);

  const handleConfirm = async () => {
    if (isFormValid) {
      try {
        const dataDirPath = await appDataDir();
        const botsPath = `${dataDirPath}/bots`;

        const folderExists = await exists("bots", {
          baseDir: BaseDirectory.AppData,
        });
        if (!folderExists) {
          await mkdir("bots", {
            baseDir: BaseDirectory.AppData,
            recursive: true,
          });
        }

        await invoke("create_bot", {
          file: `${await homeDir()}/.deno/bin/blitz.cmd`,
          token,
          path: `${botsPath}/${name}`,
        });

        setName(""); // Clear the bot name input
        setToken(""); // Clear the bot token input
        onBotCreated(); // Notify parent about the new bot
        onClose(); // Close the modal
      } catch (err) {
        console.error("Error creating bot:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed mt-[30px] inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Create Bot</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="bot-name" className="block text-sm font-medium mb-2">
            Bot Name
          </label>
          <input
            id="bot-name"
            type="text"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter bot name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bot-token" className="block text-sm font-medium mb-2">
            Token
          </label>
          <input
            id="bot-token"
            type="text"
            value={token}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter bot token"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg ${
              isFormValid
                ? "bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-white hover:opacity-90"
                : "bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-white opacity-35 cursor-not-allowed"
            }`}
          >
            Create Bot
          </button>
        </div>
      </div>
    </div>
  );
}
