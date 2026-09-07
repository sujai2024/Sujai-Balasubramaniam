let siteContent = { publications: [], posts: [] };
let state = { currentPost: null, currentPub: null };

const RESEARCH_AREAS = [
  { n: '01', title: 'Spinning Mechanics', desc: 'Drafting, fibre dynamics, yarn formation, end-breakage and high-speed spinning behaviour.' },
  { n: '02', title: 'Textile Process Statistics', desc: 'Statistical modelling, variability, process capability, defect prediction and quality engineering.' },
  { n: '03', title: 'Fibre & Yarn Quality', desc: 'Yarn faults, testing systems, measurement variation and quality intelligence.' },
  { n: '04', title: 'Rubber & Elastomer Science', desc: 'Compound behaviour, rheology, friction, surface characteristics and application performance.' },
  { n: '05', title: 'Applied Industrial Research', desc: 'Field trials, failure analysis, FMEA, predictive models and industrial validation.' }
];

function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

async function loadContent(){
  const [pubs, posts] = await Promise.all([
    fetch('content/publications.json').then(r=>r.json()).catch(()=>[]),
    fetch('content/posts.json').then(r=>r.json()).catch(()=>[])
  ]);
  siteContent.publications = pubs;
  siteContent.posts = posts;
}

function setView(v){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  document.querySelectorAll('nav button[data-view]').forEach(b=>{
    b.classList.toggle('active', b.dataset.view===v);
  });
  if(v==='archive') renderArchive();
  if(v==='blog') renderBlog();
  if(v==='home') renderHome();
  if(v==='research') renderResearchFull();
}

function renderResearchCard(a){
  return `<div class="pub">
    <p class="pub-meta mono">${a.n}</p>
    <p class="pub-title serif">${esc(a.title)}</p>
    <p class="pub-summary">${esc(a.desc)}</p>
  </div>`;
}

function renderResearchFull(){
  document.getElementById('researchAreasFull').innerHTML = RESEARCH_AREAS.map(renderResearchCard).join('');
}

function renderHome(){
  document.getElementById('homePubCount').textContent = siteContent.publications.length;
  document.getElementById('homePostCount').textContent = siteContent.posts.length;
  document.getElementById('pubCountHeader').textContent = siteContent.publications.length;
  document.getElementById('researchAreasHome').innerHTML = RESEARCH_AREAS.slice(0,5).map(renderResearchCard).join('');
  const featured = siteContent.publications.filter(p => p.featured);
  document.getElementById('featuredHome').innerHTML = featured.length
    ? featured.map(renderPubRow).join('')
    : '<div class="empty-state">No featured papers marked yet.</div>';
  wirePubReadLinks(document.getElementById('featuredHome'));
}

function renderArchive(){
  const el = document.getElementById('archiveList');
  if(siteContent.publications.length===0){
    el.innerHTML = '<div class="empty-state">No entries yet. Add rows to content/publications.json and redeploy.</div>';
    return;
  }
  let html = '';
  const featured = siteContent.publications.filter(p => p.featured);
  if(featured.length){
    html += '<div class="year-group"><div class="year-label">Featured research</div>';
    featured.forEach(p => { html += renderPubRow(p); });
    html += '</div>';
  }
  const byYear = {};
  siteContent.publications.slice().sort((a,b)=>b.year-a.year).forEach(p=>{
    (byYear[p.year] = byYear[p.year]||[]).push(p);
  });
  Object.keys(byYear).sort((a,b)=>b-a).forEach(y=>{
    html += `<div class="year-group"><div class="year-label">${y}</div>`;
    byYear[y].forEach(p=>{ html += renderPubRow(p); });
    html += `</div>`;
  });
  el.innerHTML = html;
  wirePubReadLinks(el);
}

function wirePubReadLinks(container){
  container.querySelectorAll('.pub-read-link').forEach(link=>{
    link.addEventListener('click', ()=> openPub(link.dataset.pubId));
  });
}

function renderPubRow(p){
  const downloadLink = p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">View / download</a>`
    : `<span class="muted-note" style="font-size:12px;">No link yet</span>`;
  const readLink = p.detail ? `<a href="javascript:void(0)" class="pub-read-link" data-pub-id="${esc(p.id)}">Read research &rarr;</a>` : '';
  return `<div class="pub">
    <p class="pub-title serif">${esc(p.title)}</p>
    <p class="pub-meta">${esc(p.type)}${p.doi ? ' · DOI: '+esc(p.doi) : ''}</p>
    <p class="pub-summary">${esc(p.summary)}</p>
    <div class="pub-actions">${readLink}${downloadLink}</div>
  </div>`;
}

