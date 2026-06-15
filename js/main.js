// Sliding active bar in the main nav (URL-driven active state)
(function initNavBar() {
  const menu = document.querySelector('.nav__menu');
  if (!menu) return;
  const links = Array.from(menu.querySelectorAll('.nav__link'));
  if (!links.length) return;

  const bar = document.createElement('span');
  bar.className = 'nav__bar';
  menu.appendChild(bar);

  function moveBar(target) {
    if (!target) {
      bar.classList.remove('is-ready');
      return;
    }
    const linkRect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    bar.style.transform = `translateX(${linkRect.left - menuRect.left}px)`;
    bar.style.width = `${linkRect.width}px`;
    bar.classList.add('is-ready');
  }

  function pageOf(p) {
    return p.split('/').pop() || 'index.html';
  }

  // Determine which link matches the current URL
  function findActiveByURL() {
    const curPath = pageOf(window.location.pathname);
    const curHash = window.location.hash;
    // Pass 1: exact pathname + hash match
    for (const link of links) {
      if (pageOf(link.pathname) === curPath && link.hash === curHash) return link;
    }
    // Pass 2: pathname matches, link itself has no hash (e.g., /about.html on about.html#anything)
    for (const link of links) {
      if (pageOf(link.pathname) === curPath && !link.hash) return link;
    }
    return null;
  }

  function setActive(target) {
    links.forEach((l) => l.classList.toggle('active', l === target));
    moveBar(target);
  }

  // Initial active state derived from URL
  requestAnimationFrame(() => setActive(findActiveByURL()));

  // Click → optimistic active toggle (browser then navigates)
  links.forEach((link) => {
    link.addEventListener('click', () => setActive(link));
  });

  // Same-page anchor change (e.g., #service → #review) → recompute active
  window.addEventListener('hashchange', () => setActive(findActiveByURL()));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const cur = menu.querySelector('.nav__link.active');
      if (cur) moveBar(cur);
    }, 100);
  });
})();

// Auto-fill footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Contact form (no backend — replace handler with real submission later)
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = '모든 필드를 올바르게 입력해주세요.';
      return;
    }
    status.textContent = '메시지가 전송되었습니다. (데모)';
    form.reset();
  });
}

