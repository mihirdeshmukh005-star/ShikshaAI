import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock3, FileUp, Loader2, Mic, MicOff, Send, Sparkles, Upload, X } from 'lucide-react';
import Sidebar from '../components/classroom/Sidebar';
import ClassroomHeader from '../components/classroom/ClassroomHeader';
import TeacherStage from '../components/classroom/TeacherStage';
import NotesPanel from '../components/classroom/NotesPanel';
import LearningProfile from '../components/classroom/LearningProfile';
import { api } from '../lib/api';

const DEFAULT_TOPIC = "Newton's Laws of Motion";
const DURATIONS = [5, 10, 15, 20, 30, 60];

function difficultyFor(minutes) {
  if (minutes <= 5) return 'Basic';
  if (minutes <= 10) return 'Moderate';
  if (minutes <= 20) return 'Advanced';
  if (minutes <= 30) return 'Deep';
  return 'Expert';
}
function formatTime(seconds) { const s = Math.max(0, seconds); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

function useSpeechRecognition(language, onResult) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const start = () => {
    if (!supported || listening) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => onResult(e.results?.[0]?.[0]?.transcript || '');
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };
  const stop = () => { recognitionRef.current?.stop?.(); setListening(false); };
  useEffect(() => () => recognitionRef.current?.stop?.(), []);
  return { supported, listening, start, stop };
}

