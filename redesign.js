/* WORLD ARCHIVE — wiki layout redesign (character data stays in index.html) */
(() => {
  'use strict';
  if (typeof CHARACTERS === 'undefined' || !Array.isArray(CHARACTERS)) return;
  const chars=CHARACTERS;
  const worlds=typeof WORLDS!=='undefined' && Array.isArray(WORLDS)?WORLDS:[];
  const oldGo=window.goPage;
  const oldRender=window.renderChars;
  const oldGroup=window.renderCharsGroup;
  const oldWorld=window.goWorldDetail;
  if(typeof oldGo!=='function'||typeof oldRender!=='function')return;
  const routes={'page-home':'','page-chars':'characters','page-world':'world','page-bestiary':'species','page-history':'history','page-glossary':'glossary','page-charlog':'character-log','page-etc':'other'};
  const escapeHTML=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const clean=value=>String(value??'—').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,'').trim()||'—';
  const paragraphs=value=>escapeHTML(clean(value)).replace(/\n/g,'<br>');
  const pageOnly=id=>{
    const p=document.getElementById(id);if(!p)return;
    document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
    p.classList.add('active');window.scrollTo(0,0);navActive(id);
  };
  const push=path=>{
    const next='#/'+path;
    if(location.hash!==next)history.pushState(null,'',next);
  };
  function navActive(id){
    const selected=id==='page-char-detail'?'page-chars':id==='page-world-detail'?'page-world':id;
    document.querySelectorAll('.wiki-nav-item').forEach(btn=>{
      const active=btn.dataset.nav===selected;
      btn.classList.toggle('selected',active);
      if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
    });
  }

  const header=document.createElement('header');
  header.id='wiki-header';
  header.innerHTML='<div class="wiki-header-inner"><button class="wiki-brand" type="button" data-nav="page-home"><b>WORLD ARCHIVE</b><small>창작 세계관 · 캐릭터 위키</small></button><nav class="wiki-navigation" aria-label="주 메뉴"><button class="wiki-nav-item" data-nav="page-world">세계관</button><button class="wiki-nav-item" data-nav="page-chars">캐릭터</button><button class="wiki-nav-item" data-nav="page-etc">기타</button></nav></div>';
  document.body.insertBefore(header,document.body.firstChild);
  header.addEventListener('click',e=>{
    const b=e.target.closest('[data-nav]');if(!b)return;
    if(b.dataset.nav==='page-etc'&&typeof window.tryOpenEtc==='function')window.tryOpenEtc();
    else window.goPage(b.dataset.nav);
  });

  const home=document.getElementById('page-home');
  if(home){
    const title=home.querySelector('.site-title');if(title)title.textContent='WORLD ARCHIVE';
    const tagline=home.querySelector('.terminal > div:first-child');
    if(tagline)tagline.textContent='세계관과 캐릭터들의 기록을 모아둔 개인 위키';
    const cards=home.querySelectorAll('.cat-card');
    if(cards[0])cards[0].querySelector('.cat-name').textContent='캐릭터 도감';
    if(cards[1])cards[1].querySelector('.cat-name').textContent='세계관';
    if(cards[3])cards[3].querySelector('.cat-name').textContent='기타';
    const grid=home.querySelector('.cat-grid');
    if(grid){
      const featured=chars.filter(c=>c.face).slice(0,6);
      const section=document.createElement('section');
      section.className='wiki-feature';
      section.innerHTML='<div class="wiki-section-head"><h2>캐릭터 미리보기</h2><button class="wiki-text-btn" data-all>전체 도감 보기 →</button></div><div class="wiki-feature-grid">'+featured.map(c=>'<button type="button" class="wiki-feature-card" data-character="'+escapeHTML(c.id)+'"><img src="'+escapeHTML(c.face)+'" loading="lazy" alt="'+escapeHTML(c.name)+'"><strong>'+escapeHTML(c.name)+'</strong><small>'+escapeHTML(c.role||'—')+'</small></button>').join('')+'</div>';
      grid.after(section);
      section.addEventListener('click',e=>{
        const card=e.target.closest('[data-character]');
        if(card)window.openCharModal(card.dataset.character);
        if(e.target.closest('[data-all]'))window.goPage('page-chars');
      });
    }
  }

  const filterArea=document.querySelector('#chars-view-all .char-filter-wrap');
  if(filterArea){
    const drop=filterArea.querySelector('.char-dropdowns');
    const toggle=document.createElement('button');toggle.type='button';
    toggle.className='wiki-filter-toggle';toggle.textContent='상세 필터 펼치기 ▾';toggle.setAttribute('aria-expanded','false');
    if(drop){drop.id='wiki-filter-options';toggle.setAttribute('aria-controls',drop.id);}
    toggle.onclick=()=>{
      const open=filterArea.classList.toggle('expanded');
      toggle.textContent=open?'상세 필터 접기 ▴':'상세 필터 펼치기 ▾';
      toggle.setAttribute('aria-expanded',String(open));
    };
    filterArea.insertBefore(toggle,drop);
    const search=document.getElementById('char-search');
    if(search)search.placeholder='이름 또는 태그로 검색';
    const result=document.createElement('div');result.id='wiki-results';result.className='wiki-results';
    filterArea.after(result);
  }

  window.renderChars=function(){
    oldRender();
    const cards=document.querySelectorAll('#char-grid .char-card');
    cards.forEach((card,i)=>{
      const match=(card.getAttribute('onclick')||'').match(/'([^']+)'/);
      const c=match&&chars.find(x=>x.id===match[1]);
      const img=card.querySelector('img');
      if(img){img.loading=i<6?'eager':'lazy';img.decoding='async';}
      if(c){
        const info=card.querySelector('.char-info');
        if(info && !info.querySelector('.wiki-card-role')){
          const role=document.createElement('div');role.className='wiki-card-role';role.textContent=c.role||'—';
          info.appendChild(role);
        }
        card.setAttribute('tabindex','0');card.setAttribute('role','button');
        card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openCharModal(c.id);}};
      }
    });
    const out=document.getElementById('wiki-results');
    if(out)out.textContent='검색 결과 '+cards.length+'명 / 전체 '+chars.length+'명';
  };
  if(typeof oldGroup==='function')window.renderCharsGroup=function(){
    oldGroup();document.querySelectorAll('.char-group-grid img').forEach(img=>{img.loading='lazy';img.decoding='async';});
  };

  const charactersPage=document.getElementById('page-chars');
  const detail=document.createElement('section');detail.className='page';detail.id='page-char-detail';
  if(charactersPage)charactersPage.after(detail);else document.body.append(detail);
  function showCharacter(id,doPush=true){
    const c=chars.find(x=>x.id===id);if(!c)return;
    const art=c.fullbody||c.face;
    const sameGroup=chars.filter(x=>x.id!==id&&[x.role,x.role2].some(v=>v&&v!=='—'&&[c.role,c.role2].includes(v))).slice(0,6);
    const world=worlds.find(w=>w.name===c.world);
    const row=(label,value)=>'<div class="wiki-fact"><dt>'+escapeHTML(label)+'</dt><dd>'+escapeHTML(value||'—')+'</dd></div>';
    detail.innerHTML='<div class="wiki-crumb"><button data-back>캐릭터 도감</button><span>›</span><span>'+escapeHTML(c.name)+'</span></div>'+
      '<small class="wiki-kicker">CHARACTER / '+escapeHTML(c.id)+'</small><h1 class="wiki-profile-title">'+escapeHTML(c.name)+'</h1>'+
      '<div class="wiki-pills">'+[c.gender,c.role,c.world].filter(v=>v&&v!=='—').map(v=>'<span>'+escapeHTML(v)+'</span>').join('')+'</div>'+
      '<div class="wiki-profile-grid"><aside class="wiki-profile-side"><div class="wiki-main-art">'+(art?'<img src="'+escapeHTML(art)+'" data-zoom alt="'+escapeHTML(c.name)+'">':'<div class="wiki-no-art">등록된 이미지 없음</div>')+'</div>'+
      ((c.fullbody2||c.face&&c.face!==art)?'<div class="wiki-alt-images">'+(c.face&&c.face!==art?'<button data-src="'+escapeHTML(c.face)+'">프로필 이미지 보기</button>':'')+(c.fullbody2?'<button data-src="'+escapeHTML(c.fullbody2)+'">다른 이미지 보기</button>':'')+'</div>':'')+
      '<h2>기본 정보</h2><dl>'+row('이름',c.name)+row('성별',c.gender)+row('나이',c.age)+row('신장',c.height)+row('소속',c.role)+row('추가 소속',c.role2)+row('출신 세계',c.world)+row('디자인 원작자',c.creator)+'</dl></aside>'+
      '<article class="wiki-article"><nav class="wiki-contents"><strong>목차</strong><a href="#wiki-bio" data-scroll="wiki-bio">설정</a><a href="#wiki-skill" data-scroll="wiki-skill">능력</a><a href="#wiki-tag" data-scroll="wiki-tag">태그</a><a href="#wiki-related" data-scroll="wiki-related">관련 캐릭터</a></nav>'+
      '<section id="wiki-bio"><h2>설정</h2><p>'+paragraphs(c.background)+'</p></section>'+
      '<section id="wiki-skill"><h2>능력</h2><p>'+paragraphs(c.abilities)+'</p></section>'+
      '<section id="wiki-tag"><h2>태그 및 연관 설정</h2><div class="wiki-tags">'+(c.tags||[]).map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div>'+(world?'<button class="wiki-worldlink" data-world="'+escapeHTML(world.id)+'">'+escapeHTML(world.name)+' 세계관 문서 →</button>':'')+'</section>'+
      '<section id="wiki-related"><h2>관련 캐릭터</h2>'+(sameGroup.length?'<div class="wiki-rel-grid">'+sameGroup.map(x=>'<button data-character="'+escapeHTML(x.id)+'">'+(x.face?'<img loading="lazy" src="'+escapeHTML(x.face)+'" alt="'+escapeHTML(x.name)+'">':'')+'<span>'+escapeHTML(x.name)+'</span></button>').join('')+'</div>':'<p>등록된 관련 캐릭터 없음</p>')+'</section></article></div>';
    pageOnly('page-char-detail');
    if(doPush)push('character/'+encodeURIComponent(id));
    document.title=c.name+' | WORLD ARCHIVE';
  }
  window.openCharModal=id=>showCharacter(id,true);
  detail.addEventListener('click',e=>{
    const el=e.target.closest('[data-back],[data-character],[data-world],[data-scroll],[data-src],[data-zoom]');
    if(!el)return;
    if(el.hasAttribute('data-back'))window.goPage('page-chars');
    else if(el.hasAttribute('data-character'))showCharacter(el.dataset.character);
    else if(el.hasAttribute('data-world'))window.goWorldDetail(el.dataset.world);
    else if(el.hasAttribute('data-scroll')){e.preventDefault();document.getElementById(el.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});}
    else if(el.hasAttribute('data-src'))window.openImgViewer(el.dataset.src);
    else if(el.hasAttribute('data-zoom'))window.openImgViewer(el.src);
  });

  const wp=document.getElementById('page-world');
  if(wp){
    const subtitle=wp.querySelector('.page-sub');
    if(subtitle)subtitle.textContent='세계관을 선택하고 지역·조직·설정 문서를 살펴보세요.';
    const bar=document.createElement('div');bar.className='wiki-worldbar';
    bar.innerHTML='<div><b>세계관 탐색</b><p>행성을 선택하면 세계관 상세 문서로 이동해.</p></div><button type="button">생물 · 종족 도감 →</button>';
    wp.querySelector('.solar-system')?.before(bar);
    bar.querySelector('button').onclick=()=>window.goPage('page-bestiary');
  }

  window.goPage=function(id,noPush=false){
    oldGo(id);navActive(id);
    if(!noPush&&Object.prototype.hasOwnProperty.call(routes,id))push(routes[id]);
    document.title='WORLD ARCHIVE';
  };
  if(typeof oldWorld==='function')window.goWorldDetail=function(id,noPush=false){
    oldWorld(id);navActive('page-world');
    if(!noPush)push('world/'+encodeURIComponent(id));
    document.title='세계관 | WORLD ARCHIVE';
  };
  function restore(){
    const path=decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if(path.startsWith('character/'))return showCharacter(path.slice(10),false);
    if(path.startsWith('world/')){
      const id=path.slice(6);
      if(worlds.some(x=>x.id===id))return window.goWorldDetail(id,true);
    }
    const page=Object.keys(routes).find(k=>routes[k]===path);
    if(page==='page-etc'&&typeof etcUnlocked!=='undefined'&&!etcUnlocked)window.goPage('page-home',true);
    else if(page)window.goPage(page,true);
    else window.goPage('page-home',true);
  }
  window.addEventListener('popstate',restore);
  window.addEventListener('hashchange',restore);
  restore();
})();
