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
