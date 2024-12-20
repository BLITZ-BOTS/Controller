// Packages
import { motion } from 'framer-motion';

// Components
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

interface NotificationProps {
  message: string;
  type: 'loading' | 'success' | 'error';
}

const Notification = ({ message, type }: NotificationProps) => {
  const alertVariant =
    type === 'loading'
      ? 'warning'
      : type === 'success'
        ? 'success'
        : 'destructive';

  return (
    <motion.div
      className="fixed bottom-[50px] right-0 m-4 w-80"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 300,
        restSpeed: 1,
        damping: 25,
        duration: 0.3,
      }}
    >
      <Alert variant={alertVariant || 'default'}>
        <AlertTitle>
          {type === 'loading' && 'Loading...'}
          {type === 'success' && 'Success!'}
          {type === 'error' && 'Error!'}
        </AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default Notification;
