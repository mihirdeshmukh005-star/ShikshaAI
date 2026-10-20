import { Download, FileText, LockKeyhole } from 'lucide-react';

export default function NotesPanel({ lesson, completed, reportUrl, reportLoading }) {
  const board = lesson?.board || {};
  const notes = lesson?.keyConcepts || [];
  const formulas = lesson?.formulas || [];

  return (
    <aside className="notes-panel">
      <div className="notes-panel-head">
        <div>
          <p className="eyebrow">LIVE NOTES</p>
          <h3>{lesson?.topic || 'Lesson notes'}</h3>
        </div>
        <FileText size={19} />
      </div>

      <div className="notes-section">
        <span>Current concept</span>
        <strong>{board.title || 'Waiting for lesson'}</strong>
      </div>

      <div className="notes-section">
        <span>Key concepts</span>
        {notes.length ? notes.map((x, i) => <div className="note-chip" key={`${x}-${i}`}>{x}</div>) : <p className="empty-note">Notes will appear as the teacher explains.</p>}
      </div>

      <div className="notes-section">
        <span>Important formulas</span>
        {formulas.length ? formulas.map((x, i) => <div className="formula-note" key={`${x}-${i}`}>{x}</div>) : <p className="empty-note">No formula recorded yet.</p>}
      </div>

      <div className="notes-section">
        <span>Explore next</span>
        {(lesson?.suggestedTopics?.length || lesson?.suggestedQuestions?.length) ? (
          <>
            {lesson?.suggestedTopics?.map((x, i) => <div className="note-chip" key={`topic-${i}`}>Topic: {x}</div>)}
            {lesson?.suggestedQuestions?.map((x, i) => <div className="note-chip" key={`question-${i}`}>Q: {x}</div>)}
          </>
        ) : <p className="empty-note">Related topics and questions will appear here.</p>}
      </div>

      <div className="notes-export">
        {!completed ? (
          <div className="locked-export"><LockKeyhole size={15} /> Export PDF unlocks when the live lesson ends.</div>
        ) : reportLoading ? (
          <div className="locked-export"><span className="spin">↻</span> Generating your complete lesson report…</div>
        ) : (
          <a className="export-button" href={reportUrl} target="_blank" rel="noreferrer"><Download size={15} /> Export complete lesson PDF</a>
        )}
      </div>
    </aside>
  );
}
