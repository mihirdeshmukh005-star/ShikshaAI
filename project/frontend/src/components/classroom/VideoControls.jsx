import { Maximize, Pause, Play } from 'lucide-react';

export default function VideoControls({ paused, onTogglePause, onToggleFullscreen }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button className="control-button active" onClick={onTogglePause} aria-label={paused ? 'Resume lesson' : 'Pause lesson'}>
        {paused ? <Play size={17} fill="white" /> : <Pause size={17} />}
      </button>
      <button className="control-button" onClick={onToggleFullscreen} aria-label="Toggle fullscreen"><Maximize size={17} /></button>
    </div>
  );
}
