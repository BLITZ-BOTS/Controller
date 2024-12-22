import { cn } from '@/lib/utils';
import AnimatedGridPattern from '@/Components/ui/animated-grid-pattern';
import { Progress } from '@/Components/ui/progress';
import { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export function UpdateOverlay() {
  const [updateStatus, setUpdateStatus] = useState<
    'checking' | 'available' | 'installing' | 'none'
  >('checking');
  const [progress, setProgress] = useState(0);
  const [shouldShow, setShouldShow] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    notes: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await check();

        if (update) {
          setUpdateInfo({
            version: update.version,
            notes: update.body as string,
            date: update.date as string,
          });
          setUpdateStatus('available');
          setProgress(100);

          let downloaded = 0;
          let contentLength = 0;

          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                setUpdateStatus('installing');
                contentLength = event.data.contentLength as number;
                setProgress(0);
                break;
              case 'Progress':
                downloaded += event.data.chunkLength;
                const progressPercent = (downloaded / contentLength) * 100;
                setProgress(Math.round(progressPercent));
                break;
              case 'Finished':
                setProgress(100);
                break;
            }
          });

          console.log('update installed');
          await relaunch();
        } else {
          // No updates available
          setProgress(100);
          setTimeout(() => {
            setShouldShow(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
        setShouldShow(false);
      }
    }

    checkUpdate();
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg bg-black p-20 md:shadow-xl">
      <div className="flex flex-col items-center z-10">
        <p className="whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter mb-4">
          {updateStatus === 'checking' && 'Checking For Updates'}
          {updateStatus === 'available' &&
            `Update ${updateInfo?.version} Available`}
          {updateStatus === 'installing' && 'Installing Update'}
        </p>
        {updateInfo && updateStatus === 'available' && (
          <p className="text-center text-lg mb-4">{updateInfo.notes}</p>
        )}
        <Progress value={progress} className="mt-[30px] w-[300px]" />
      </div>

      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
      />
    </div>
  );
}
