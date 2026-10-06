const reelVideo = {
  id: 'reel',
  type: 'long',
  title: 'Um pouco do meu universo',
  subtitle: 'REEL DEMONSTRATIVO / 2026',
  youtube: 'COLE_AQUI_O_LINK_DO_YOUTUBE_DO_REEL'
};

const videos = [
  {
    id: 1,
    type: 'long',
    title: 'Um respiro lá fora',
    subtitle: 'Lifestyle · Filme de viagem',
    youtube: 'COLE_AQUI_O_LINK_DO_YOUTUBE_1'
  },
  {
    id: 2,
    type: 'short',
    title: 'No seu ritmo',
    subtitle: 'Esporte · Social media',
    youtube: 'COLE_AQUI_O_LINK_DO_YOUTUBE_2'
  },
  {
    id: 3,
    type: 'long',
    title: 'Aumenta o som',
    subtitle: 'Produto · Campanha',
    youtube: 'COLE_AQUI_O_LINK_DO_YOUTUBE_3'
  }
];

const playlist = [
  {
    title: 'Mii Maker Editing Mii',
    src: 'music/miimaker.mp3',
    cover: 'covers/miimaker.png'
  },
  {
    title: 'Wii Party',
    src: 'music/wiiparty.mp3',
    cover: 'covers/wiiparty.png'
  },
  {
    title: 'Aquatic Ambience',
    src: 'music/aquatic.mp3',
    cover: 'covers/aquatic.png'
  }
];

const filterButtons = [...document.querySelectorAll('.filter-button')];
const projectGrid = document.getElementById('projectGrid');
const allCount = document.getElementById('allCount');
const shortCount = document.getElementById('shortCount');
const longCount = document.getElementById('longCount');
const reelThumbnail = document.getElementById('reelThumbnail');

const backgroundAudio = document.getElementById('backgroundAudio');
const musicPlayer = document.getElementById('musicPlayer');
const musicPlayerMini = document.getElementById('musicPlayerMini');
const musicCover = document.getElementById('musicCover');
const musicTitle = document.getElementById('musicTitle');
const musicPrev = document.getElementById('musicPrev');
const musicPlay = document.getElementById('musicPlay');
const musicNext = document.getElementById('musicNext');
const musicClose = document.getElementById('musicClose');
const musicMiniPrev = document.getElementById('musicMiniPrev');
const musicMiniPlay = document.getElementById('musicMiniPlay');
const musicMiniNext = document.getElementById('musicMiniNext');

let currentTrack = parseInt(localStorage.getItem('babiMusicTrackV2') || '0', 10);
if (!Number.isFinite(currentTrack) || currentTrack < 0 || currentTrack >= playlist.length) currentTrack = 0;

let musicDesiredPlaying = localStorage.getItem('babiMusicWantedV2') !== 'false';
let musicWasPlayingBeforeVideo = false;

let currentFilter = 'all';

function getYoutubeId(value) {
  if (!value) return null;

  const clean = value.trim();

  if (!clean || clean.startsWith('COLE_AQUI')) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  try {
    const url = new URL(clean);

    if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }

    const watchId = url.searchParams.get('v');
    if (watchId) return watchId;

    const parts = url.pathname.split('/').filter(Boolean);

    for (const segment of ['shorts', 'embed', 'live']) {
      const index = parts.indexOf(segment);
      if (index !== -1 && parts[index + 1]) return parts[index + 1];
    }
  } catch (_) {
    return null;
  }

  return null;
}

