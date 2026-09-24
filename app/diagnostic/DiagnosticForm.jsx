"use client";

const noteGroups = [
  {
    id: "top-note",
    label: "Top note",
    helper: "The first air around the fragrance.",
    options: ["Bergamot", "Pink pepper", "Green leaves", "Fresh air", "Soft citrus"]
  },
  {
    id: "middle-note",
    label: "Middle note",
    helper: "The heart that stays close to skin.",
    options: ["Lily", "Amber", "Moss", "Fougere", "Dry woods"]
  },
  {
    id: "low-note",
    label: "Low note",
    helper: "The final trace left in the room.",
    options: ["Oud", "Patchouli", "Ambered woods", "Musk", "Warm resin"]
  }
];

export default function DiagnosticForm() {
  return (
    <form className="diagnostic-form">
      <div className="diagnostic-form__panel diagnostic-form__panel--dark">
        <p className="eyebrow">01 / Mood</p>
        <label>
          <span>Hour</span>
          <select name="hour" defaultValue="">
            <option value="" disabled>Select an hour</option>
            <option>Before dawn</option>
            <option>Midday heat</option>
            <option>Golden hour</option>
            <option>Deep desert night</option>
          </select>
        </label>
        <label>
          <span>Feeling</span>
          <select name="feeling" defaultValue="">
            <option value="" disabled>Select a feeling</option>
            <option>Quiet</option>
            <option>Wild</option>
            <option>Warm</option>
            <option>Lasting</option>
          </select>
        </label>
        <label>
          <span>Presence</span>
          <select name="presence" defaultValue="">
            <option value="" disabled>Select presence</option>
            <option>Soft and close</option>
            <option>Clean and moving</option>
            <option>Warm and intimate</option>
            <option>Deep and memorable</option>
          </select>
        </label>
      </div>

      <div className="diagnostic-form__panel">
        <p className="eyebrow">02 / Notes</p>
        {noteGroups.map((group) => (
          <label key={group.id}>
            <span>{group.label}</span>
            <select name={group.id} defaultValue="">
              <option value="" disabled>Choose {group.label.toLowerCase()}</option>
              {group.options.map((option) => <option key={option}>{option}</option>)}
            </select>
            <small>{group.helper}</small>
          </label>
        ))}
      </div>

      <div className="diagnostic-form__panel">
        <p className="eyebrow">03 / Wear</p>
        <label>
          <span>For</span>
          <select name="for" defaultValue="">
            <option value="" disabled>Select wearer</option>
            <option>Self</option>
            <option>Gift</option>
            <option>Shared ritual</option>
          </select>
        </label>
        <label>
          <span>Texture</span>
          <select name="texture" defaultValue="">
            <option value="" disabled>Select texture</option>
            <option>Clean</option>
            <option>Floral</option>
            <option>Woody</option>
            <option>Ambered</option>
          </select>
        </label>
        <div className="diagnostic-actions">
          <button type="submit">Find your fragrance</button>
          <a href="/shop/fragrances">View fragrances</a>
        </div>
      </div>
    </form>
  );
}
