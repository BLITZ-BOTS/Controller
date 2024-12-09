import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Notification from "../../Components/Notification";

interface ConfigData {
  config: { [key: string]: any };
}

export function Config() {
  const navigate = useNavigate();
  const { bot, plugin } = useParams();
  const [pluginData, setPluginData] = useState<any | null>(null);
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [authorData, setAuthorData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [newItem, setNewItem] = useState<string>("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "loading" | "success" | "error" | null;
  }>({ message: "", type: null });

  useEffect(() => {
    const fetchPluginData = async () => {
      try {
        const response = await fetch(
          `https://api.blitz-bots.com/plugins/get/${plugin}`,
        );
        const data = await response.json();

        if (data && data.data) {
          setPluginData(data.data);
          setAuthorData(data.data.author);
        } else {
          setError("Plugin data not found.");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError("Failed to fetch plugin data from API: " + err.message);
        }
      }
    };

    const fetchConfigData = async () => {
      try {
        setLoading(true);
        setError(null);

        const configPath =
          `${await appDataDir()}/bots/${bot}/plugins/${plugin}/blitz.config.yaml`;
        const response = await invoke("get_plugin_config", {
          path: configPath,
        }) as ConfigData;
        setConfigData(response);

        const initialFormData = response.config || {};
        setFormData(initialFormData);
      } catch (err) {
        if (err instanceof Error) {
          setError("Failed to fetch plugin config from Tauri: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPluginData();
    fetchConfigData();
  }, [plugin, bot]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputBlur = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const { value } = e.target;
    try {
      setNotification({ message: "Updating...", type: "loading" });

      const configPath =
        `${await appDataDir()}/bots/${bot}/plugins/${plugin}/blitz.config.yaml`;

      await invoke("set_config_value", {
        path: configPath,
        key: key,
        value: value,
      });

      setNotification({ message: "Updated successfully!", type: "success" });

      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setNotification({
          message: `Failed to update: ${err.message}`,
          type: "error",
        });
      }
      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    }
  };

  const handleAddArrayItem = async (key: string) => {
    try {
      if (!newItem.trim()) {
        setError("Please enter a valid item.");
        return;
      }

      const configPath =
        `${await appDataDir()}/bots/${bot}/plugins/${plugin}/blitz.config.yaml`;

      setNotification({ message: "Adding item...", type: "loading" });

      await invoke("add_config_value", {
        path: configPath,
        parent: key,
        item: newItem,
      });

      setFormData((prevState: any) => ({
        ...prevState,
        [key]: [...prevState[key], newItem],
      }));

      setNotification({ message: "Item added successfully!", type: "success" });

      setNewItem("");

      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setNotification({
          message: `Failed to add array item: ${err.message}`,
          type: "error",
        });
      }

      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    }
  };

  const handleRemoveArrayItem = async (key: string, index: number) => {
    try {
      const configPath =
        `${await appDataDir()}/bots/${bot}/plugins/${plugin}/blitz.config.yaml`;
      const itemToRemove = formData[key][index];

      setNotification({ message: "Removing item...", type: "loading" });

      await invoke("remove_config_value", {
        path: configPath,
        parent: key,
        item: itemToRemove,
      });

      const updatedArray = [...formData[key]];
      updatedArray.splice(index, 1);
      setFormData((prevState: any) => ({
        ...prevState,
        [key]: updatedArray,
      }));

      setNotification({
        message: "Item removed successfully!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setNotification({
          message: `Failed to remove array item: ${err.message}`,
          type: "error",
        });
      }

      setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-[100px]">
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition duration-300 ease-in-out mb-6"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span>Back</span>
      </motion.button>

      <motion.div
        className="bg-blitz-pink/10 border-blitz-pink/60 border p-6 rounded-lg shadow-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading
          ? <Skeleton count={3} />
          : error
          ? <p className="text-red-500">{error}</p>
          : pluginData
          ? (
            <div className="flex items-center justify-between space-x-6">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {pluginData.name}@{pluginData.versions[0]}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {pluginData.description}
                  </p>
                </div>
                {authorData && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={authorData.avatar_url}
                      alt={authorData.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="text-sm text-white">{authorData.username}</p>
                  </div>
                )}
              </div>
            </div>
          )
          : null}
      </motion.div>

      {configData && configData.config && (
        <div className="bg-white/5 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Config Values
          </h2>
          <form>
            {Object.entries(configData.config).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm text-white mb-2" htmlFor={key}>
                  {key}
                </label>
                {Array.isArray(value)
                  ? (
                    <div>
                      {formData[key]?.map((item: string, index: number) => (
                        <div
                          key={`${key}-${index}`}
                          className="flex items-center mb-2"
                        >
                          <input
                            type="text"
                            disabled={true}
                            name={`${key}-${index}`}
                            value={item}
                            onChange={(e) => {
                              const updatedArray = [...formData[key]];
                              updatedArray[index] = e.target.value;
                              setFormData((prevState: any) => ({
                                ...prevState,
                                [key]: updatedArray,
                              }));
                            }}
                            className="w-full p-2 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF30A0]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem(key, index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-[15px]" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newItem}
                          onChange={(e) =>
                            setNewItem(e.target.value)}
                          className="w-full p-2 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF30A0]"
                          placeholder="Enter new item"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleAddArrayItem(key)}
                          className="ml-2 text-[#FF30A0]/70 hover:text-[#FF30A0]"
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                  )
                  : (
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      onBlur={(e) => handleInputBlur(e, key)}
                      className="w-full p-2 text-white bg-white/5 border border-white/10 focus:border-[#FF30A0] rounded-lg focus:outline-none"
                    />
                  )}
              </div>
            ))}
          </form>
        </div>
      )}

      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type!}
        />
      )}
    </div>
  );
}
