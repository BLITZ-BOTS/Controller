import BlitzIcon from "../Icons/BlitzIcon";
import { motion } from "framer-motion";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer
      className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 bg-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <BlitzIcon className="h-6 w-6" />
          <span className="font-bold">BLITZ BOTS</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="flex space-x-4">
            <a
              href="https://discord.blitz-bots.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
              aria-label="Discord"
            >
              <FaDiscord className="h-6 w-6" />
            </a>
            <a
              href="https://github.blitz-bots.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
              aria-label="GitHub"
            >
              <FaGithub className="h-6 w-6" />
            </a>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 BLITZ BOTS. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
