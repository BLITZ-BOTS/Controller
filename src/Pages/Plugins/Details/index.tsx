import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface PluginDetailsData {
  name: string;
  version: string;
  description: string;
  author: {
    username: string;
    avatar_url: string;
  };
  versions: [string];
}

type Tab = "overview" | "versions";

export default function PluginDetails() {
  const { name, version } = useParams<{ name: string; version: string }>();
  const [plugin, setPlugin] = useState<PluginDetailsData | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (!name) return;

    const fetchPluginDetails = async () => {
      setLoading(true);
      try {
        const url = version
          ? `https://api.blitz-bots.com/plugins/get/${name}/${version}`
          : `https://api.blitz-bots.com/plugins/get/${name}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch plugin details");
        const data = await response.json();
        setPlugin(data?.data);

        const readmeUrl = version
          ? `https://raw.githubusercontent.com/BLITZ-BOTS-REGISTRY/${name}/refs/heads/${version}/README.md`
          : `https://raw.githubusercontent.com/BLITZ-BOTS-REGISTRY/${name}/refs/heads/${
            data.data.versions[0]
          }/README.md`;

        const readmeResponse = await fetch(readmeUrl);

        const readmeText = readmeResponse.ok
          ? await readmeResponse.text()
          : "No Read Me Found";
        setReadme(readmeText);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPluginDetails();
  }, [name]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return; // If it's the current tab, do nothing
    setLoadingTab(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoadingTab(false);
    }, 300); // Animation duration
  };

  const copyCommand = () => {
    if (!plugin) return;
    const command = version
      ? `blitz install ${plugin.name.toLowerCase()}@${version}`
      : `blitz install ${plugin.name.toLowerCase()}`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-4xl w-full px-4">
          <Skeleton height={40} width="60%" className="mb-4" />
          <Skeleton height={20} width="80%" className="mb-2" />
          <div className="flex items-center space-x-3 mt-4">
            <Skeleton circle height={40} width={40} />
            <Skeleton height={20} width="30%" />
          </div>
          <div className="mt-6">
            <Skeleton height={30} width="20%" className="mb-4" />
            <Skeleton height={150} className="mb-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return window.location.href = "/";
  }

  if (!plugin) {
    return window.location.href = "/";
  }

  const versionsArray = plugin?.versions.map((v) => v) || [];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {plugin.name}
            <span className="ml-2 text-lg bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-transparent bg-clip-text">
              @{String(version ?? plugin.versions[0])}
            </span>
          </h1>
          <p className="text-gray-400">{plugin.description}</p>
          <div className="flex items-center space-x-3 mt-4">
            <img
              src={plugin.author.avatar_url}
              alt={plugin.author.username}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-gray-300">{plugin.author.username}</span>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          {["overview", "versions"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as Tab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab
                  ? "bg-[#FF30A0]/20 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loadingTab
          ? (
            <div className="animate-pulse">
              <Skeleton height={150} />
            </div>
          )
          : (
            <div>
              {activeTab === "overview" && (
                <div>
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Installation</h2>
                    <div className="relative">
                      <SyntaxHighlighter
                        language="bash"
                        style={atomDark}
                        customStyle={{
                          background: "rgba(255, 255, 255, 0.05)",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                        } as React.CSSProperties}
                      >
                        {version
                          ? `blitz install ${plugin.name.toLowerCase()}@${version}`
                          : `blitz install ${plugin.name.toLowerCase()}`}
                      </SyntaxHighlighter>
                      <button
                        onClick={copyCommand}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10"
                        aria-label="Copy command"
                      >
                        {copied
                          ? <Check className="h-4 w-4 text-green-500" />
                          : <Copy className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert prose-headings:text-white prose-a:text-[#FF30A0] prose-strong:text-white prose-code:bg-[#1e1e1e] prose-code:text-[#ff30a0] prose-pre:bg-transparent max-w-none"
                  >
                    {readme || "No Read Me Found"}
                  </ReactMarkdown>
                </div>
              )}

              {activeTab === "versions" && (
                <div className="space-y-6">
                  {versionsArray.map((v, index) => (
                    <div
                      key={v}
                      className="bg-white/5 rounded-xl p-6 transition-all duration-200 hover:border-[#FF30A0] hover:border"
                      onClick={() => (window.location.href =
                        `/plugins/${name}/${v}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {name}@
                          <span className="text-lg bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-transparent bg-clip-text">
                            {v}
                          </span>
                        </h3>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs font-medium text-white bg-[#FF30A0]/20 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
