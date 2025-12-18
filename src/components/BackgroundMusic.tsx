import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Volume2, VolumeX, Play, Pause, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioName, setAudioName] = useState("لم يتم اختيار ملف");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("يرجى اختيار ملف صوتي");
      return;
    }

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const url = URL.createObjectURL(file);
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;
    
    setHasAudio(true);
    setAudioName(file.name);
    setIsPlaying(false);
    toast.success("تم تحميل الملف الصوتي");
  };

  const togglePlay = async () => {
    if (!audioRef.current) {
      toast.error("يرجى اختيار ملف صوتي أولاً");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("حدث خطأ أثناء تشغيل الصوت");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`fixed bottom-24 left-4 z-50 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg ${
            isPlaying ? "animate-pulse" : ""
          }`}
        >
          <Music className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="top" align="start" dir="rtl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">موسيقى خلفية</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioFile" className="text-sm">اختر ملف صوتي</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="audioFile"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع ملف صوتي
              </Button>
            </div>
            <p className="text-xs text-muted-foreground truncate">{audioName}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="h-10 w-10"
              disabled={!hasAudio}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12 rounded-full"
              disabled={!hasAudio}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 mr-0.5" />
              )}
            </Button>

            <div className="w-10 h-10" />
          </div>

          <div className="flex items-center gap-3">
            <VolumeX className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
              disabled={!hasAudio}
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ارفع ملف MP3 أو أي ملف صوتي للتشغيل
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BackgroundMusic;
