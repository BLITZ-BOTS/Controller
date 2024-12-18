// Packages
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, X } from 'lucide-react';

const TitleBar = () => {
  const appWindow = getCurrentWindow();

  {
    /* Handle Minimize Button */
  }
  const handleMinimize = () => {
    appWindow.minimize();
  };

  {
    /* Handle Close Button */
  }
  const handleClose = () => {
    appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="h-[30px] bg-[#000000] flex justify-end items-center fixed top-0 left-0 right-0 w-screen z-50 border-b border-[#ffffff]/20"
    >
      {/* Minimize Button */}
      <button
        onClick={handleMinimize}
        className="w-[20px] h-[20px] flex justify-center items-center rounded-full bg-[#ffffff]/10 hover:bg-[#ffffff]/20 transition duration-200"
      >
        <Minus className="text-white w-[15px]" />
      </button>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-[20px] h-[20px] flex justify-center items-center rounded-full bg-red-500/20 hover:bg-red-500/40 transition duration-200 ml-2 mr-2"
      >
        <X className="text-red-500 w-[15px]" />
      </button>
    </div>
  );
};

export default TitleBar;
