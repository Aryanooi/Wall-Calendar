import { useState, useEffect, useRef } from 'react';
import s from './NotesPanel.module.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STORAGE_KEY = 'wallcal_notes';

function readStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fmtD(d) {
  if (!d) return 'none';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function rKey(start, end) {
  return `${fmtD(start)}_${fmtD(end || start)}`;
}

export default function NotesPanel({ month, year, range, onNoteKeysChange }) {
  const [tab, setTab] = useState('monthly');
  const [text, setText] = useState('');
  const [flash, setFlash] = useState(false);
  const [notes, setNotes] = useState(() => readStorage());

  const mKey = `${year}-${String(month+1).padStart(2,'0')}`;
  const hasRange = !!range?.start;
  const currRangeKey = hasRange ? rKey(range.start, range.end) : null;

  const prevKey = useRef(null);
  useEffect(() => {
    let key, stored;
    if (tab === 'monthly') {
      key = 'monthly:' + mKey;
      stored = notes[mKey]?.monthly || '';
    } else {
      if (!currRangeKey) { setText(''); prevKey.current = null; return; }
      key = 'range:' + currRangeKey;
      stored = notes[currRangeKey]?.text || '';
    }
    if (prevKey.current !== key) {
      prevKey.current = key;
      setText(stored);
    }
  }, [tab, mKey, currRangeKey, notes]);

  useEffect(() => {
    const keys = new Set();
    for (const k of Object.keys(notes)) {
      if (!k.includes('_')) continue;
      const [a, b] = k.split('_');
      if (a && a !== 'none') keys.add(a);
      if (b && b !== 'none') keys.add(b);
    }
    onNoteKeysChange?.(keys);
  }, [notes]); // eslint-disable-line

  const saveTimer = useRef(null);
  function handleTextChange(val) {
    setText(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const updated = { ...readStorage() };
      if (tab === 'monthly') {
        updated[mKey] = { ...updated[mKey], monthly: val };
      } else if (currRangeKey) {
        updated[currRangeKey] = { text: val };
      }
      writeStorage(updated);
      setNotes(updated);
    }, 300);
  }

  function saveNow() {
    clearTimeout(saveTimer.current);
    const updated = { ...notes };
    if (tab === 'monthly') {
      updated[mKey] = { ...updated[mKey], monthly: text };
    } else if (currRangeKey) {
      updated[currRangeKey] = { text: text };
    }
    writeStorage(updated);
    setNotes(updated);
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }

  function clearNote() {
    const updated = { ...notes };
    if (tab === 'monthly') {
      if (updated[mKey]) updated[mKey] = { ...updated[mKey], monthly: '' };
    } else if (currRangeKey) {
      delete updated[currRangeKey];
    }
    setText('');
    writeStorage(updated);
    setNotes(updated);
  }

  const rangeNotes = Object.entries(notes).filter(([k]) =>
    k.includes('_') && k.split('_')[0]?.startsWith(mKey)
  );

  return (
    <aside className={s.panel}>
      <div className={s.hdr}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>Notes</span>
      </div>

      <div className={s.tabs}>
        <button className={tab === 'monthly' ? `${s.tab} ${s.on}` : s.tab} onClick={() => setTab('monthly')}>
          Monthly
        </button>
        <button
          className={tab === 'range' ? `${s.tab} ${s.on}` : `${s.tab} ${!hasRange ? s.off : ''}`}
          onClick={() => hasRange && setTab('range')}
          disabled={!hasRange}
          title={!hasRange ? 'Select a date range first' : undefined}
        >
          Date Range
          {hasRange && <span className={s.indicator} />}
        </button>
      </div>

      <div className={s.context}>
        {tab === 'monthly' ? (
          <span>Notes for <strong>{MONTHS[month]} {year}</strong></span>
        ) : hasRange ? (
          <span>
            {range.start?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {range.end && range.end.toDateString() !== range.start.toDateString()
              ? ` → ${range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ' (single day)'}
          </span>
        ) : (
          <span className={s.dim}>No range selected</span>
        )}
      </div>

      <div className={s.editor}>
        <textarea
          className={s.ta}
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder={tab === 'monthly'
            ? `Write notes for ${MONTHS[month]}…`
            : 'Write notes for this range…'}
          rows={5}
        />
        <span className={s.chars}>{text.length}</span>
      </div>

      <div className={s.actions}>
        <button className={s.clrBtn} onClick={clearNote} disabled={!text.trim()}>Clear</button>
        <button
          className={flash ? `${s.saveBtn} ${s.saved}` : s.saveBtn}
          onClick={saveNow}
          disabled={tab === 'range' && !hasRange}
        >
          {flash ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      {rangeNotes.length > 0 && (
        <div className={s.list}>
          <p className={s.listTitle}>Saved this month</p>
          <ul>
            {rangeNotes.map(([k, v]) => {
              const [a, b] = k.split('_');
              return (
                <li key={k} className={s.item}>
                  <span className={s.itemDate}>{a === b ? a : `${a} → ${b}`}</span>
                  <span className={s.itemText}>{v.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
