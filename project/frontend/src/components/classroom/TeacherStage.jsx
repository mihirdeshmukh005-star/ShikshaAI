import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize, Pause, Play, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import TeacherAvatar3D from './TeacherAvatar3D';

function pickIndianVoice(language) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const wanted = language === 'Hindi' ? ['hi-IN', 'en-IN'] : ['en-IN'];
  for (const code of wanted) {
    const found = voices.find((v) => v.lang?.toLowerCase() === code.toLowerCase());
    if (found) return found;
  }
  return voices.find((v) => v.lang?.toLowerCase().startsWith(language === 'Hindi' ? 'hi' : 'en')) || null;
}

function splitSpeech(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
}

export default function TeacherStage({ lesson, speaking, onSpeakEnd, paused, onTogglePause, onToggleFullscreen }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const speechIndex = useRef(0);
  const speechId = useRef(0);
  const currentText = useRef('');
  const cancelledByPause = useRef(false);
  const board = lesson?.board || { title: lesson?.topic || 'AI Teacher', items: [], formula: '', diagram: '' };
  const speechText = lesson?.currentSpeech || '';
  const sentences = useMemo(() => splitSpeech(speechText), [speechText]);
  const boardItems = useMemo(() => board.items?.slice(0, 5) || [], [board.items]);

  const speakFrom = (startIndex) => {
    if (!('speechSynthesis' in window) || !sentences.length) {
      onSpeakEnd?.();
      return;
    }
    const id = ++speechId.current;
    window.speechSynthesis.cancel();
    speechIndex.current = Math.max(0, Math.min(startIndex, sentences.length - 1));
    currentText.current = speechText;

    const speakNext = () => {
      if (id !== speechId.current || cancelledByPause.current || paused) return;
      const index = speechIndex.current;
      if (index >= sentences.length) {
        onSpeakEnd?.();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(sentences[index]);
      utterance.lang = lesson?.language === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.94;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      const voice = pickIndianVoice(lesson?.language);
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (id !== speechId.current || cancelledByPause.current) return;
        speechIndex.current = index + 1;
        speakNext();
      };
      utterance.onerror = () => {
        if (id === speechId.current && !cancelledByPause.current) onSpeakEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  };

  useEffect(() => {
    if (!speechText) return undefined;
    speechIndex.current = 0;
    cancelledByPause.current = false;
    speakFrom(0);
    return () => {
      ++speechId.current;
      window.speechSynthesis?.cancel?.();
    };
  }, [speechText, lesson?.language]);

  useEffect(() => {
    if (!('speechSynthesis' in window) || !speechText) return;
    // A normal lesson pause uses the browser's native pause/resume so playback
    // continues from the exact point, including the middle of a sentence.
    if (paused) {
      cancelledByPause.current = false;
      window.speechSynthesis.pause();
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      return;
    }
    // If speech was cancelled by an interruption (doubt/assessment), restart
    // only from the current sentence when the new response is ready.
    if (cancelledByPause.current && currentText.current === speechText) {
      cancelledByPause.current = false;
      speakFrom(speechIndex.current);
    }
  }, [paused, speechText]);

  useEffect(() => () => window.speechSynthesis?.cancel?.(), []);

  const toggleFullscreen = async () => {
    const el = document.getElementById('teacher-stage');
    try {
      if (!document.fullscreenElement) {
        await el?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((v) => !v);
    }
    onToggleFullscreen?.();
  };

  return (
    <div id="teacher-stage" className={`teacher-stage ${isFullscreen ? 'teacher-stage-fullscreen' : ''}`}>
      <TeacherAvatar3D className="teacher-stage-image teacher-avatar-image" speaking={speaking && !paused} />
      <div className="provided-board-overlay" aria-label="Live blackboard">
        <div className="board-title">{board.title || lesson?.topic}</div>
        {boardItems.map((item, i) => <div className="board-line" key={`${item}-${i}`}>{item}</div>)}
        {board.formula && <div className="board-formula">{board.formula}</div>}
        {board.diagram && <div className="board-diagram">{board.diagram}</div>}
      </div>
      <motion.div className={`teacher-speaking-glow ${speaking ? 'active' : ''}`} animate={speaking ? { opacity: [0.25, 0.5, 0.25], scale: [1, 1.01, 1] } : { opacity: 0, scale: 1 }} transition={{ duration: 1.8, repeat: speaking ? Infinity : 0 }} />
      <div className="teacher-status"><span className={speaking ? 'status-dot speaking' : 'status-dot'} />{speaking ? 'AI TEACHER • SPEAKING' : paused ? 'AI TEACHER • PAUSED' : 'AI TEACHER • READY'}</div>
      <div className="teacher-controls">
        <button onClick={onTogglePause} aria-label={paused ? 'Resume lesson' : 'Pause lesson'}>{paused ? <Play size={17} fill="currentColor" /> : <Pause size={17} />}</button>
        <div className={`voice-bars ${speaking && !paused ? 'active' : ''}`} aria-hidden="true">{[4, 8, 12, 7, 15, 9, 5].map((h, i) => <span key={i} style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }} />)}</div>
        <Volume2 size={16} />
        <button onClick={toggleFullscreen} aria-label="Toggle fullscreen"><Maximize size={17} /></button>
      </div>
    </div>
  );
}
