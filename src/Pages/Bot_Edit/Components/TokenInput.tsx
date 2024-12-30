// Packages
import { motion } from 'framer-motion';
import { Lock, EyeIcon, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { debounce } from 'lodash';

// Components
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Backend
import { set_token } from '@/Services/Bot Manager/token';

interface TokenInputProps {
  token: string;
  name: string;
  onTokenChange?: () => void;
}

export function TokenInput({ name, token, onTokenChange }: TokenInputProps) {
  const [isTokenVisible, setIsTokenVisible] = useState<boolean>(false);
  const [currentToken, setCurrentToken] = useState<string>(token);
  const { toast } = useToast();

  const toggleTokenVisibility = () => setIsTokenVisible((prev) => !prev);

  const debouncedTokenChange = debounce(async (newToken: string) => {
    if (newToken === token) return;
    try {
      const success = await set_token(name, newToken);
      if (success) {
        toast({
          title: 'Success',
          description: 'Token Updated',
          variant: 'success',
        });
        onTokenChange?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Unable to update token`,
        variant: 'destructive',
      });
    }
  }, 1000);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setCurrentToken(newToken);
    debouncedTokenChange(newToken);
  };

  return (
    <motion.div
      className="bg-white/5 p-6 rounded-lg shadow-md mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <Lock className="mr-2" />
        Token
      </h2>
      <div className="flex space-x-4 items-center">
        <Input
          type={isTokenVisible ? 'text' : 'password'}
          onChange={handleTokenChange}
          disabled={!isTokenVisible}
          value={currentToken}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
          placeholder="Enter new token"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTokenVisibility}
          className="text-white bg-transparent flex items-center justify-center"
          aria-label={isTokenVisible ? 'Hide token' : 'Show token'}
        >
          {isTokenVisible ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeClosed className="w-5 h-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
