// Packages
import { motion } from 'framer-motion';

interface NotificationProps {
  message: string;
  type: 'loading' | 'success' | 'error';
}

const Notification = ({ message, type }: NotificationProps) => {
  const backgroundColorClass =
    type === 'loading'
      ? 'bg-yellow-500/10'
      : type === 'success'
        ? 'bg-green-500/10'
        : 'bg-red-500/10';

  const borderColorClass =
    type === 'loading'
      ? 'border-yellow-500'
      : type === 'success'
        ? 'border-green-500'
        : 'border-red-500';

  return (
    <motion.div
      className={`${backgroundColorClass} border ${borderColorClass} backdrop-blur-md text-white fixed bottom-[50px] right-0 m-4 p-4 rounded-lg shadow-lg w-80`}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <p>{message}</p>
    </motion.div>
  );
};

export default Notification;
