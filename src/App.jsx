import { useState } from 'react';
import ImageSection from './components/ImageSection/ImageSection';
import Calendar from './components/Calendar/Calendar';
import NotesPanel from './components/NotesPanel/NotesPanel';
import s from './App.module.css';

export default function App() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [range, setRange] = useState({ start: null, end: null });
  const [noteKeys, setNoteKeys] = useState(new Set());
  const [dark, setDark] = useState(true);

  return (
    <div className={`${s.root} ${!dark ? 'light-mode' : ''}`}>
      <button className={s.themeBtn} onClick={() => setDark(v => !v)} title={dark ? 'Light mode' : 'Dark mode'}>
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        )}
      </button>

      <main className={s.layout}>
        <div className={s.imgSide}>
          <ImageSection month={month} year={year} />
        </div>
        <div className={s.rightSide}>
          <div className={`${s.card} ${s.calCard}`}>
            <Calendar
              onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
              onRangeChange={setRange}
              noteKeys={noteKeys}
            />
          </div>
          <div className={`${s.card} ${s.notesCard}`}>
            <NotesPanel month={month} year={year} range={range} onNoteKeysChange={setNoteKeys} />
          </div>
        </div>
      </main>

      <footer className={s.footer}>
        <span>Wall Calendar</span>
        <span className={s.footerDot}>·</span>
        <span>{year}</span>
      </footer>
    </div>
  );
}