function openPub(id){
  const p = siteContent.publications.find(x=>x.id===id);
  if(!p || !p.detail) return;
  state.currentPub = id;
  document.getElementById('pubTitle').textContent = p.title;
  document.getElementById('pubMeta').textContent = `${p.type}${p.doi ? ' · DOI: '+p.doi : ''}`;
  const d = p.detail;
  const downloadLink = p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">View / download paper</a>`
    : '';
  document.getElementById('pubDetailBody').innerHTML = `
    <h2 class="section-title" style="margin-top:24px;">Research question</h2>
    <p style="font-size:15px;line-height:1.7;">${esc(d.question)}</p>
    <h2 class="section-title" style="margin-top:24px;">Method</h2>
    <p style="font-size:15px;line-height:1.7;">${esc(d.method)}</p>
    <h2 class="section-title" style="margin-top:24px;">Findings</h2>
    <p style="font-size:15px;line-height:1.7;">${esc(d.findings)}</p>
    <h2 class="section-title" style="margin-top:24px;">Industrial relevance</h2>
    <p style="font-size:15px;line-height:1.7;">${esc(d.relevance)}</p>
    <div style="margin-top:24px;">${downloadLink}</div>
  `;
  setView('pubdetail');
}

function renderBlog(){
  const el = document.getElementById('blogList');
  if(siteContent.posts.length===0){
    el.innerHTML = '<div class="empty-state">No posts yet. Add entries to content/posts.json and redeploy.</div>';
    return;
  }
  let html = '';
  siteContent.posts.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).forEach(p=>{
    const excerpt = p.body.split('\n')[0].slice(0,140);
    html += `<div class="post-row" data-id="${p.id}">
      <p class="post-title">${esc(p.title)}</p>
      <span class="post-date mono">${esc(p.date)}</span>
      <p class="post-excerpt">${esc(excerpt)}${p.body.length>140?'…':''}</p>
    </div>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.post-row').forEach(row=>{
    row.addEventListener('click', ()=> openPost(row.dataset.id));
  });
}

async function openPost(id){
  const p = siteContent.posts.find(x=>x.id===id);
  if(!p) return;
  state.currentPost = id;
  document.getElementById('postTitle').textContent = p.title;
  document.getElementById('postDate').textContent = p.date;
  document.getElementById('postBody').textContent = p.body;
  setView('post');
  await loadComments(id);
}

async function loadComments(postId){
  const el = document.getElementById('commentList');
  el.innerHTML = '<p class="muted-note">Loading comments…</p>';
  try{
    const res = await fetch('/api/comments?postId='+encodeURIComponent(postId));
    const list = await res.json();
    if(!Array.isArray(list) || list.length===0){
      el.innerHTML = '<p class="muted-note">No comments yet.</p>';
    }else{
      el.innerHTML = list.map(c=>`<div class="comment">
        <div class="comment-head">${esc(c.author)}<span class="comment-date">${esc(c.date)}</span></div>
        <div class="comment-text">${esc(c.text)}</div>
      </div>`).join('');
    }
  }catch(e){
    el.innerHTML = '<p class="muted-note">Comments aren\'t available in local preview — they work once deployed to Netlify.</p>';
  }
  renderCommentForm(postId);
}

function renderCommentForm(postId){
  const formArea = document.getElementById('commentFormArea');
  const user = window.netlifyIdentity && netlifyIdentity.currentUser();
  if(user){
    formArea.innerHTML = `<div class="comment-form">
      <textarea id="commentInput" placeholder="Add a comment"></textarea>
      <div class="field-error" id="commentError" style="display:none;"></div>
      <button id="submitCommentBtn">Post comment</button>
    </div>`;
    document.getElementById('submitCommentBtn').addEventListener('click', ()=> submitComment(postId));
  }else{
    formArea.innerHTML = `<p class="muted-note">Sign in to leave a comment.</p>`;
  }
}

async function submitComment(postId){
  const input = document.getElementById('commentInput');
  const errEl = document.getElementById('commentError');
  const text = input.value.trim();
  if(!text){
    errEl.textContent = 'Write something before posting.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  const user = netlifyIdentity.currentUser();
  const token = await user.jwt();
  try{
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ postId, text })
    });
    const data = await res.json();
    if(!res.ok){
      errEl.textContent = data.error || 'Could not post comment.';
      errEl.style.display = 'block';
      return;
    }
    await loadComments(postId);
  }catch(e){
    errEl.textContent = 'Comments API is only live once deployed to Netlify.';
    errEl.style.display = 'block';
  }
}

function updateWhoAmI(){
  const user = window.netlifyIdentity && netlifyIdentity.currentUser();
  document.getElementById('whoami').textContent = user ? (user.user_metadata?.full_name || user.email) : '';
  document.getElementById('accountNavBtn').textContent = user ? 'Sign out' : 'Sign in';
}

document.querySelectorAll('nav button[data-view]').forEach(b=>{
  b.addEventListener('click', ()=> setView(b.dataset.view));
});
document.getElementById('backToBlog').addEventListener('click', ()=> setView('blog'));
document.getElementById('backToPubs').addEventListener('click', ()=> setView('archive'));

document.getElementById('accountNavBtn').addEventListener('click', ()=>{
  const user = window.netlifyIdentity && netlifyIdentity.currentUser();
  if(user){
    netlifyIdentity.logout();
  }else{
    netlifyIdentity.open();
  }
});

if(window.netlifyIdentity){
  netlifyIdentity.on('login', ()=>{ updateWhoAmI(); netlifyIdentity.close(); if(state.currentPost) loadComments(state.currentPost); });
  netlifyIdentity.on('logout', updateWhoAmI);
  netlifyIdentity.init();
}

(async function init(){
  await loadContent();
  updateWhoAmI();
  setView('home');
})();
