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
      avatar: 'profile_5-1.png',
      rectAvatar: 'profil_4-2.png',
      stars: 4.8,
      reviews: 82,
      exp: '10년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '10년', accident: '10년', area: '서울, 경기권', field: '단체 관광·공항' },
    },
    {
      name: '이상훈 기사님',
      avatar: 'profile_2-1.png',
      rectAvatar: 'profile_2-2.png',
      stars: 4.7,
      reviews: 64,
      exp: '6년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '6년', accident: '6년', area: '경기, 인천권', field: '학생 통학, 셔틀' },
    },
    {
      name: '박정우 기사님',
      avatar: 'profile_1-1.png',
      rectAvatar: 'profil_3-2.png',
      stars: 4.8,
      reviews: 95,
      exp: '8년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n만족도가 높은 베스트 기사님입니다.',
      details: { career: '8년', accident: '8년', area: '부산, 경남권', field: '장거리, 단체여행' },
    },
    {
      name: '최민석 기사님',
      avatar: 'frofile_4-1.png',
      rectAvatar: 'profil_4-2.png',
      stars: 4.9,
      reviews: 112,
      exp: '12년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '12년', accident: '11년', area: '강원, 충청권', field: '장거리 단체 관광' },
    },
    {
      name: '정한별 기사님',
      avatar: 'profile_1-1.png',
      rectAvatar: 'profile_1-2.png',
      stars: 4.8,
      reviews: 73,
      exp: '9년 이상 경력',
      desc: '안전 운행은 기본, 친절함은 덤!\n고객 만족도가 높은 베스트 기사님입니다.',
      details: { career: '9년', accident: '9년', area: '수도권', field: '학생 통학, 단체' },
    },
  ];

  const total = drivers.length;
  const sideOffsets = [-2, -1, 1, 2]; // left-far, left, right, right-far
  const phone = root.querySelector('[data-phone]');
  const sideCards = Array.from(root.querySelectorAll('[data-side]'));
  const dotsContainer = root.querySelector('[data-dots]');

  dotsContainer.innerHTML = drivers.map(() => '<span></span>').join('');
  const dots = Array.from(dotsContainer.children);

  function ratingHTML(stars, reviews) {
    return `<span class="star">★</span> <strong>${stars}</strong> <span class="count">(${reviews}건)</span>`;
  }

  function fillSideCard(card, d) {
    card.querySelector('.driver-card__avatar').src = `assets/${d.avatar}`;
    card.querySelector('.driver-card__name').textContent = d.name;
    card.querySelector('.driver-card__rating').innerHTML = ratingHTML(d.stars, d.reviews);
    card.querySelector('.driver-card__badge').textContent = d.exp;
    card.querySelector('.driver-card__text').innerHTML = d.desc.replace(/\n/g, '<br>');
  }

  function fillPhone(d) {
    phone.querySelector('.phone__avatar').src = `assets/${d.rectAvatar}`;
    phone.querySelector('.phone__name').textContent = d.name;
    phone.querySelector('.phone__rating').innerHTML = ratingHTML(d.stars, d.reviews);
    phone.querySelector('.phone__badge').textContent = d.exp;
    phone.querySelector('.phone__desc').innerHTML = d.desc.replace(/\n/g, '<br>');
    Object.entries(d.details).forEach(([key, val]) => {
      const el = phone.querySelector(`[data-detail="${key}"]`);
      if (el) el.textContent = val;
    });
  }

  function render(idx) {
    fillPhone(drivers[idx]);
    sideCards.forEach((card, i) => {
      const offset = sideOffsets[i];
      const dIdx = (idx + offset + total) % total;
      fillSideCard(card, drivers[dIdx]);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  }

  let activeIdx = 2;
  render(activeIdx);

  const interval = 3500;
  const fadeDur = 400;
  let timer = null;

  function step() {
    root.classList.add('is-swapping');
    setTimeout(() => {
      activeIdx = (activeIdx + 1) % total;
      render(activeIdx);
      root.classList.remove('is-swapping');
    }, fadeDur);
  }

  function start() {
    stop();
    timer = setInterval(step, interval);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
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
        name: '김도현 기사님', photo: 'profile_1-2.png',
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
        name: '이상훈 기사님', photo: 'profile_2-2.png',
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
        name: '박정우 기사님', photo: 'profil_3-2.png',
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
        name: '최민석 기사님', photo: 'profil_4-2.png',
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
        name: '정한별 기사님', photo: 'profile_1-2.png',
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

  const heroImg = document.querySelector('[data-hero-img]');
  const seatImg = document.querySelector('[data-seat-img]');
  const nameEl = document.querySelector('[data-vehicle-name]');
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

  // Render the list twice — animation translates by -50% so it loops seamlessly
  track.innerHTML = [...reviews, ...reviews].map(cardHTML).join('');
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
  };

  function activate(key) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === key));
    views.forEach(v => {
      const match = v.dataset.view === key;
      if (match) v.removeAttribute('hidden');
      else v.setAttribute('hidden', '');
    });
    if (heroTitle && heroCopy[key]) heroTitle.textContent = heroCopy[key].title;
    if (heroLead && heroCopy[key]) heroLead.textContent = heroCopy[key].lead;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
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

  // Sidebar inquiry button → switch to a contact-style view (use driver form by default? no — just scroll to 1:1 form)
  const ctaBtn = document.querySelector('.inquiry-side__cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', e => {
      e.preventDefault();
      activate('b2b');
      const main = document.querySelector('.inquiry-main');
      if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Form submit demo
  document.querySelectorAll('.inquiry-form').forEach(form => {
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
})();

