import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakText, stopSpeech } from '../../services/ttsService';

interface TTSButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({
  text,
  label,
  size = 'md',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    await speakText(
      text,
      () => {
        setIsLoading(false);
        setIsPlaying(true);
      },
      () => {
        setIsPlaying(false);
        setIsLoading(false);
      }
    );
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleToggle}
      title="Listen with Gemini Audio TTS"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
        isPlaying
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin text-cyan-400`} />
      ) : isPlaying ? (
        <VolumeX className={`${iconSizes[size]} text-amber-400`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} text-cyan-400`} />
      )}
      {label && <span>{isPlaying ? 'Stop Voice' : label}</span>}
    </button>
  );
};
