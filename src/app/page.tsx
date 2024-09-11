'use client';
import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import HomePage from './components/Home/Home';
import FileDisplay from './components/FileDisplay/FileDisplay';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [audioStream, setAudioStream] = useState<
    MediaStream | File | null
  >(null);

  const isAudioAvailable = file || audioStream;

  const resetAudio = () => {
    setFile(null);
    setAudioStream(null);
  };

  useEffect(() => {
    console.log(audioStream);
  }, [audioStream]);

  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full">
      <section className="min-h-screen flex flex-col">
        <Header />
        {isAudioAvailable ? (
          <FileDisplay
            handleAudioReset={resetAudio}
            file={file}
            audioStream={audioStream}
          />
        ) : (
          <HomePage
            setFile={setFile}
            setAudioStream={setAudioStream}
          />
        )}
      </section>
    </div>
  );
}