// Driver carousel (5 profiles rotating through the phone mockup)
(function initDriverCarousel() {
  const root = document.querySelector('[data-drivers]');
  if (!root) return;

  const drivers = [
    {
      name: '김도현 기사님',
      avatar: 'profile_5-1.webp',
      rectAvatar: 'profil_4-2.webp',
      stars: 4.8,
      reviews: 82,
      exp: '10년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '10년', accident: '10년', area: '서울, 경기권', field: '단체 관광·공항' },
    },
    {
      name: '이상훈 기사님',
      avatar: 'profile_2-1.webp',
      rectAvatar: 'profile_2-2.webp',
      stars: 4.7,
      reviews: 64,
      exp: '6년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '6년', accident: '6년', area: '경기, 인천권', field: '학생 통학, 셔틀' },
    },
    {
      name: '박정우 기사님',
      avatar: 'profile_1-1.webp',
      rectAvatar: 'profil_3-2.webp',
      stars: 4.8,
      reviews: 95,
      exp: '8년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n만족도가 높은 베스트 기사님입니다.',
      details: { career: '8년', accident: '8년', area: '부산, 경남권', field: '장거리, 단체여행' },
    },
    {
      name: '최민석 기사님',
      avatar: 'frofile_4-1.webp',
      rectAvatar: 'profil_4-2.webp',
      stars: 4.9,
      reviews: 112,
      exp: '12년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '12년', accident: '11년', area: '강원, 충청권', field: '장거리 단체 관광' },
    },
    {
      name: '정한별 기사님',
      avatar: 'profile_1-1.webp',
      rectAvatar: 'profile_1-2.webp',
      stars: 4.8,
      reviews: 73,
      exp: '9년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '9년', accident: '9년', area: '수도권', field: '학생 통학, 단체' },
    },
  ];

  const total = drivers.length;
  const rail = root.querySelector('[data-rail]');
  const phoneTrack = root.querySelector('[data-phone-track]');
  const dotsContainer = root.querySelector('[data-dots]');

  // Number of side-card slots laid out on the rail. Odd so the middle slot
  // sits dead-center behind the phone; the rest fan out to either side.
  const RAIL_NODES = 9;
  const CENTER = (RAIL_NODES - 1) / 2;

  dotsContainer.innerHTML = drivers.map(() => '<span></span>').join('');
  const dots = Array.from(dotsContainer.children);

  function ratingHTML(stars, reviews) {
    return `<span class="star">★</span> <strong>${stars}</strong> <span class="count">(${reviews}건)</span>`;
  }

  // Compact side card (no 기사님 정보 — that's exclusive to the phone)
  function cardHTML(d) {
    return `<article class="driver-card">
      <img class="driver-card__avatar" src="assets/${d.avatar}" alt="">
      <h3 class="driver-card__name">${d.name}</h3>
      <div class="driver-card__rating">${ratingHTML(d.stars, d.reviews)}</div>
      <span class="driver-card__badge">${d.exp}</span>
      <p class="driver-card__text">${d.desc.replace(/\n/g, '<br>')}</p>
    </article>`;
  }

  const DETAIL_ICONS = {
    career: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>',
    accident: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L20 6 V12 C20 17, 16 20, 12 21 C8 20, 4 17, 4 12 V6 Z"/><polyline points="9 12 11 14 15 10"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22 C8 17, 5 13, 5 10 A7 7 0 0 1 19 10 C19 13, 16 17, 12 22 Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    field: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20 C3 16, 5 14, 9 14 C13 14, 15 16, 15 20"/><circle cx="17" cy="9" r="2.5"/><path d="M15 19 C15 16.5, 17 15, 19.5 15"/></svg>',
  };
  const DETAIL_LABELS = { career: '경력', accident: '무사고', area: '운행 지역', field: '전문 분야' };

  // Full phone page — bigger, with the 기사님 정보 block
  function pageHTML(d) {
    const rows = ['career', 'accident', 'area', 'field'].map((key) => `
      <li>${DETAIL_ICONS[key]}
        <span class="label">${DETAIL_LABELS[key]}</span>
        <strong class="value">${d.details[key]}</strong>
      </li>`).join('');
    return `<div class="phone__page">
      <div class="phone__top">
        <img class="phone__avatar" src="assets/${d.rectAvatar}" alt="">
        <div class="phone__info">
          <h3 class="phone__name">${d.name}</h3>
          <div class="phone__rating">${ratingHTML(d.stars, d.reviews)}</div>
          <span class="phone__badge">${d.exp}</span>
        </div>
      </div>
      <p class="phone__desc">${d.desc.replace(/\n/g, '<br>')}</p>
      <div class="phone__details">
        <h4 class="phone__details-title">기사님 정보</h4>
        <ul class="phone__list">${rows}</ul>
      </div>
    </div>`;
  }

  const wrap = (n) => ((n % total) + total) % total;

  let active = 0; // driver shown in the phone / center slot

  function buildRail() {
    rail.innerHTML = Array.from({ length: RAIL_NODES }, (_, i) =>
      cardHTML(drivers[wrap(active + (i - CENTER))])
    ).join('');
  }

  // Phone holds 3 pages: prev / current / next. Baseline shows the middle one.
  function buildPhone() {
    phoneTrack.innerHTML =
      pageHTML(drivers[wrap(active - 1)]) +
      pageHTML(drivers[active]) +
      pageHTML(drivers[wrap(active + 1)]);
  }

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
  }

  // Distance (px) the rail travels for one step = card width + gap.
  function slotWidth() {
    const card = rail.querySelector('.driver-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function reset() {
    rail.style.transition = 'none';
    phoneTrack.style.transition = 'none';
    rail.style.transform = 'translateX(0)';
    phoneTrack.style.transform = 'translateX(-100%)';
  }

  buildRail();
  buildPhone();
  reset();
  updateDots();

  const interval = 3500;
  const slideDur = 600;
  let timer = null;
  let animating = false;

  function step() {
    if (animating) return;
    animating = true;

    const ease = `transform ${slideDur}ms cubic-bezier(0.45, 0, 0.15, 1)`;
    rail.style.transition = ease;
    phoneTrack.style.transition = ease;
    // Slide everything one slot to the left: the next driver glides in from
    // the right toward the center while the phone page advances in sync.
    rail.style.transform = `translateX(${-slotWidth()}px)`;
    phoneTrack.style.transform = 'translateX(-200%)';

    setTimeout(() => {
      active = wrap(active + 1);
      buildRail();
      buildPhone();
      reset();
      updateDots();
      // force reflow so the no-transition reset is committed before resuming
      void rail.offsetWidth;
      animating = false;
    }, slideDur);
  }

  function start() {
    stop();
    timer = setInterval(step, interval);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  window.addEventListener('resize', reset);
  start();
})();

// About page: tabs (인사말 / 찾아오는 길)
(function initAboutTabs() {
  const root = document.querySelector('[data-about-tabs]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[data-panel]'));
  const panels = Array.from(document.querySelectorAll('[data-panel-content]'));

  function show(key) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.panel === key));
    panels.forEach((p) => {
      const visible = p.dataset.panelContent === key;
      if (visible) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const key = tab.dataset.panel;
      show(key);
      const url = new URL(window.location);
      url.searchParams.set('p', key);
      window.history.replaceState({}, '', url);
    });
  });

  // Initial: read ?p=
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('p');
  if (initial && panels.some((p) => p.dataset.panelContent === initial)) {
    show(initial);
  }
})();

