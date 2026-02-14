/* Interactive envelope + editable letter
   - Click the envelope to open/close
   - Click the letter to edit text (contenteditable)
   - Copy the message using controls
   - Floating hearts are generated dynamically
*/
document.addEventListener('DOMContentLoaded', ()=>{
  const envelope = document.getElementById('envelope');
  const toggleBtn = document.getElementById('toggleBtn');
  const copyBtn = document.getElementById('copyBtn');
  const letter = document.getElementById('letter');
  const letterContent = document.getElementById('letterContent');
  const heartsContainer = document.getElementById('hearts');

  function setOpen(open){
  // toggle visual state
  envelope.classList.toggle('open', open);
  envelope.setAttribute('aria-pressed', open ? 'true' : 'false');
  letter.setAttribute('aria-hidden', open ? 'false' : 'true');
  toggleBtn.textContent = open ? 'Închide scrisoarea' : 'Deschide scrisoarea';

  if(open){
    createSparkles();

    // focus the editable area so keyboard and scrollbars become active immediately
    try {
      letterContent.focus({ preventScroll: false });
      // force reflow / ensure scroll region established
      letterContent.scrollTop = letterContent.scrollTop;
    } catch(e) { /* ignore if browser prevents programmatic focus */ }

  } else {
    // blur when closed to hide keyboard / outlines
    try { letterContent.blur(); } catch(e) {}
  }
}

  // Toggle when envelope or the button is clicked
  function toggle(){
    setOpen(!envelope.classList.contains('open'));
  }
  envelope.addEventListener('click', (e)=>{
    // if user clicked inside the editable area, don't toggle
    if (e.target.closest('.letter-content')) return;
    toggle();
  });
  toggleBtn.addEventListener('click', toggle);

  // Keyboard accessibility
  envelope.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault(); toggle();
    }
  });

  // placeholder helper for contenteditable
  function updatePlaceholder(){
    const empty = letterContent.textContent.trim().length === 0;
    letterContent.classList.toggle('is-empty', empty);
  }
  letterContent.addEventListener('input', updatePlaceholder);
  letterContent.addEventListener('blur', updatePlaceholder);
  updatePlaceholder();

  // Copy text
  copyBtn.addEventListener('click', async ()=>{
    const text = letterContent.textContent.trim();
    if(!text){
      flashButton(copyBtn, 'Write a message first');
      return;
    }
    try{
      await navigator.clipboard.writeText(text);
      flashButton(copyBtn, 'Copied!');
    }catch(err){
      flashButton(copyBtn, 'Unable to copy');
    }
  });

  // (download button removed — copy is the only export option now)


  function flashButton(btn, text){
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(()=> btn.textContent = original, 1600);
  }

  // Floating hearts generator (bigger + more frequent for extra cuteness)
  function makeHeart(){
    const h = document.createElement('div');
    h.className = 'heart';
    if(Math.random() > 0.6) h.classList.add('rose');

    const size = 18 + Math.round(Math.random()*48); // larger hearts
    h.style.setProperty('--size', `${size}px`);    // sync CSS variable for pseudo-elements
    h.style.width = `${size}px`;
    h.style.height = `${size}px`;
    h.style.left = (6 + Math.random()*88) + '%'; // avoid hard edges
    h.style.bottom = '-48px';
    h.style.opacity = (0.65 + Math.random()*0.35).toFixed(2);

    const duration = 4200 + Math.round(Math.random()*4200);
    h.style.animation = `floatUp ${duration}ms cubic-bezier(.2,.8,.2,1)`;
    heartsContainer.appendChild(h);

    // Remove after animation
    setTimeout(()=> h.remove(), duration + 50);
  }

  // Sparkles when envelope opens
  function createSparkles(){
    for(let i=0;i<10;i++){
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = (35 + Math.random()*30) + '%';
      s.style.top = (28 + Math.random()*22) + '%';
      const size = 6 + Math.round(Math.random()*10);
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      heartsContainer.appendChild(s);
      setTimeout(()=> s.remove(), 900);
    }
  }

  // Create a few at start and then periodically (faster)
  for(let i=0;i<10;i++){ setTimeout(makeHeart, i*200); }
  setInterval(makeHeart, 650);

  // Make sure clicking inside the letter doesn't close the envelope
  letterContent.addEventListener('click', (e)=>{
    // if the envelope is closed, open it when user clicks the content area
    if(!envelope.classList.contains('open')) setOpen(true);
  });

  // Auto-open support:
  // - Add `data-open-on-load="true"` to `<div id="envelope">` in the HTML to auto-open for recipients, OR
  // - open the page with `?open=1` in the URL.
  (function autoOpen(){
    const params = new URLSearchParams(location.search);
    const shouldAuto = envelope.dataset.openOnLoad === 'true' || params.get('open') === '1';
    if(shouldAuto){
      // small delay so the entrance feels natural
      setTimeout(()=> setOpen(true), 650);
    }
  })();
});
