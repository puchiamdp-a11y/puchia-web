
// Load content
async function j(path){ const r = await fetch(path); return r.json(); }

const state = {
  site:null, themes:[], products:[], banners:[], cart: JSON.parse(localStorage.getItem('puchia-cart')||'[]')
};

function saveCart(){ localStorage.setItem('puchia-cart', JSON.stringify(state.cart)); renderCart(); }

function waLink(msg){ const n = state.site?.whatsapp || '5492235847353'; return `https://wa.me/${n}?text=${encodeURIComponent(msg||'Hola!')}`; }

function $(q,root=document){ return root.querySelector(q); }
function $all(q,root=document){ return [...root.querySelectorAll(q)]; }

function renderHeader(){
  $('#brandName').textContent = state.site.brand;
  $('#brandName2').textContent = state.site.brand;
  $('#igLink').href = 'https://instagram.com/'+state.site.instagram;
  $('#fbLink').href = 'https://facebook.com/'+state.site.facebook;
  document.documentElement.style.setProperty('--primary', state.site.colors.primary || '#7a1e6c');
  document.documentElement.style.setProperty('--accent', state.site.colors.accent || '#f7f243');
  document.documentElement.style.setProperty('--bg', state.site.colors.bg || '#ffffff');
  $('#waFloat').href = waLink('Hola Puchia!');
}

function renderCarousel(){
  const box = $('#carousel'); box.innerHTML='';
  state.banners.forEach((src,i)=>{
    const img = document.createElement('img');
    img.src = src; img.alt = 'Banner '+(i+1);
    img.className = 'active'; if(i>0) img.classList.remove('active');
    box.appendChild(img);
  });
  let idx=0; const slides = $all('#carousel img');
  if(!slides.length) return;
  slides[0].classList.add('active');
  setInterval(()=>{ slides[idx].classList.remove('active'); idx=(idx+1)%slides.length; slides[idx].classList.add('active'); }, 4000);
}

function cardProduct(p){
  const el = document.createElement('article'); el.className='card';
  const img = document.createElement('img'); img.className='media'; img.src = p.images[0]; img.alt = p.name;
  const body = document.createElement('div'); body.className='body';
  const title = document.createElement('div'); title.innerHTML = `<strong>${p.name}</strong><div class="small muted">${p.description||''}</div>`;
  const price = document.createElement('div'); price.className='price'; price.textContent = '$'+p.price;
  const btns = document.createElement('div');
  const btnView = document.createElement('button'); btnView.className='btn'; btnView.textContent='Ver';
  const btnAdd = document.createElement('button'); btnAdd.className='btn btn-primary'; btnAdd.textContent='Agregar al carrito';
  btnView.onclick = ()=> openProduct(p);
  btnAdd.onclick = ()=> { addToCart(p,1); };
  btns.append(btnView, btnAdd);
  body.append(title, price, btns);
  el.append(img, body);
  return el;
}

function renderThemes(){
  const grid = $('#themesGrid'); grid.innerHTML='';
  state.themes.forEach(t=>{
    const card = document.createElement('article'); card.className='card';
    const img = document.createElement('img'); img.className='media'; img.src = t.cover; img.alt = t.name;
    const body = document.createElement('div'); body.className='body';
    body.innerHTML = `<strong>${t.name}</strong><div class="small muted">Ver productos</div>`;
    card.append(img, body);
    card.onclick = ()=> filterByTheme(t.id);
    grid.append(card);
  });
}

function renderProducts(list=state.products){
  const grid = $('#productsGrid'); grid.innerHTML='';
  list.forEach(p=> grid.append(cardProduct(p)));
}

function filterByTheme(id){ renderProducts(state.products.filter(p=>p.themeId===id)); }

function openProduct(p){
  const dlg = $('#productModal');
  $('#modalTitle').textContent = p.name;
  $('#modalDesc').textContent = p.description||'';
  $('#modalPrice').textContent = '$'+p.price;
  $('#modalQty').value = 1;
  const gal = $('#modalGallery'); gal.innerHTML='';
  p.images.forEach(src=>{ const i=document.createElement('img'); i.src=src; i.alt=p.name; gal.append(i); });
  $('#modalAdd').onclick = ()=>{ const q = parseInt($('#modalQty').value||'1'); addToCart(p,q); dlg.close(); };
  dlg.showModal();
}
$('#closeModal')?.addEventListener('click', ()=> $('#productModal').close());

function addToCart(p, qty){
  const i = state.cart.findIndex(x=>x.id===p.id);
  if(i>=0) state.cart[i].qty += qty;
  else state.cart.push({id:p.id, name:p.name, price:p.price, qty, images:p.images});
  saveCart(); $('.cart').style.display='block';
}

function removeFromCart(id){ state.cart = state.cart.filter(x=>x.id!==id); saveCart(); }
function renderCart(){
  $('#cart-count').textContent = state.cart.reduce((a,b)=>a+b.qty,0);
  const box = $('#cartItems'); box.innerHTML='';
  let total=0;
  state.cart.forEach(it=>{
    total += it.price*it.qty;
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.gap='8px'; row.style.margin='6px 0';
    row.innerHTML = `<div style="flex:1">${it.name} × ${it.qty}</div><div>$${it.price*it.qty}</div>`;
    const del = document.createElement('button'); del.className='btn'; del.textContent='✕'; del.onclick=()=>removeFromCart(it.id);
    row.append(del); box.append(row);
  });
  $('#cartTotal').textContent = '$'+total;
}
$('#open-cart')?.addEventListener('click', ()=>{
  const el = $('.cart'); el.style.display = (el.style.display==='block'?'none':'block');
});
$('#clear')?.addEventListener('click', ()=>{ state.cart=[]; saveCart(); });
$('#checkout')?.addEventListener('click', ()=>{
  if(!state.cart.length) return alert('Tu carrito está vacío.');
  let msg = 'Hola! Quiero este pedido:%0A%0A';
  state.cart.forEach(i=> msg += `• ${i.name} × ${i.qty} — $${i.price*i.qty}%0A`);
  msg += `%0ATotal: ${$('#cartTotal').textContent}`;
  window.open(waLink(decodeURIComponent(msg)), '_blank');
});

(async function init(){
  // Load content
  [state.site, state.themes, state.products, state.banners] = await Promise.all([
    j('content/site.json'), j('content/themes.json'), j('content/products.json'), j('content/banners.json')
  ]);
  renderHeader();
  renderCarousel();
  renderThemes();
  renderProducts();
  renderCart();
})(); 