// Login form (demo — no backend)
(function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  const status = document.getElementById('login-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = '이메일과 비밀번호를 입력해주세요.';
      status.style.color = 'var(--red)';
      return;
    }
    status.textContent = '로그인되었습니다. (데모)';
    status.style.color = 'var(--navy)';
  });
})();

// Signup form (demo — no backend)
(function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const status = document.getElementById('signup-status');
  const agreeAll = document.getElementById('agree-all');

  // "전체 동의" toggles all child checkboxes
  if (agreeAll) {
    const childAgrees = form.querySelectorAll('.auth-agree__list input[type="checkbox"]');
    agreeAll.addEventListener('change', () => {
      childAgrees.forEach((c) => { c.checked = agreeAll.checked; });
    });
    childAgrees.forEach((c) => {
      c.addEventListener('change', () => {
        agreeAll.checked = Array.from(childAgrees).every((cc) => cc.checked);
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = form.elements['password'].value;
    const pwc = form.elements['password-confirm'].value;
    if (pw !== pwc) {
      status.textContent = '비밀번호가 일치하지 않습니다.';
      status.style.color = 'var(--red)';
      return;
    }
    if (!form.checkValidity()) {
      status.textContent = '필수 항목과 약관 동의를 확인해주세요.';
      status.style.color = 'var(--red)';
      return;
    }
    status.textContent = '회원가입이 완료되었습니다. (데모)';
    status.style.color = 'var(--navy)';
  });
})();

// Vehicles sub-page: tabs + arrows switch hero / seat / name / driver
(function initVehicleTabs() {
  const tabsRoot = document.querySelector('[data-tabs]');
  if (!tabsRoot) return;

  const vehicles = {
    '16': {
      name: '16인승 럭셔리 밴',
      car: 'car_16.webp',
      seat: 'detail_16.webp',
      driver: {
        name: '김도현 기사님', photo: 'profile_1-2.webp',
        stars: 4.8, reviewCount: 82,
        exp: '10년 이상 경력',
        desc: '편안하고 프라이빗한 이동,<br>고객 만족도가 높은 베스트 기사님입니다.',
        details: { career: '10년', accident: '10년', area: '서울, 경기권', field: '공항 이동·VIP' },
        reviews: [
          { name: '박OO 고객님', stars: 5, score: '5.0', text: '공항 이동에 이용했는데 도착 시간 딱<br>맞춰주시고 짐도 친절하게 도와주셨어요.', date: '2024.05.03' },
          { name: '윤OO 고객님', stars: 5, score: '4.9', text: '기사님이 노련하셔서 안심됐고,<br>차량도 새 차처럼 깔끔했습니다.', date: '2024.04.18' },
        ],
      },
    },
    '25': {
      name: '25인승 미니버스',
      car: 'car_25.webp',
      seat: 'detail_25.webp',
      driver: {
        name: '이상훈 기사님', photo: 'profile_2-2.webp',
        stars: 4.7, reviewCount: 64,
        exp: '6년 이상 경력',
        desc: '효율적인 단체 이동,<br>친절한 응대로 만족도가 높은 기사님입니다.',
        details: { career: '6년', accident: '6년', area: '경기, 인천권', field: '학생 통학·셔틀' },
        reviews: [
          { name: '한OO 고객님', stars: 5, score: '5.0', text: '학교 행사 셔틀로 이용했는데 학생들<br>안전에 정말 신경 써주셨어요.', date: '2024.05.20' },
          { name: '오OO 고객님', stars: 5, score: '4.8', text: '예약부터 운행까지 매끄러웠고,<br>시간 약속도 정확했습니다.', date: '2024.04.02' },
        ],
      },
    },
    '32': {
      name: '32인승 우등버스',
      car: 'car_32.webp',
      seat: 'detail_32.webp',
      driver: {
        name: '박정우 기사님', photo: 'profil_3-2.webp',
        stars: 4.8, reviewCount: 98,
        exp: '8년 이상 경력',
        desc: '안전 운행은 기본, 친절함은 덤!<br>고객 만족도가 높은 베스트 기사님입니다.',
        details: { career: '8년', accident: '8년', area: '부산, 경남권', field: '장거리·단체여행' },
        reviews: [
          { name: '김OO 고객님', stars: 5, score: '5.0', text: '시간 약속도 정확하고 운전도 정말<br>편안했어요. 다음에도 꼭 이용할게요!', date: '2024.03.12' },
          { name: '이OO 고객님', stars: 5, score: '4.8', text: '장거리 여행이었는데 피로감 없이<br>안전하게 잘 다녀왔습니다. 감사합니다!', date: '2024.02.18' },
        ],
      },
    },
    '45': {
      name: '45인승 대형버스',
      car: 'car_45.webp',
      seat: 'detail_45.webp',
      driver: {
        name: '최민석 기사님', photo: 'profil_4-2.webp',
        stars: 4.9, reviewCount: 112,
        exp: '12년 이상 경력',
        desc: '대규모 단체 이동에 강한<br>베테랑 기사님입니다.',
        details: { career: '12년', accident: '11년', area: '강원, 충청권', field: '단체 관광·장거리' },
        reviews: [
          { name: '정OO 고객님', stars: 5, score: '5.0', text: '회사 워크샵으로 45인승 단체 이용했는데<br>모두가 만족했습니다.', date: '2024.05.11' },
          { name: '최OO 고객님', stars: 5, score: '4.9', text: '운전 매끄럽고 베테랑 같은 안정감이<br>있었어요. 강력 추천합니다.', date: '2024.04.07' },
        ],
      },
    },
    'pr': {
      name: '프리미엄 21인승',
      car: 'car_pr.webp',
      seat: 'detail_32-1.webp',
      driver: {
        name: '정한별 기사님', photo: 'profile_1-2.webp',
        stars: 4.9, reviewCount: 73,
        exp: '9년 이상 경력',
        desc: '프리미엄 서비스에 특화된<br>품격 있는 운행을 제공합니다.',
        details: { career: '9년', accident: '9년', area: '수도권', field: '의전·VIP 행사' },
        reviews: [
          { name: '강OO 고객님', stars: 5, score: '5.0', text: '프리미엄 차량 처음 이용했는데 시트도<br>편하고 분위기가 정말 좋았어요.', date: '2024.05.25' },
          { name: '서OO 고객님', stars: 5, score: '5.0', text: '결혼식 셔틀로 이용했는데 하객분들이<br>다들 만족해하셨어요.', date: '2024.04.30' },
        ],
      },
    },
  };
  const order = ['16', '25', '32', '45', 'pr'];

  // Tab key → 둘러보기 gallery image number (프리미엄 21인승 uses the "21" set)
  const galleryNum = { '16': '16', '25': '25', '32': '32', '45': '45', 'pr': '21' };

  const heroImg = document.querySelector('[data-hero-img]');
  const seatImg = document.querySelector('[data-seat-img]');
  const nameEl = document.querySelector('[data-vehicle-name]');
  const galleryImgs = Array.from(document.querySelectorAll('[data-gallery-img]'));
  const hero = heroImg.closest('.v-hero');
  const tabs = Array.from(tabsRoot.querySelectorAll('[data-tab]'));

  // Driver card refs
  const dPhoto = document.querySelector('[data-driver-photo]');
  const dName = document.querySelector('[data-driver-name]');
  const dRating = document.querySelector('[data-driver-rating]');
  const dBadge = document.querySelector('[data-driver-badge]');
  const dDesc = document.querySelector('[data-driver-desc]');
  const dDetails = document.querySelectorAll('[data-driver-detail]');
  const dReviews = document.querySelector('[data-driver-reviews]');

  let current = '32';

  function reviewHTML(r) {
    return `
      <li class="dcp__review">
        <div class="dcp__review-meta">
          <span class="dcp__review-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="3"/><path d="M5 21 C5 17, 8 15, 12 15 C16 15, 19 17, 19 21"/></svg>
          </span>
          <span class="dcp__review-name">${r.name}</span>
        </div>
        <div class="dcp__review-rating">
          <span class="star">${'★'.repeat(r.stars)}</span> <strong>${r.score}</strong>
        </div>
        <p class="dcp__review-text">${r.text}</p>
        <span class="dcp__review-date">${r.date}</span>
      </li>
    `;
  }

  function applyData(key) {
    const v = vehicles[key];
    if (!v) return;

    // Hero / seat / tabs
    heroImg.src = `assets/sub/${v.car}`;
    seatImg.src = `assets/sub/${v.seat}`;
    nameEl.textContent = v.name;
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === key));

    // 버스 둘러보기 gallery — 3 images per category (sub_{num}_01..03)
    const num = galleryNum[key] || key;
    galleryImgs.forEach((img, i) => {
      img.src = `assets/reviews/sub_${num}_0${i + 1}.webp`;
    });

    // Driver
    const d = v.driver;
    if (d && dPhoto) {
      dPhoto.src = `assets/${d.photo}`;
      dName.textContent = d.name;
      dRating.innerHTML = `<span class="star">★</span> <strong>${d.stars}</strong> <span class="count">(${d.reviewCount}건)</span>`;
      dBadge.textContent = d.exp;
      dDesc.innerHTML = d.desc;
      dDetails.forEach((el) => {
        const key = el.dataset.driverDetail;
        if (d.details[key]) el.textContent = d.details[key];
      });
      dReviews.innerHTML = d.reviews.map(reviewHTML).join('');
    }

    current = key;
  }

  // Always populate on load (URL param or default 32)
  const params = new URLSearchParams(window.location.search);
  const initialParam = params.get('v');
  const startKey = (initialParam && vehicles[initialParam]) ? initialParam : '32';
  applyData(startKey);
  document.body.classList.add('vehicles-ready');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => applyData(tab.dataset.tab));
  });

  document.querySelectorAll('[data-arrow]').forEach((arrow) => {
    arrow.addEventListener('click', () => {
      const idx = order.indexOf(current);
      const nextIdx = arrow.dataset.arrow === 'next'
        ? (idx + 1) % order.length
        : (idx - 1 + order.length) % order.length;
      applyData(order[nextIdx]);
    });
  });
})();