export default function Classroom() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('classroom');
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [duration, setDuration] = useState(10);
  const [language, setLanguage] = useState('English');
  const [sessionId, setSessionId] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [doubt, setDoubt] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [waitingQuestion, setWaitingQuestion] = useState('');
  const [questionKind, setQuestionKind] = useState('concept');
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [reportUrl, setReportUrl] = useState('');
  const [completed, setCompleted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [user, setUser] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [understandingInput, setUnderstandingInput] = useState('');
  const [interruption, setInterruption] = useState(false);
  const fileRef = useRef(null);
  const autoAdvanceRef = useRef(false);
  const typingPauseRef = useRef(false);

  useEffect(() => {
    if (!localStorage.getItem('edureal_token')) {
      navigate('/login', { replace: true });
      return;
    }
    api.me().then(({ user }) => {
      setUser(user);
      setLanguage(user.language === 'Hindi' ? 'Hindi' : 'English');
    }).catch(() => {
      localStorage.removeItem('edureal_token');
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const active = Boolean(sessionId);
  const difficulty = difficultyFor(duration);

  const setTeacherData = useCallback((data, mode = 'teach') => {
    setLesson({ ...(data.lesson || {}), currentSpeech: data.answer, suggestedTopics: data.decision?.suggested_topics || data.lesson?.suggestedTopics || [], suggestedQuestions: data.decision?.suggested_questions || data.lesson?.suggestedQuestions || [] });
    setSpeaking(Boolean(data.answer));
    setAssessment(null);
    const q = data.decision?.ask_check_question ? data.decision.check_question : '';
    setWaitingQuestion(q || '');
    setQuestionKind(data.decision?.check_kind || 'concept');
    setQuestionSeconds(q ? 30 : 0);
    if (mode !== 'teach') setInterruption(true);
  }, []);

  const continueLesson = useCallback(async () => {
    if (!sessionId || completed || paused || waitingQuestion || loading || doubtLoading || autoAdvanceRef.current) return;
    autoAdvanceRef.current = true;
    try {
      const result = await api.teach({
        session_id: sessionId,
        message: 'Continue the live lesson from exactly where it stopped. Teach the next uncovered concept. Do not repeat previous concepts unless needed for a brief transition. Ask a check question only when appropriate.',
        language,
        depth: difficulty.toLowerCase(),
        mode: 'teach',
      });
      setTeacherData(result, 'teach');
    } catch (e) {
      setError(`The next lesson segment could not load: ${e.message}`);
    } finally { autoAdvanceRef.current = false; }
  }, [sessionId, completed, paused, waitingQuestion, loading, doubtLoading, language, difficulty, setTeacherData]);

  const startLesson = useCallback(async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic || loading) return;
    setError(''); setLoading(true); setCompleted(false); setReportUrl(''); setWaitingQuestion(''); setAssessment(null); setLesson(null); setPaused(false); setRemaining(duration * 60);
    try {
      const started = await api.startSession({ student_id: user?.id || 'demo-student', subject: 'General', topic: cleanTopic, duration_minutes: duration, language, level: user?.level || 'beginner' });
      setSessionId(started.session_id);
      if (started.opening?.answer) {
        setTeacherData(started.opening, 'teach');
      } else {
        // Rare provider failure: keep the class open and allow a retry.
        const opening = await api.teach({ session_id: started.session_id, message: `Start the live lesson on "${cleanTopic}". Teach the first concept now.`, language, depth: difficulty.toLowerCase(), mode: 'teach' });
        setTeacherData(opening, 'teach');
      }
    } catch (e) { setError(`Could not start the AI teacher: ${e.message}`); setSessionId(null); }
    finally { setLoading(false); }
  }, [topic, duration, language, loading, difficulty, setTeacherData]);

  const finishLesson = useCallback(async () => {
    if (!sessionId || completed) return;
    setPaused(true); setSpeaking(false); setWaitingQuestion('');
    try {
      const result = await api.complete(sessionId);
      setLesson(result.lesson); setCompleted(true); setQuestionSeconds(0);
      setReportLoading(true);
      try {
        const url = await api.downloadReport(sessionId);
        setReportUrl(url);
      } finally {
        setReportLoading(false);
      }
      window.speechSynthesis?.cancel?.();
    } catch (e) { setError(`Lesson ended, but the report could not be generated: ${e.message}`); }
  }, [sessionId, completed]);

  useEffect(() => {
    if (!active || paused || completed || remaining <= 0 || waitingQuestion) return undefined;
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [active, paused, completed, remaining, waitingQuestion]);

  useEffect(() => { if (active && remaining === 0 && !completed) finishLesson(); }, [active, remaining, completed, finishLesson]);

  useEffect(() => {
    if (!waitingQuestion || completed) return undefined;
    setQuestionSeconds(30);
    const timer = setInterval(() => setQuestionSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [waitingQuestion, completed]);

  const submitEvaluation = useCallback(async (answer, timedOut = false) => {
    if (!waitingQuestion || !sessionId || doubtLoading) return;
    setDoubtLoading(true); setError('');
    try {
      const result = await api.evaluate({ session_id: sessionId, question: waitingQuestion, student_answer: answer.trim(), expected_concept: lesson?.board?.title || '' });
      setAssessment(result.evaluation); setWaitingQuestion(''); setQuestionSeconds(0); setStudentAnswer(''); setPaused(false); setSpeaking(true); setInterruption(true);
      setLesson((prev) => ({ ...prev, currentSpeech: result.evaluation.explanation }));
      if (timedOut) setError('30 seconds passed, so the teacher explained the answer and will continue the class.');
    } catch (e) { setError(`Answer evaluation failed: ${e.message}`); }
    finally { setDoubtLoading(false); }
  }, [waitingQuestion, sessionId, doubtLoading, lesson]);

  useEffect(() => {
    if (questionSeconds !== 0 || !waitingQuestion || completed || questionKind === 'understanding') return;
    submitEvaluation('', true);
  }, [questionSeconds, waitingQuestion, completed, questionKind, submitEvaluation]);

  const pauseResume = () => {
    if (!active || completed) return;
    setPaused((p) => !p);
  };

  const askDoubt = async () => {
    const text = doubt.trim();
    if (!text || !sessionId || doubtLoading || completed) return;
    const keepPausedAfterDoubt = paused && !typingPauseRef.current;
    setInterruption(true); setPaused(true); setDoubtLoading(true); setError(''); setSpeaking(false);
    window.speechSynthesis?.cancel?.();
    try {
      const result = await api.teach({ session_id: sessionId, message: text, language, mode: 'doubt', depth: 'detailed' });
      setTeacherData(result, 'doubt'); setDoubt(''); typingPauseRef.current = false; setPaused(keepPausedAfterDoubt);
    } catch (e) { setError(`Doubt could not be answered: ${e.message}`); setPaused(keepPausedAfterDoubt); typingPauseRef.current = false; }
    finally { setDoubtLoading(false); }
  };

  const answerUnderstanding = async (text) => {
    const answer = text.trim();
    if (!answer || !sessionId || doubtLoading) return;
    setDoubtLoading(true); setError(''); setPaused(true); setSpeaking(false); window.speechSynthesis?.cancel?.();
    try {
      const result = await api.teach({ session_id: sessionId, message: `Understanding check reply: ${answer}. If the student says no, ask what concept should be repeated. If the student says all, restart the full lesson from concept 1. If yes, appreciate the student briefly and continue.`, language, mode: 'understanding', depth: 'detailed' });
      setTeacherData(result, 'understanding'); setUnderstandingInput(''); setPaused(false);
    } catch (e) { setError(`Understanding check failed: ${e.message}`); }
    finally { setDoubtLoading(false); }
  };

  useEffect(() => {
    if (questionSeconds !== 0 || !waitingQuestion || completed || questionKind !== 'understanding') return;
    answerUnderstanding('I could not answer within 30 seconds. Please explain the concept.');
  }, [questionSeconds, waitingQuestion, completed, questionKind]);

  const submitStudentAnswer = async () => { await submitEvaluation(studentAnswer); };

  const uploadMaterial = async (file) => {
    if (!file) return;
    setUploading(true); setUploadMessage('Indexing your material with RAG…');
    try { const result = await api.upload(file); setUploadMessage(`${result.file} indexed: ${result.rag.chunks} chunks ready for the teacher.`); }
    catch (e) { setUploadMessage(`Upload failed: ${e.message}`); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const focusStudentInput = () => { if (active && !paused && !completed) { typingPauseRef.current = true; setPaused(true); setSpeaking(false); window.speechSynthesis?.cancel?.(); } };
  const resumeAfterStudentInput = () => { if (typingPauseRef.current) { typingPauseRef.current = false; setPaused(false); } };

  const studentVoice = useSpeechRecognition(language, (text) => setStudentAnswer((v) => `${v ? `${v} ` : ''}${text}`));
  const doubtVoice = useSpeechRecognition(language, (text) => setDoubt((v) => `${v ? `${v} ` : ''}${text}`));

  const handleSpeechEnd = useCallback(() => {
    setSpeaking(false);
    if (!active || completed || paused || waitingQuestion) return;
    if (interruption) {
      setInterruption(false);
      if (!paused && remaining > 0) continueLesson();
      return;
    }
    if (remaining > 0) continueLesson();
  }, [active, completed, paused, waitingQuestion, interruption, remaining, continueLesson]);

  const endEarly = () => { if (active) finishLesson(); else navigate('/'); };

  if (activeNav === 'my-learning') return <div className="h-screen bg-ink-950 flex"><Sidebar user={user} active={activeNav} onNavigate={setActiveNav} className="hidden lg:flex w-[248px] shrink-0" /><main className="flex-1 overflow-y-auto"><ClassroomHeader user={user} onOpenSidebar={() => {}} onFullscreen={() => {}} onEndClass={() => {}} /><LearningProfile /></main></div>;

  return (
    <div className="h-screen bg-ink-950 text-white overflow-hidden">
      <div className="flex h-full min-w-0">
        <Sidebar user={user} active={activeNav} onNavigate={setActiveNav} className="hidden lg:flex w-[248px] shrink-0" />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <ClassroomHeader user={user} onOpenSidebar={() => {}} onFullscreen={() => document.getElementById('teacher-stage')?.requestFullscreen?.()} onEndClass={endEarly} />
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 max-w-[1500px] mx-auto">
            <section className="lesson-launcher">
              <div className="launcher-head"><div><p className="eyebrow"><Sparkles size={13} /> LIVE AI CLASSROOM</p><h2>Choose what you want to learn</h2><p>Search any topic, set a teaching time, and let the teacher build the lesson.</p></div>{active && <div className={`lesson-status ${completed ? 'done' : 'live'}`}>{completed ? <CheckCircle2 size={14} /> : <span />} {completed ? 'Lesson completed' : 'Live lesson'}</div>}</div>
              <div className="launcher-grid">
                <label className="field wide"><span>Search topic</span><input value={topic} onChange={(e) => setTopic(e.target.value)} disabled={active && !completed} placeholder="e.g. Quantum Mechanics, DBMS, Thermodynamics…" /></label>
                <label className="field"><span>Teaching time</span><select value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={active && !completed}>{DURATIONS.map((d) => <option key={d} value={d}>{d} min • {difficultyFor(d)}</option>)}</select></label>
                <label className="field"><span>Output language</span><select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={active && !completed}><option>English</option><option>Hindi</option></select></label>
              </div>
              <div className="launcher-actions"><button className="upload-button" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload size={15} /> Upload material</button><input ref={fileRef} type="file" hidden accept=".pdf,.docx,.pptx,.txt,.md,.csv,.json" onChange={(e) => uploadMaterial(e.target.files?.[0])} /><button className="start-button" onClick={active && !completed ? endEarly : startLesson} disabled={loading || !topic.trim() || !user}>{loading ? <><Loader2 size={17} className="spin" /> Preparing lesson…</> : active && !completed ? <><CheckCircle2 size={17} /> End lesson</> : <><BookOpen size={17} /> Start lesson</>}</button></div>
              {uploadMessage && <div className="upload-message"><FileUp size={14} /> {uploadMessage}</div>}
              <div className="launcher-foot"><span><Clock3 size={13} /> {duration} min</span><span>Difficulty: {difficulty}</span><span>{language === 'Hindi' ? 'Natural Hinglish' : 'Indian English'}</span></div>
            </section>
            {error && <div className="error-banner"><X size={15} /> {error}</div>}

            <div className="classroom-grid"><section>
              <TeacherStage lesson={lesson || { topic, board: { title: topic, items: [], formula: '' }, language }} speaking={speaking} paused={paused} onSpeakEnd={handleSpeechEnd} onTogglePause={pauseResume} onToggleFullscreen={() => {}} />
              <div className="lesson-progress-card"><div><span>Current topic</span><strong>{lesson?.topic || topic}</strong></div><div className="progress-meta"><span>{formatTime(remaining)} remaining</span><span>{lesson?.conceptsDone || 0} / {lesson?.conceptsTotal || '—'} concepts</span></div><div className="progress-track"><div style={{ width: `${duration ? Math.max(0, Math.min(100, ((duration * 60 - remaining) / (duration * 60)) * 100)) : 0}%` }} /></div></div>

              {waitingQuestion && !completed && <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="teacher-question-card"><div className="question-badge">Teacher check • {questionSeconds}s</div><h3>{waitingQuestion}</h3>{questionKind === 'understanding' ? <><div className="answer-row"><button onClick={() => answerUnderstanding('yes, I understand')}>Yes, I understand</button><button onClick={() => answerUnderstanding('no, I do not understand')}>No, explain again</button></div><div className="answer-row understanding-input"><input value={understandingInput} onFocus={focusStudentInput} onChange={(e) => setUnderstandingInput(e.target.value)} placeholder="Tell the teacher what you want repeated…" /><button onClick={() => answerUnderstanding(understandingInput)} disabled={!understandingInput.trim()}>Send</button></div></> : <div className="answer-row"><input value={studentAnswer} onFocus={focusStudentInput} onChange={(e) => setStudentAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitStudentAnswer()} placeholder="Type your answer…" /><button onClick={studentVoice.listening ? studentVoice.stop : studentVoice.start} disabled={!studentVoice.supported} title={studentVoice.supported ? 'Speak answer' : 'Voice input unavailable'}>{studentVoice.listening ? <MicOff size={15} /> : <Mic size={15} />}</button><button onClick={() => { resumeAfterStudentInput(); submitStudentAnswer(); }} disabled={doubtLoading || !studentAnswer.trim()}><Send size={15} /> Submit</button></div>}</motion.section>}

              {assessment && <div className={`assessment-card ${assessment.correct ? 'correct' : 'wrong'}`}><strong>{assessment.correct ? 'Correct — well done! 🎉' : 'Not quite — let’s fix the idea.'}</strong><p>{assessment.explanation}</p>{assessment.misconception && <small>What to watch: {assessment.misconception}</small>}</div>}

              <section className="ask-doubt-card"><div><p className="eyebrow">ASK A DOUBT</p><h3>Ask the teacher anything</h3><p>Type or speak a question. The live class pauses while the teacher answers.</p></div><div className="doubt-row"><input value={doubt} onFocus={focusStudentInput} onChange={(e) => setDoubt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askDoubt()} placeholder={language === 'Hindi' ? 'Apna doubt poochhiye…' : 'Ask your teacher a doubt…'} disabled={!active || completed} /><button onClick={doubtVoice.listening ? doubtVoice.stop : doubtVoice.start} disabled={!doubtVoice.supported || !active || completed} title="Speak your doubt">{doubtVoice.listening ? <MicOff size={16} /> : <Mic size={16} />}</button><button onClick={askDoubt} disabled={!active || completed || doubtLoading || !doubt.trim()}>{doubtLoading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}</button></div></section>
            </section><NotesPanel lesson={lesson || { topic }} completed={completed} reportUrl={reportUrl} reportLoading={reportLoading} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