function getYoutubeThumbnail(value) {
  const id = getYoutubeId(value);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function applyYoutubeThumbnail(image, youtube, fallback = '') {
  if (!image) return;

  const id = getYoutubeId(youtube);

  if (!id) {
    if (fallback) image.src = fallback;
    return;
  }

  image.dataset.youtubeId = id;
  image.dataset.fallbackStage = 'maxres';
  image.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  image.addEventListener('error', () => {
    if (image.dataset.fallbackStage === 'maxres') {
      image.dataset.fallbackStage = 'hq';
      image.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      return;
    }

    if (fallback && image.dataset.fallbackStage === 'hq') {
      image.dataset.fallbackStage = 'local';
      image.src = fallback;
    }
  });
}

function getYoutubeEmbedUrl(value) {
  const id = getYoutubeId(value);
  if (!id) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    playsinline: '1',
    controls: '1',
    fs: '1',
    iv_load_policy: '3'
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function getVideoByKey(key) {
  if (String(key) === 'reel') return reelVideo;
  return videos.find((video) => String(video.id) === String(key)) || null;
}

function createProjectCard(video, index) {
  const article = document.createElement('article');
  article.className = `project ${video.type === 'short' ? 'project-short' : 'project-long'}`;
  article.dataset.format = video.type;

  const button = document.createElement('button');
  button.className = 'project-cover js-video';
  button.dataset.videoKey = video.id;
  button.setAttribute('aria-label', `Reproduzir ${video.title}`);

  const image = document.createElement('img');
  image.alt = video.title;
  image.loading = 'lazy';
  image.width = 1536;
  image.height = 864;
  applyYoutubeThumbnail(image, video.youtube);

  const format = document.createElement('span');
  format.className = 'project-format';
  format.textContent = video.type === 'short' ? '▯ 9:16' : '▭ 16:9';

  const play = document.createElement('span');
  play.className = 'project-play';
  play.textContent = '▶';

  button.append(image, format, play);

  const details = document.createElement('div');
  details.className = 'project-details';
  details.innerHTML = `
    <div>
      <h3>${video.title}</h3>
      <p>${video.subtitle || ''}</p>
    </div>
    <span class="project-arrow">↗</span>
  `;

  const demo = document.createElement('span');
  demo.className = 'project-demo';
  demo.textContent = `PROJETO / ${String(index + 1).padStart(2, '0')}`;

  article.append(button, details, demo);
  return article;
}

function updateCounts() {
  const shortTotal = videos.filter((video) => video.type === 'short').length;
  const longTotal = videos.filter((video) => video.type === 'long').length;

  if (allCount) allCount.textContent = String(videos.length).padStart(2, '0');
  if (shortCount) shortCount.textContent = String(shortTotal).padStart(2, '0');
  if (longCount) longCount.textContent = String(longTotal).padStart(2, '0');
}

function renderProjects() {
  if (!projectGrid) return;

  const visible = currentFilter === 'all'
    ? videos
    : videos.filter((video) => video.type === currentFilter);

  projectGrid.innerHTML = '';
  visible.forEach((video, index) => projectGrid.appendChild(createProjectCard(video, index)));
  projectGrid.classList.toggle('short-grid', currentFilter === 'short');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter || 'all';

    filterButtons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });

    renderProjects();
  });
});

/* =========================================
   MÚSICA
========================================= */

function updateMusicButton() {
  if (!backgroundAudio) return;
  const symbol = backgroundAudio.paused ? '▶' : '❚❚';
  if (musicPlay) musicPlay.textContent = symbol;
  if (musicMiniPlay) musicMiniPlay.textContent = symbol;
}

function saveMusicState() {
  if (!backgroundAudio) return;
  localStorage.setItem('babiMusicTrackV2', String(currentTrack));
  localStorage.setItem('babiMusicTimeV2', String(backgroundAudio.currentTime || 0));
  localStorage.setItem('babiMusicWantedV2', musicDesiredPlaying ? 'true' : 'false');
}

function loadMusic(index, restoreTime = false) {
  if (!backgroundAudio) return;

  currentTrack = (index + playlist.length) % playlist.length;
  const track = playlist[currentTrack];

  backgroundAudio.pause();
  backgroundAudio.src = track.src;
  backgroundAudio.preload = 'auto';

  if (musicCover) musicCover.src = track.cover;
  if (musicTitle) musicTitle.textContent = track.title;

  localStorage.setItem('babiMusicTrackV2', String(currentTrack));

  if (restoreTime) {
    const savedTime = parseFloat(localStorage.getItem('babiMusicTimeV2') || '0');
    backgroundAudio.addEventListener('loadedmetadata', () => {
      if (savedTime > 0 && savedTime < backgroundAudio.duration) {
        backgroundAudio.currentTime = savedTime;
      }
    }, { once: true });
  } else {
    localStorage.setItem('babiMusicTimeV2', '0');
  }

  backgroundAudio.load();
  updateMusicButton();
}

async function playMusic() {
  if (!backgroundAudio) return;

  musicDesiredPlaying = true;
  localStorage.setItem('babiMusicWantedV2', 'true');

  try {
    await backgroundAudio.play();
  } catch (_) {
    // Alguns navegadores só liberam áudio após a primeira interação.
  }

  updateMusicButton();
}

function pauseMusic() {
  if (!backgroundAudio) return;
  musicDesiredPlaying = false;
  localStorage.setItem('babiMusicWantedV2', 'false');
  backgroundAudio.pause();
  updateMusicButton();
}

function toggleMusic() {
  if (!backgroundAudio) return;
  if (backgroundAudio.paused) playMusic();
  else pauseMusic();
}

function changeTrack(direction) {
  const shouldPlay = musicDesiredPlaying;
  loadMusic(currentTrack + direction, false);

  if (shouldPlay) {
    backgroundAudio?.addEventListener('canplay', () => playMusic(), { once: true });
  }
}

function nextMusic() { changeTrack(1); }
function previousMusic() { changeTrack(-1); }

function showMiniPlayer() {
  if (!musicPlayer || !musicPlayerMini) return;

  localStorage.setItem('babiMusicMinimizedV2', 'true');
  musicPlayer.classList.add('is-fading-out');

  setTimeout(() => {
    musicPlayer.classList.add('is-hidden');
    musicPlayer.classList.remove('is-fading-out');

    musicPlayerMini.classList.remove('is-hidden', 'is-rising');
    musicPlayerMini.classList.add('is-dropping');

    setTimeout(() => musicPlayerMini.classList.remove('is-dropping'), 350);
  }, 180);
}