// Quote form (vehicles page)
(function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const status = document.getElementById('quote-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = '필수 항목을 입력해주세요.';
      status.style.color = 'var(--red)';
      return;
    }
    status.textContent = '견적 문의가 접수되었습니다. (데모)';
    status.style.color = 'var(--navy)';
    form.reset();
  });
})();

// Real-story vertical marquee (infinite scroll)
(function initStoryMarquee() {
  const track = document.querySelector('[data-story-track]');
  if (!track) return;

  const reviews = [
    {
      name: '이경원 기사님',
      stars: 5,
      date: '2026.05.26',
      text:
        '기사님 너무 친절하시고 2주 정도 되는 기간동안\n' +
        '일정 신경써주셔서 매끄럽게 진행될 수 있었습니다!\n' +
        '중간에 일정 변경도 있었고 개인 사정으로 취소될뻔한적도 있었기에 다른 기사님 섭외도 도와주시고 다음에도 또 연락드리고 싶습니다!',
    },
    {
      name: '박정우 기사님',
      stars: 5,
      date: '2026.05.20',
      text:
        '가족과 1박 2일로 다녀온 여행이었는데 정말 만족스러웠습니다.\n' +
        '버스가 새 차처럼 깔끔하고 기사님도 매우 친절하셨어요.\n' +
        '시간 약속도 정확하게 지켜주셔서 가족 모두 편안하게 다녀올 수 있었습니다.',
    },
    {
      name: '김도현 기사님',
      stars: 5,
      date: '2026.05.12',
      text:
        '회사 단체 워크샵으로 이용했는데 시간 약속을 잘 지켜주시고\n' +
        '안전 운행으로 모든 직원이 편안하게 다녀올 수 있었습니다.\n' +
        '버스 컨디션도 좋았고, 다음 행사에도 꼭 다시 부탁드리고 싶습니다.',
    },
    {
      name: '최민석 기사님',
      stars: 5,
      date: '2026.05.03',
      text:
        '결혼식 셔틀 운행을 부탁드렸는데 정장 차림으로 깔끔하게 응대해주시고\n' +
        '차량 상태도 최상이었습니다.\n' +
        '하객분들이 편안하게 이동하실 수 있어 진행이 매끄럽게 마무리됐어요.',
    },
    {
      name: '정한별 기사님',
      stars: 4,
      date: '2026.04.28',
      text:
        '장거리 단체 여행이었지만 휴게소도 적절히 들러주시고\n' +
        '편안하게 다녀올 수 있었습니다.\n' +
        '다음 워크샵 때도 다시 이용하고 싶어요.',
    },
    {
      name: '한지영 기사님',
      stars: 5,
      date: '2026.04.15',
      text:
        '학교 수학여행으로 이용했는데 학생들 안전에 정말 신경 써주셨어요.\n' +
        '운전도 부드럽고 차량 내부도 청결해서 학부모 입장에서 매우 만족스러웠습니다.',
    },
    {
      name: '오태훈 기사님',
      stars: 5,
      date: '2026.04.02',
      text:
        '동호회 단체 이동에 이용했어요.\n' +
        '예약부터 운행까지 전 과정이 매끄럽고, 기사님이 길도 잘 아셔서 시간 손실 없이 잘 다녀왔습니다.',
    },
  ];

  function cardHTML(r) {
    const stars =
      '★'.repeat(r.stars) + '☆'.repeat(Math.max(0, 5 - r.stars));
    return `
      <article class="story-card">
        <h3 class="story-card__name">${r.name}</h3>
        <div class="story-card__meta">
          <span class="story-card__stars">${stars}</span>
          <span class="story-card__date">${r.date}</span>
        </div>
        <p class="story-card__text">${r.text.replace(/\n/g, '<br>')}</p>
      </article>
    `;
  }

  // Render the list twice so there's always enough below the fold to fill the
  // viewport as cards rotate up off the top.
  track.innerHTML = [...reviews, ...reviews].map(cardHTML).join('');

  const interval = 1600;
  const slideDur = 500;
  let timer = null;
  let animating = false;

  function step() {
    if (animating) return;
    const first = track.firstElementChild;
    if (!first) return;
    animating = true;

    const gap = parseFloat(getComputedStyle(track).rowGap) || 0;
    const delta = first.getBoundingClientRect().height + gap;

    track.style.transition = `transform ${slideDur}ms cubic-bezier(0.45, 0, 0.15, 1)`;
    track.style.transform = `translateY(${-delta}px)`;

    const done = () => {
      track.removeEventListener('transitionend', done);
      // Move the top card to the bottom and snap back without animating.
      track.style.transition = 'none';
      track.appendChild(first);
      track.style.transform = 'translateY(0)';
      void track.offsetWidth; // commit the reset before the next step
      animating = false;
    };
    track.addEventListener('transitionend', done);
  }

  function start() {
    stop();
    timer = setInterval(step, interval);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Pause while the visitor is reading.
  const marquee = track.closest('.story-marquee');
  if (marquee) {
    marquee.addEventListener('mouseenter', stop);
    marquee.addEventListener('mouseleave', start);
  }

  start();
})();

// Inquiry page — category tab switching + FAQ accordion
(function initInquiryPage() {
  const tabs = document.querySelectorAll('.inquiry-tab');
  if (!tabs.length) return;

  const views = document.querySelectorAll('.inquiry-view');
  const heroTitle = document.querySelector('[data-hero-title]');
  const heroLead = document.querySelector('[data-hero-lead]');

  const heroCopy = {
    faq:    { title: '자주 묻는 질문', lead: '자주 묻는 질문을 통해 궁금한 내용을 확인해보세요.' },
    driver: { title: '버스기사 모집',  lead: '운행 기사님을 모집합니다. 함께할 분의 지원을 기다립니다.' },
    b2b:    { title: '법인 / 통근버스 문의', lead: '정기 운행, 단체 행사, 법인 견적 등 대량 이용 문의를 남겨주세요.' },
    qa:     { title: '1:1 문의', lead: '상담원에게 직접 문의를 남겨보세요. 평균 1영업일 이내 답변드려요.' },
  };

  const sideItems = document.querySelectorAll('.inquiry-side__item');
  // Sidebar key → top tab key it belongs under (qa stands alone; faq sits under FAQ tab)
  const sidebarToTab = { faq: 'faq', qa: null };

  function activate(key) {
    // qa lives outside the top 3 tabs — deactivate all tabs in that case
    tabs.forEach(t => t.classList.toggle('is-active', key !== 'qa' && t.dataset.tab === key));
    views.forEach(v => {
      const match = v.dataset.view === key;
      if (match) v.removeAttribute('hidden');
      else v.setAttribute('hidden', '');
    });
    sideItems.forEach(item => {
      const sideKey = item.dataset.side;
      item.classList.toggle('is-active', sideKey && sideKey === key);
    });
    if (heroTitle && heroCopy[key]) heroTitle.textContent = heroCopy[key].title;
    if (heroLead && heroCopy[key]) heroLead.textContent = heroCopy[key].lead;
    // Hide top category cards when 1:1 inquiry view is shown
    document.body.classList.toggle('is-qa-view', key === 'qa');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
  });

  // Deep-link: open a specific tab via inquiry.html?tab=faq|driver|b2b|qa
  const requestedTab = new URLSearchParams(location.search).get('tab');
  if (requestedTab && heroCopy[requestedTab]) {
    activate(requestedTab);
  }

  // Sidebar items with data-side
  sideItems.forEach(item => {
    const key = item.dataset.side;
    if (!key) return;
    item.addEventListener('click', e => {
      e.preventDefault();
      activate(key);
      const main = document.querySelector('.inquiry-main');
      if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('is-open');
      const toggle = btn.querySelector('.faq-item__toggle');
      if (toggle) toggle.textContent = open ? '−' : '+';
    });
  });

  // Side CTA button → open 1:1 inquiry view
  const ctaBtn = document.querySelector('.inquiry-side__cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', e => {
      e.preventDefault();
      activate('qa');
      const main = document.querySelector('.inquiry-main');
      if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Form submit demo
  document.querySelectorAll('.inquiry-form, .qa-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent = '문의가 정상적으로 접수되었습니다. 빠르게 답변드리겠습니다.';
        status.style.color = 'var(--navy)';
      }
      form.reset();
    });
  });

  // Open view based on URL hash (e.g., inquiry.html#qa from topbar 고객센터)
  function applyHash() {
    const key = (location.hash || '').replace('#', '');
    if (['faq', 'driver', 'b2b', 'qa'].includes(key)) activate(key);
  }
  applyHash();
  window.addEventListener('hashchange', applyHash);
})();

