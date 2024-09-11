import Icon from '@/app/Icon/Icon';
import { faPenNib } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface props {
  file: File | null;
  audioStream: MediaStream | File | null;
  handleAudioReset: () => void;
}

const FileDisplay = ({
  file,
  audioStream,
  handleAudioReset,
}: props) => {
  return (
    <main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 w-72 max-w-full mx-auto sm:w-96">
      <h1 className="font-semibold text-4xl sm:text-5xxl md:text-6xl">
        Your file
      </h1>
      <div className="flex flex-col text-left my-4">
        <h3 className="font-semibold">
          Name
          <p>{file ? file.name : 'custom Audio'}</p>
        </h3>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button className="text-slate-400" onClick={handleAudioReset}>
          Reset
        </button>
        <button className="specialBtn py-2 px-3 rounded-lg text-blue-400 flex items-center gap-2 font-medium">
          <p>Transcribe</p>
          <Icon icon={faPenNib} className="fa-solid fa-pen-nib" />
        </button>
      </div>
    </main>
  );
};

export default FileDisplay;
