import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Upload, 
  Link, 
  Film,
  SkipBack,
  SkipForward
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const VideoPlayer = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoName, setVideoName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("يرجى اختيار ملف فيديو");
      return;
    }

    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
    setIsPlaying(false);
    setProgress(0);
    toast.success("تم تحميل الفيديو");
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) {
      toast.error("يرجى إدخال رابط الفيديو");
      return;
    }

    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }

    setVideoSrc(videoUrl);
    setVideoName("فيديو من رابط");
    setIsPlaying(false);
    setProgress(0);
    toast.success("تم تحميل الفيديو");
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing video:", error);
      toast.error("حدث خطأ أثناء تشغيل الفيديو");
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    videoRef.current.volume = newVolume / 100;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newTime = (value[0] / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(value[0]);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="py-16 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">مشغل الفيديو</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            شاهد أفضل اللحظات السينمائية
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            استمتع بمشاهدة مقاطع الفيديو والأفلام الوثائقية عن السينما المصرية الكلاسيكية
          </p>
        </div>

        <div className="relative group">
          {/* Decorative effects */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20" />
          
          <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-2xl">
            {/* Video container */}
            <div className="relative aspect-video bg-black">
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => toast.error("فشل تحميل الفيديو")}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <Film className="h-20 w-20 text-primary/50 relative" />
                  </div>
                  <p className="mt-4 text-lg">اختر فيديو للمشاهدة</p>
                </div>
              )}

              {/* Play overlay */}
              {videoSrc && !isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="bg-primary/90 rounded-full p-5 hover:scale-110 transition-transform shadow-lg shadow-primary/50">
                    <Play className="h-12 w-12 text-primary-foreground" />
                  </div>
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-gradient-to-t from-background to-card space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="flex-1"
                  disabled={!videoSrc}
                />
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(-10)}
                    disabled={!videoSrc}
                    className="hover:bg-primary/20"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                    disabled={!videoSrc}
                    className="h-12 w-12 rounded-full shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 mr-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(10)}
                    disabled={!videoSrc}
                    className="hover:bg-primary/20"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    disabled={!videoSrc}
                    className="hover:bg-primary/20"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-24"
                    disabled={!videoSrc}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    disabled={!videoSrc}
                    className="hover:bg-primary/20"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Video name */}
              {videoName && (
                <p className="text-sm text-muted-foreground text-center truncate">
                  {videoName}
                </p>
              )}
            </div>

            {/* Upload section */}
            <div className="p-4 border-t border-border bg-muted/30">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="h-4 w-4" />
                    رابط فيديو
                  </TabsTrigger>
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="h-4 w-4" />
                    رفع ملف
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="أدخل رابط الفيديو (YouTube, Vimeo, MP4...)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1"
                      dir="ltr"
                    />
                    <Button onClick={handleUrlSubmit} className="shrink-0">
                      تشغيل
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    اختر ملف فيديو
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