// Reviews page — filter / search / sort / pagination
(function initReviewsPage() {
  const grid = document.querySelector('[data-review-grid]');
  if (!grid) return;

  const pager = document.querySelector('[data-review-pagination]');
  const emptyEl = document.querySelector('[data-review-empty]');
  const searchEl = document.querySelector('[data-review-search]');
  const sortEl = document.querySelector('[data-review-sort]');
  const typeEl = document.querySelector('[data-review-type]');

  // Vehicle pool — key drives the 차량 종류 filter, img is the card thumbnail.
  const VEHICLES = [
    { type: '45인승 우등버스',   key: '45인승',  img: 'assets/reviews/review_01.webp' },
    { type: '25인승 미니버스',   key: '25인승',  img: 'assets/reviews/review_03.webp' },
    { type: '16인승 프리미엄 밴', key: '16인승',  img: 'assets/reviews/review_05.webp' },
    { type: '32인승 중형버스',   key: '32인승',  img: 'assets/reviews/review_02.webp' },
    { type: '프리미엄 리무진버스', key: '프리미엄', img: 'assets/reviews/review_06.webp' },
    { type: '45인승 우등버스',   key: '45인승',  img: 'assets/reviews/review_04.webp' },
  ];
  const STORIES = [
    { purpose: '회사 워크숍', title: '편안하고 안전한 워크숍 이동이었어요!', rating: 5.0,
      text: '회사 워크숍으로 이용했는데 기사님도 친절하시고 차량 상태도 너무 좋았습니다. 장거리 이동이었는데도 불편함 없이 편안하게 다녀왔어요.' },
    { purpose: '가족 여행', title: '가족 여행에 딱 맞는 차량이었습니다', rating: 5.0,
      text: '아이들과 부모님 모시고 1박 2일 다녀왔는데 좌석도 넓고 깨끗해서 모두 만족했어요. 운전도 부드러워 멀미 없이 편하게 이동했습니다.' },
    { purpose: '학교 단체', title: '학생들 안전까지 세심하게 신경 써주셨어요', rating: 4.5,
      text: '수학여행으로 이용했어요. 기사님이 학생 안전을 최우선으로 운행해주시고 시간 약속도 정확히 지켜주셔서 학부모로서 안심됐습니다.' },
    { purpose: '골프 모임', title: '골프백 적재도 넉넉하고 쾌적했어요', rating: 5.0,
      text: '동호회 골프 라운딩 이동으로 이용했습니다. 짐 공간이 넉넉하고 차내가 쾌적해서 이동 내내 편안했습니다. 다음에도 또 부탁드릴게요.' },
    { purpose: '임원 의전', title: '의전용으로 손색없는 프리미엄 차량', rating: 5.0,
      text: '본사 임원 의전으로 이용했는데 차량 컨디션과 기사님 응대 모두 최고였습니다. 깔끔한 정장 차림으로 맞아주셔서 인상 깊었습니다.' },
    { purpose: '단체 행사', title: '대규모 단체 이동도 매끄럽게 진행됐어요', rating: 4.5,
      text: '행사 참석 인원이 많았는데 배차부터 운행까지 체계적으로 진행해 주셔서 지연 없이 잘 마무리됐어요. 응대도 친절하셨습니다.' },
  ];
  const NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const DATES = ['2026.05.31', '2026.05.28', '2026.05.22', '2026.05.18', '2026.05.11',
                 '2026.05.03', '2026.04.27', '2026.04.20', '2026.04.12'];

  // 18 reviews — array order is newest-first (used by the 최신순 sort).
  const reviews = Array.from({ length: 18 }, (_, i) => {
    const v = VEHICLES[i % VEHICLES.length];
    const s = STORIES[i % STORIES.length];
    return {
      name: NAMES[i % NAMES.length] + 'OO 고객님',
      vehicle: v.type, key: v.key, img: v.img,
      purpose: s.purpose, title: s.title, text: s.text, rating: s.rating,
      date: DATES[i % DATES.length],
    };
  });

  const PER_PAGE = 6;
  let page = 1;

  const AVATAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5z"/></svg>';

  function starsHTML(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function cardHTML(rv) {
    return `<article class="rv-card">
      <div class="rv-card__head">
        <span class="rv-card__avatar">${AVATAR}</span>
        <div class="rv-card__who">
          <h3 class="rv-card__name">${rv.name}</h3>
          <p class="rv-card__meta">${rv.vehicle} <span class="rv-card__sep">|</span> ${rv.purpose}</p>
        </div>
        <div class="rv-card__rating"><span class="rv-card__stars">${starsHTML(rv.rating)}</span> ${rv.rating.toFixed(1)}</div>
      </div>
      <div class="rv-card__body">
        <h4 class="rv-card__title">${rv.title}</h4>
        <p class="rv-card__text">${rv.text}</p>
      </div>
      <div class="rv-card__media"><img class="rv-card__img" src="${rv.img}" alt="${rv.vehicle}" loading="lazy"></div>
    </article>`;
  }

  function getFiltered() {
    const q = (searchEl?.value || '').trim().toLowerCase();
    const type = typeEl?.value || '';
    let list = reviews.filter((rv) => {
      const hay = `${rv.name} ${rv.vehicle} ${rv.purpose} ${rv.title} ${rv.text}`.toLowerCase();
      return (!q || hay.includes(q)) && (!type || rv.key === type);
    });
    if (sortEl?.value === 'rating') {
      // stable sort keeps newest-first order within equal ratings
      list = list.map((rv, i) => [rv, i]).sort((a, b) => b[0].rating - a[0].rating || a[1] - b[1]).map((x) => x[0]);
    }
    return list;
  }

  function render() {
    const list = getFiltered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;

    const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    grid.innerHTML = slice.map(cardHTML).join('');
    grid.hidden = list.length === 0;
    if (emptyEl) emptyEl.hidden = list.length !== 0;

    pager.innerHTML = '';
    pager.hidden = pages <= 1;
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = i;
      if (i === page) btn.classList.add('is-active');
      btn.addEventListener('click', () => {
        page = i;
        render();
        const top = grid.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: 'smooth' });
      });
      pager.appendChild(btn);
    }
  }

  [searchEl, sortEl, typeEl].forEach((el) => {
    if (el) el.addEventListener('input', () => { page = 1; render(); });
  });

  render();
})();

