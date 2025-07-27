"use client";

import { useRef, useState, useEffect, type FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, Pause, Play, Volume2 } from "lucide-react";
import { generateSpeech, type GenerateSpeechOutput } from "@/ai/flows/generate-speech";
import { useToast } from "@/hooks/use-toast";

const Home: FC = () => {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioResult, setAudioResult] = useState<GenerateSpeechOutput | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to generate speech.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAudioResult(null);
    setIsPlaying(false);

    try {
      const result = await generateSpeech(text);
      setAudioResult(result);
    } catch (error) {
      console.error("Error generating speech:", error);
      toast({
        title: "An error occurred",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    }
  };

  const handleDownload = () => {
    if (audioResult?.media) {
      const link = document.createElement("a");
      link.href = audioResult.media;
      link.download = "bharati-voice.wav";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnded);

      return () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnded);
      };
    }
  }, [audioResult]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Volume2 className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-headline font-bold mt-4">Bharati Voice</h1>
          <p className="text-muted-foreground mt-2">Your words, in a beautiful voice.</p>
        </div>
        <Card className="w-full shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Text-to-Speech Converter</CardTitle>
            <CardDescription>
              Enter your text below to generate speech with a natural female voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type or paste your text here..."
              className="min-h-[150px] resize-none rounded-lg text-base focus:ring-accent"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={6}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button 
              onClick={handleGenerateSpeech} 
              disabled={isLoading || !text.trim()}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Audio"
              )}
            </Button>
          </CardFooter>
        </Card>

        {audioResult && (
          <Card className="shadow-lg rounded-xl transition-all duration-500 ease-in-out animate-in fade-in-50">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-medium text-lg text-accent-foreground bg-accent px-4 py-2 rounded-md">Your audio is ready!</p>
              <div className="flex items-center gap-3">
                <Button onClick={handlePlayPause} variant="outline" size="icon" aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button onClick={handleDownload} variant="outline" size="icon" aria-label="Download audio">
                  <Download className="h-6 w-6" />
                </Button>
              </div>
              <audio ref={audioRef} src={audioResult.media} className="hidden" onCanPlay={() => { if(isPlaying) audioRef.current?.play(); }}/>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

export default Home;