function showMainPlayer() {
  if (!musicPlayer || !musicPlayerMini) return;

  localStorage.setItem('babiMusicMinimizedV2', 'false');
  musicPlayerMini.classList.remove('is-dropping');
  musicPlayerMini.classList.add('is-rising');

  setTimeout(() => {
    musicPlayerMini.classList.add('is-hidden');
    musicPlayerMini.classList.remove('is-rising');

    musicPlayer.classList.remove('is-hidden');
    musicPlayer.classList.add('is-fading-in');

    setTimeout(() => musicPlayer.classList.remove('is-fading-in'), 300);
  }, 230);
}

musicPlay?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleMusic();
});

musicMiniPlay?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleMusic();
});

musicNext?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  nextMusic();
});

musicMiniNext?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  nextMusic();
});

musicPrev?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  previousMusic();
});

musicMiniPrev?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  previousMusic();
});

musicClose?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  showMiniPlayer();
});

musicPlayerMini?.addEventListener('click', (event) => {
  if (event.target.closest('button')) return;
  showMainPlayer();
});

backgroundAudio?.addEventListener('ended', () => {
  const shouldPlay = musicDesiredPlaying;
  loadMusic(currentTrack + 1, false);
  if (shouldPlay) backgroundAudio?.addEventListener('canplay', () => playMusic(), { once: true });
});

backgroundAudio?.addEventListener('play', updateMusicButton);
backgroundAudio?.addEventListener('pause', updateMusicButton);
backgroundAudio?.addEventListener('timeupdate', saveMusicState);

const videoDialog = document.getElementById('videoDialog');
const videoDialogTitle = document.getElementById('videoDialogTitle');
const youtubePlayer = document.getElementById('youtubePlayer');

function openVideo(video) {
  if (!videoDialog || !youtubePlayer || !video) return;

  const embedUrl = getYoutubeEmbedUrl(video.youtube);

  if (!embedUrl) {
    console.warn(`Adicione um link válido do YouTube ao vídeo "${video.title}" em script.js.`);
    return;
  }

  musicWasPlayingBeforeVideo = Boolean(backgroundAudio && !backgroundAudio.paused);
  if (musicWasPlayingBeforeVideo && backgroundAudio) {
    backgroundAudio.pause();
    updateMusicButton();
  }

  if (videoDialogTitle) videoDialogTitle.textContent = video.title;

  youtubePlayer.src = embedUrl;
  videoDialog.classList.add('open');
  videoDialog.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('.js-video');
  if (!trigger) return;

  const video = getVideoByKey(trigger.dataset.videoKey);
  openVideo(video);
});

const contactDialog = document.getElementById('contactDialog');

document.querySelectorAll('.js-contact').forEach((button) => {
  button.addEventListener('click', () => {
    contactDialog?.classList.add('open');
    contactDialog?.setAttribute('aria-hidden', 'false');
  });
});

function closeDialog(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');
  dialog.setAttribute('aria-hidden', 'true');

  if (dialog === videoDialog && youtubePlayer) {
    youtubePlayer.src = '';
    document.body.style.overflow = '';

    if (musicWasPlayingBeforeVideo && musicDesiredPlaying) {
      playMusic();
    }
    musicWasPlayingBeforeVideo = false;
  }
}

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.close);
    closeDialog(dialog);
  });
});

[videoDialog, contactDialog].forEach((dialog) => {
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.dialog-backdrop.open').forEach(closeDialog);
});

/* =========================================
   INICIAR / RESTAURAR PLAYER
========================================= */

loadMusic(currentTrack, true);

const isMusicMinimized = localStorage.getItem('babiMusicMinimizedV2') === 'true';
if (isMusicMinimized) {
  musicPlayer?.classList.add('is-hidden');
  musicPlayerMini?.classList.remove('is-hidden');
} else {
  musicPlayer?.classList.remove('is-hidden');
  musicPlayerMini?.classList.add('is-hidden');
}

async function tryAutoplayMusic() {
  if (!musicDesiredPlaying || !backgroundAudio) return;
  try {
    await backgroundAudio.play();
  } catch (_) {
    // O navegador pode exigir a primeira interação do visitante.
  }
  updateMusicButton();
}

backgroundAudio?.addEventListener('canplay', tryAutoplayMusic, { once: true });
tryAutoplayMusic();

async function unlockMusicOnFirstInteraction() {
  if (!musicDesiredPlaying || !backgroundAudio || !backgroundAudio.paused) return;

  try {
    await backgroundAudio.play();
    updateMusicButton();
    document.removeEventListener('pointerdown', unlockMusicOnFirstInteraction);
    document.removeEventListener('keydown', unlockMusicOnFirstInteraction);
  } catch (_) {}
}

document.addEventListener('pointerdown', unlockMusicOnFirstInteraction);
document.addEventListener('keydown', unlockMusicOnFirstInteraction);
window.addEventListener('beforeunload', saveMusicState);

applyYoutubeThumbnail(reelThumbnail, reelVideo.youtube);
updateCounts();
renderProjects();