// Review write page — star rating, char counter, date fields, photo upload
(function initReviewWriteForm() {
  const form = document.getElementById('review-write-form');
  if (!form) return;

  // Text ⇄ date toggle so the Korean placeholder shows while empty.
  form.querySelectorAll('.rw-date').forEach((inp) => {
    inp.addEventListener('focus', () => {
      inp.type = 'date';
      if (inp.showPicker) { try { inp.showPicker(); } catch (e) { /* ignore */ } }
    });
    inp.addEventListener('blur', () => { if (!inp.value) inp.type = 'text'; });
  });

  // Star rating
  const starWrap = form.querySelector('[data-stars]');
  const ratingInput = form.querySelector('[name="rating"]');
  const stars = Array.from(starWrap.querySelectorAll('button'));
  let rating = 0;
  const paint = (n) => stars.forEach((s, i) => s.classList.toggle('is-on', i < n));
  stars.forEach((s, i) => {
    s.addEventListener('mouseenter', () => paint(i + 1));
    s.addEventListener('click', () => {
      rating = i + 1;
      ratingInput.value = rating;
      paint(rating);
      starWrap.classList.remove('is-invalid');
    });
  });
  starWrap.addEventListener('mouseleave', () => paint(rating));

  // Character counter
  const textarea = form.querySelector('textarea');
  const counter = form.querySelector('[data-count]');
  const maxLen = textarea.getAttribute('maxlength') || 1000;
  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length} / ${maxLen}`;
  });

  // Photo upload (click + drag/drop, with previews)
  const zone = form.querySelector('[data-upload-zone]');
  const fileInput = form.querySelector('[data-upload]');
  const preview = form.querySelector('[data-preview]');
  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024;
  let files = [];

  function renderPreview() {
    preview.innerHTML = '';
    files.forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const thumb = document.createElement('div');
      thumb.className = 'rw-thumb';
      thumb.innerHTML = `<img src="${url}" alt=""><button type="button" aria-label="삭제">×</button>`;
      thumb.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        files.splice(idx, 1);
        renderPreview();
      });
      preview.appendChild(thumb);
    });
  }
  function addFiles(list) {
    for (const file of list) {
      if (files.length >= MAX_FILES) { alert('사진은 최대 5장까지 첨부할 수 있습니다.'); break; }
      if (!/^image\/(png|jpeg)$/.test(file.type)) continue;
      if (file.size > MAX_SIZE) { alert(`${file.name} 파일이 10MB를 초과합니다.`); continue; }
      files.push(file);
    }
    renderPreview();
  }
  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => {
    e.preventDefault();
    zone.classList.add('is-drag');
  }));
  ['dragleave', 'dragend', 'drop'].forEach((ev) => zone.addEventListener(ev, () => {
    zone.classList.remove('is-drag');
  }));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  // Submit (demo — validates required fields incl. rating)
  const status = form.querySelector('[data-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const invalid = !el.value.trim();
      el.classList.toggle('is-invalid', invalid);
      if (invalid) ok = false;
    });
    if (!rating) { starWrap.classList.add('is-invalid'); ok = false; }

    status.hidden = false;
    if (!ok) {
      status.textContent = '필수 항목(*)을 모두 입력해주세요.';
      status.style.color = 'var(--red)';
      return;
    }
    status.textContent = '후기가 등록되었습니다. 관리자 검토 후 공개됩니다. 감사합니다!';
    status.style.color = '#2c52d6';
    form.reset();
    files = [];
    renderPreview();
    rating = 0;
    paint(0);
    counter.textContent = `0 / ${maxLen}`;
    form.querySelectorAll('.rw-date').forEach((i) => { i.type = 'text'; });
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  });
})();

