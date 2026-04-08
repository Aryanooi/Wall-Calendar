import { useState, useEffect } from 'react';
import s from './Calendar.module.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
  }
  return cells;
}

function strip(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function same(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

function dkey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Calendar({ onMonthChange, onRangeChange, noteKeys = new Set() }) {
  const today = strip(new Date());
  const [mo, setMo] = useState(today.getMonth());
  const [yr, setYr] = useState(today.getFullYear());
  const [anim, setAnim] = useState(0);
  const [flipDir, setFlipDir] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState(null);

  const grid = getGrid(yr, mo);

  useEffect(() => { onMonthChange?.(mo, yr); }, [mo, yr]);
  useEffect(() => { onRangeChange?.({ start: rangeStart, end: rangeEnd }); }, [rangeStart, rangeEnd]);

  function runFlip(direction) {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDir(direction);
    setTimeout(() => {
      if (direction === 'left') {
        if (mo === 11) { setMo(0); setYr(y => y + 1); }
        else setMo(m => m + 1);
      } else {
        if (mo === 0) { setMo(11); setYr(y => y - 1); }
        else setMo(m => m - 1);
      }
      setAnim(n => n + 1);
      setFlipDir(direction === 'left' ? 'right' : 'left');
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDir(null);
      }, 400);
    }, 400);
  }

  function prevMonth() {
    runFlip('right');
  }

  function nextMonth() {
    runFlip('left');
  }

  function pickDate(date) {
    const d = strip(date);
    if (step === 0) {
      setRangeStart(d);
      setRangeEnd(null);
      setStep(1);
      setHover(null);
    } else {
      setStep(0);
      setHover(null);
      if (same(d, rangeStart)) {
        setRangeEnd(d);
      } else if (d < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(d);
      } else {
        setRangeEnd(d);
      }
    }
  }

  function clearRange() {
    setRangeStart(null);
    setRangeEnd(null);
    setStep(0);
    setHover(null);
  }

  const liveEnd = step === 1 && hover ? hover : rangeEnd;
  let vStart = rangeStart;
  let vEnd = liveEnd;
  if (vStart && vEnd && vEnd < vStart) {
    const tmp = vStart; vStart = vEnd; vEnd = tmp;
  }

  return (
    <div className={s.wrap}>
      <div className={s.hdr}>
        <button className={s.nav} onClick={prevMonth} aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className={s.title}>
          <span className={s.moName}>{MONTHS[mo]}</span>
          <span className={s.yrLabel}>{yr}</span>
        </div>
        <button className={s.nav} onClick={nextMonth} aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className={s.dowRow}>
        {DOW.map(d => <span key={d} className={s.dow}>{d}</span>)}
      </div>

      <div className={s.flipContainer}>
        <div
          key={anim}
          className={`${s.flipper} ${flipDir === 'left' ? s.flipOutLeft : ''} ${flipDir === 'right' ? s.flipOutRight : ''}`}
          onMouseLeave={() => step === 1 && setHover(null)}
        >
        {grid.map(date => {
          const thisMonth = date.getMonth() === mo;
          const isToday = same(date, today);
          const isStart = same(date, vStart);
          const isEnd = same(date, vEnd);
          const wknd = date.getDay() === 0 || date.getDay() === 6;

          let inRange = false;
          if (vStart && vEnd) {
            const d = strip(date);
            inRange = d >= vStart && d <= vEnd;
          }
          const isMid = inRange && !isStart && !isEnd;

          let cls = s.cell;
          if (!thisMonth) cls += ' ' + s.other;
          if (isToday)    cls += ' ' + s.today;
          if (isStart)    cls += ' ' + s.start;
          if (isEnd)      cls += ' ' + s.end;
          if (isMid)      cls += ' ' + s.mid;
          if (wknd && thisMonth && !isStart && !isEnd) cls += ' ' + s.wknd;

          return (
            <button
              key={dkey(date)}
              className={cls}
              onClick={() => thisMonth && pickDate(date)}
              onMouseEnter={() => thisMonth && step === 1 && setHover(strip(date))}
              tabIndex={thisMonth ? 0 : -1}
              type="button"
            >
              {inRange && <span className={`${s.fill} ${isStart ? s.fillL : ''} ${isEnd ? s.fillR : ''}`} />}
              <span className={s.num}>{date.getDate()}</span>
              {noteKeys.has(dkey(date)) && thisMonth && <span className={s.dot} />}
            </button>
          );
        })}
        </div>
      </div>

      {rangeStart && (
        <div className={s.bar}>
          <div className={s.chip}>
            <span>From</span>
            <strong>{(vStart || rangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
          </div>
          {vEnd && !same(vStart, vEnd) && (
            <>
              <span className={s.arrow}>→</span>
              <div className={`${s.chip} ${s.chipEnd}`}>
                <span>To</span>
                <strong>{vEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
              </div>
            </>
          )}
          <button className={s.clearBtn} onClick={clearRange}>✕</button>
        </div>
      )}
    </div>
  );
}
