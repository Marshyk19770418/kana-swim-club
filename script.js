const grid = document.getElementById('staffGrid');
const viewer = document.getElementById('viewer');
const closeBtn = document.querySelector('.viewer__close');
const mainImage = document.getElementById('mainImage');
const mainVideo = document.getElementById('mainVideo');
const mediaButtons = document.getElementById('mediaButtons');
let staffData = [];

fetch('staff.json')
  .then(r => r.json())
  .then(data => {
    staffData = data;
    renderCards(data);
  });

function renderCards(data){
  grid.innerHTML = data.map((s, i) => `
    <article class="card" tabindex="0" role="button" aria-label="${s.no} ${s.name}" data-index="${i}">
      <img class="card__img" src="${s.cover}" alt="${s.no} ${s.name}">
      <div class="card__overlay">
        <p class="card__no">PROFILE FILE No.${s.no}</p>
        <h3>${s.name}</h3>
        <p class="card__meta">${s.age}歳 / ${s.height}cm / ${s.birthplace}</p>
      </div>
    </article>`).join('');
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openViewer(staffData[card.dataset.index]));
    card.addEventListener('keydown', e => { if(e.key === 'Enter') openViewer(staffData[card.dataset.index]); });
  });
}

function openViewer(s){
  document.getElementById('viewerNo').textContent = `PROFILE FILE No.${s.no}`;
  document.getElementById('viewerName').textContent = s.name;
  document.getElementById('viewerAge').textContent = `${s.age}歳`;
  document.getElementById('viewerHeight').textContent = `${s.height}cm`;
  document.getElementById('viewerBirthplace').textContent = s.birthplace;
  document.getElementById('viewerCatch').textContent = s.catch;
  mediaButtons.innerHTML = '';
  const media = [
    {label:'PROFILE', type:'image', src:s.cover},
    {label:'KSC', type:'image', src:s.ksc},
    ...s.videos.map(v => ({...v, type:'video'}))
  ];
  media.forEach((m, idx) => {
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.addEventListener('click', () => setMedia(m, btn));
    mediaButtons.appendChild(btn);
    if(idx === 0) setTimeout(() => setMedia(m, btn));
  });
  if(!viewer.open) viewer.showModal();
}

function setMedia(m, btn){
  document.querySelectorAll('.media-buttons button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  mainVideo.pause();
  if(m.type === 'image'){
    mainVideo.style.display = 'none';
    mainImage.style.display = 'block';
    mainImage.src = m.src;
  } else {
    mainImage.style.display = 'none';
    mainVideo.style.display = 'block';
    mainVideo.src = m.src;
    mainVideo.load();
  }
}

closeBtn.addEventListener('click', () => {
  mainVideo.pause();
  viewer.close();
});
viewer.addEventListener('click', e => {
  const rect = viewer.getBoundingClientRect();
  const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if(outside){ mainVideo.pause(); viewer.close(); }
});
