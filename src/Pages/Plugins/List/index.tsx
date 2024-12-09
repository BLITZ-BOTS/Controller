import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ArrowUpRight, Link, Search } from "lucide-react";
import debounce from "lodash/debounce";

interface Plugin {
  name: string;
  description: string;
  authorId: string;
  tags: string[];
  homepage: string;
  repoUrl: string;
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
};

const Plugins = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch plugins function
  const fetchPlugins = async (url: string) => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch plugins");
      }
      const data = await response.json();
      setPlugins(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch function
  const debouncedFetchPlugins = useCallback(
    debounce((url: string) => {
      fetchPlugins(url);
    }, 300),
    [],
  );

  useEffect(() => {
    const url = searchQuery.trim() === ""
      ? "https://api.blitz-bots.com/plugins"
      : `https://api.blitz-bots.com/plugins/search?query=${searchQuery}`;

    debouncedFetchPlugins(url);
  }, [searchQuery]);

  return (
    <motion.div
      className="min-h-screen bg-black text-white pt-20"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-bold mb-4">BLITZ PLUGINS</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enhance your bot with powerful plugins from our community.
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#FF30A0] transition-colors"
            />
          </div>
        </div>

        {/* Plugin Grid */}
        {error && <div className="text-center text-red-400">{error}</div>}
        <AnimatePresence>
          {loading
            ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#FF30A0]/50 transition-all duration-300"
                  >
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={15} width="90%" className="mt-4" />
                    <Skeleton height={15} width="70%" className="mt-2" />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.from({ length: 3 }).map((__, idx) => (
                        <Skeleton
                          key={idx}
                          height={20}
                          width={50}
                          className="rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )
            : plugins.length > 0
            ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
              >
                {plugins.map((plugin) => (
                  <motion.div
                    key={plugin.name}
                    className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#FF30A0]/50 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold truncate">
                          {plugin.name}
                        </h3>
                        <a
                          href={plugin.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-2 rounded-lg bg-[#FF30A0]/10 text-[#FF30A0] hover:bg-[#FF30A0]/20 transition-colors"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">
                        {plugin.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {plugin.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400"
                          >
                            <span className="bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-transparent bg-clip-text">
                              #
                            </span>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => (window.location.href =
                          `/plugin/${plugin.name}`)}
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )
            : (
              <motion.div
                className="text-center text-gray-400"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                No plugins found. Try searching for something else!
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Plugins;
