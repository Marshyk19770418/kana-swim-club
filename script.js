const grid = document.getElementById('staffGrid');
const viewer = document.getElementById('viewer');
const closeBtn = document.querySelector('.viewer__close');
const mainImage = document.getElementById('mainImage');
const mainVideo = document.getElementById('mainVideo');
const mediaButtons = document.getElementById('mediaButtons');

const viewerNo = document.getElementById('viewerNo');
const viewerName = document.getElementById('viewerName');
const viewerAge = document.getElementById('viewerAge');
const viewerHeight = document.getElementById('viewerHeight');
const viewerBirthplace = document.getElementById('viewerBirthplace');
const viewerCatch = document.getElementById('viewerCatch');

let staffData = [];
let activeStaffIndex = 0;
let lastScrollY = 0;

init();

async function init() {
  if (!grid || !viewer || !mainImage || !mainVideo || !mediaButtons) {
    console.error('KANA SWIM CLUB: 必要なHTML要素が見つかりません。');
    return;
  }

  try {
    const response = await fetch(`staff.json?ver=${Date.now()}`);
    if (!response.ok) throw new Error(`staff.jsonの読み込み失敗: ${response.status}`);
    staffData = await response.json();
    renderCards(staffData);
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="load-error">スタッフデータを読み込めませんでした。</p>';
  }
}

function renderCards(data) {
  grid.innerHTML = data.map((s, i) => `
    <article class="card" tabindex="0" role="button" aria-label="${escapeHtml(s.no)} ${escapeHtml(s.name)}" data-index="${i}">
      <img class="card__img" src="${escapeHtml(s.cover)}" alt="${escapeHtml(s.no)} ${escapeHtml(s.name)}" loading="lazy">
      <div class="card__overlay">
        <p class="card__no">PROFILE FILE No.${escapeHtml(s.no)}</p>
        <h3>${escapeHtml(s.name)}</h3>
        <p class="card__meta">${escapeHtml(String(s.age))}歳 / ${escapeHtml(String(s.height))}cm / ${escapeHtml(s.birthplace)}</p>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openViewer(Number(card.dataset.index)));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(Number(card.dataset.index));
      }
    });
  });
}

function openViewer(index) {
  activeStaffIndex = index;
  const s = staffData[index];
  if (!s) return;

  lastScrollY = window.scrollY;

  viewerNo.textContent = `PROFILE FILE No.${s.no}`;
  viewerName.textContent = s.name;
  viewerAge.textContent = `${s.age}歳`;
  viewerHeight.textContent = `${s.height}cm`;
  viewerBirthplace.textContent = s.birthplace;
  viewerCatch.textContent = s.catch || '';

  const media = buildMediaList(s);
  renderMediaButtons(media);

  if (!viewer.open) {
    viewer.showModal();
  }

  document.body.classList.add('is-viewer-open');
  viewer.scrollTop = 0;

  setMedia(media[0]);
}

function buildMediaList(s) {
  const list = [];

  if (s.cover) {
    list.push({ label: 'PROFILE', type: 'image', src: s.cover });
  }

  if (s.ksc) {
    list.push({ label: 'KSC', type: 'image', src: s.ksc });
  }

  if (s.kscex) {
    list.push({ label: 'KSC EX', type: 'image', src: s.kscex });
  }

  if (s.kscexx) {
    list.push({ label: 'KSC EXX', type: 'image', src: s.kscexx });
  }

  if (s.kscexxx) {
    list.push({ label: 'KSC EXXX', type: 'image', src: s.kscexxx });
  }

  if (s.pv) {
    list.push({ label: 'PV', type: 'image', src: s.pv });
  }

  if (s.pvex) {
    list.push({ label: 'PV EX', type: 'image', src: s.pvex });
  }

  if (s.pvexx) {
  list.push({ label: 'PV EXX', type: 'image', src: s.pvexx });
  }

 if (s.pvexxx) {
  list.push({ label: 'PV EXXX', type: 'image', src: s.pvexxx });
  }

  if (s.ex) {
    list.push({ label: 'EX', type: 'image', src: s.ex });
  }

  if (s.exx) {
    list.push({ label: 'EXX', type: 'image', src: s.exx });
  }

  if (s.exxx) {
    list.push({ label: 'EXXX', type: 'image', src: s.exxx });
  }

  if (s.exxxx) {
    list.push({ label: 'EXXXX', type: 'image', src: s.exxxx });
  }

  if (Array.isArray(s.videos)) {
    s.videos.forEach(video => {
      if (video && video.src) {
        list.push({
          label: video.label || 'MOVIE',
          type: 'video',
          src: video.src
        });
      }
    });
  }

  return list;
}

function renderMediaButtons(media) {
  mediaButtons.innerHTML = '';

  media.forEach((m, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = m.label;
    btn.dataset.mediaIndex = String(index);
    btn.addEventListener('click', () => setMedia(m));
    mediaButtons.appendChild(btn);
  });
}

function setMedia(m) {
  if (!m) return;

  document.querySelectorAll('.media-buttons button').forEach(button => {
    button.classList.toggle('active', button.textContent === m.label);
  });

  mainVideo.pause();
  mainVideo.removeAttribute('src');
  mainVideo.load();
  mainVideo.style.display = 'none';
  mainImage.style.display = 'none';

  if (m.type === 'image') {
    mainImage.src = m.src;
    mainImage.alt = `${viewerName.textContent} ${m.label}`;
    mainImage.style.display = 'block';
    return;
  }

  mainVideo.src = m.src;
  mainVideo.style.display = 'block';
  mainVideo.controls = true;
  mainVideo.playsInline = true;
  mainVideo.load();

  // iPhone/Safariでは自動再生が止められる場合があるので、失敗してもボタン再生できるようにする。
  const playPromise = mainVideo.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // ユーザーが動画内の再生ボタンを押せば再生できます。
    });
  }
}

function closeViewer() {
  mainVideo.pause();
  mainVideo.removeAttribute('src');
  mainVideo.load();

  if (viewer.open) {
    viewer.close();
  }

  document.body.classList.remove('is-viewer-open');

  requestAnimationFrame(() => {
    window.scrollTo({ top: lastScrollY, behavior: 'instant' });
  });
}

closeBtn.addEventListener('click', closeViewer);

viewer.addEventListener('cancel', event => {
  event.preventDefault();
  closeViewer();
});

viewer.addEventListener('click', event => {
  if (event.target === viewer) {
    closeViewer();
  }
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
