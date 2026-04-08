import s from './ImageSection.module.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const quotes = [
  'Every new month is a fresh chapter waiting to be written.',
  'Time flies, but memories linger — capture yours.',
  'Make each day count within the gift of now.',
  'A new month, a new canvas, a new beginning.',
  'Life is the sum of all your choices.',
  'The best time for new beginnings is now.',
  'Wherever you go, go with all your heart.',
  'Small steps every day lead to big changes.',
  'Be the energy you want to attract.',
  'Your only limit is your mind.',
  'Dream big. Start small. Act now.',
  'Chase the sun and let it warm your soul.',
];

export default function ImageSection({ month, year }) {
  return (
    <section className={s.section}>
      <div className={s.imgWrap}>
        <img src="/hero.png" alt="Calendar hero" className={s.img} draggable="false" />
        <div className={s.overlay} />
      </div>

      <div className={s.content}>
        <div className={s.badge}>
          <span className={s.badgeDot} />
          Wall Calendar
        </div>

        <p className={s.year}>{year}</p>
        <h1 className={s.mo}>{MONTHS[month]}</h1>
        <div className={s.line} />

        <blockquote className={s.quote}>
          <span className={s.q}>"</span>
          {quotes[month % quotes.length]}
        </blockquote>

        <div className={s.dots}>
          <div className={s.d1} />
          <div className={s.d2} />
          <div className={s.d3} />
        </div>
      </div>
    </section>
  );
}
