/* ===== 데이터 (다음 주 데이터베이스로 옮길 때 이 부분만 바꾸면 됩니다) ===== */
const CATEGORIES = ["경기용", "풋살볼", "훈련용", "미니볼"];

const PRODUCTS = [
  { id: 1, name: "KICKOFF 프로 매치볼 5호", category: "경기용", price: 59000, stock: 30, image: "img/p1.jpg", desc: "열접합 패널로 물에 젖어도 무게 변화가 적은 공식 경기용 5호 공입니다." },
  { id: 2, name: "KICKOFF 스타디움 레플리카 5호", category: "경기용", price: 39000, stock: 40, image: "img/p2.jpg", desc: "조기축구와 동호회 경기에 알맞은 합리적인 가격의 5호 공입니다." },
  { id: 3, name: "KICKOFF 실내 풋살볼 4호", category: "풋살볼", price: 35000, stock: 25, image: "img/p3.jpg", desc: "바운드가 낮게 설계되어 실내 코트에서 패스 연결이 쉬운 풋살볼입니다." },
  { id: 4, name: "KICKOFF 코트 그립 풋살볼 4호", category: "풋살볼", price: 29000, stock: 35, image: "img/p4.jpg", desc: "표면 그립이 좋아 인조잔디와 우레탄 코트 모두에서 안정적입니다." },
  { id: 5, name: "KICKOFF 트레이닝 연습구 5호", category: "훈련용", price: 19000, stock: 60, image: "img/p5.jpg", desc: "내구성이 좋은 합성 소재로 매일 하는 개인 훈련에 적합합니다." },
  { id: 6, name: "KICKOFF 리바운드 훈련볼 4호", category: "훈련용", price: 24000, stock: 0, image: "img/p6.jpg", desc: "벽 패스와 드리블 연습에 맞춘 반발력 높은 훈련용 공입니다." },
  { id: 7, name: "KICKOFF 미니 스킬볼 1호", category: "미니볼", price: 12000, stock: 80, image: "img/p7.jpg", desc: "리프팅과 발재간 연습용 미니볼입니다. 가방에 쏙 들어가요." },
  { id: 8, name: "KICKOFF 사인용 기념볼", category: "미니볼", price: 15000, stock: 50, image: "img/p8.jpg", desc: "친구와 팀원의 사인을 받아 보관하기 좋은 기념용 미니볼입니다." }
];

const GRADES = [
  { level: 1, name: "브론즈", rate: 1, minSpent: 0 },
  { level: 2, name: "실버", rate: 3, minSpent: 100000 },
  { level: 3, name: "골드", rate: 5, minSpent: 300000 },
  { level: 4, name: "플래티넘", rate: 7, minSpent: 600000 }
];

const BEST_IDS = [1, 3, 5, 7];  // 홈 BEST 인기 상품
const NEW_IDS = [2, 4, 6, 8];   // 홈 NEW 신상품

const SIGNUP_POINT = 3000;     // 가입 축하 포인트
const FREE_SHIPPING = 50000;   // 이 금액 이상이면 배송비 무료
const SHIPPING_FEE = 3000;

/* ===== 저장소 (지금은 브라우저 localStorage, 다음 주에 DB로 교체) ===== */
const store = {
  get(k, d) { try { const v = localStorage.getItem("kickoff_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("kickoff_" + k, JSON.stringify(v)); } catch (e) { toast("저장 공간을 사용할 수 없습니다."); } }
};

/* ===== 이미지가 없을 때 빈칸 대신 보여줄 대체 그림 ===== */
const FALLBACK_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#e8f6ff"/><circle cx="300" cy="300" r="170" fill="#fff" stroke="#1c2b36" stroke-width="8"/><polygon points="300,215 381,274 350,369 250,369 219,274" fill="#29A9E8" stroke="#1c2b36" stroke-width="6"/><path d="M300 215V130M381 274l80-26M350 369l50 70M250 369l-50 70M219 274l-80-26" stroke="#1c2b36" stroke-width="6"/></svg>');
function fixImg(img) { if (!img.dataset.fb) { img.dataset.fb = "1"; img.src = FALLBACK_IMG; } }
document.addEventListener("error", e => { if (e.target.tagName === "IMG") fixImg(e.target); }, true);
document.querySelectorAll("img").forEach(i => { if (i.complete && i.naturalWidth === 0) fixImg(i); });

/* ===== 공통 도구 ===== */
const $ = (s, r = document) => r.querySelector(s);
const won = n => n.toLocaleString("ko-KR") + "원";
const pt = n => n.toLocaleString("ko-KR") + "P";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const getStock = p => { const m = store.get("stock", {}); return m[p.id] !== undefined ? m[p.id] : p.stock; };
const findP = id => PRODUCTS.find(p => p.id === Number(id));
const gradeOf = u => GRADES.filter(g => u.totalSpent >= g.minSpent).pop();
const users = () => store.get("users", []);
const me = () => { const id = store.get("session", null); return id ? users().find(u => u.id === id) || null : null; };
function saveUser(u) { store.set("users", users().map(x => x.id === u.id ? u : x)); }
let toastTimer;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 2200); }

/* ===== 장바구니 ===== */
const getCart = () => store.get("cart", []);
function addCart(id, qty) {
  const p = findP(id), stock = getStock(p), cart = getCart();
  if (stock <= 0) return toast("품절된 상품입니다."), false;
  const it = cart.find(c => c.id === p.id);
  const next = (it ? it.qty : 0) + qty;
  if (next > stock) return toast("재고는 " + stock + "개까지 담을 수 있어요."), false;
  if (it) it.qty = next; else cart.push({ id: p.id, qty });
  store.set("cart", cart); renderHeader(); return true;
}

/* ===== 화면 : 헤더 ===== */
function renderHeader() {
  const u = me(), box = $("#userMenu");
  box.innerHTML = u
    ? `<span><b>${esc(u.name)}</b>님 <span class="grade">${gradeOf(u).name}</span> <span class="pt">${pt(u.points)}</span></span><a href="#mypage">마이페이지</a><button type="button" data-act="logout">로그아웃</button>`
    : `<a href="#login">로그인</a><a href="#signup">회원가입</a>`;
  $("#cartCount").textContent = getCart().reduce((s, c) => s + c.qty, 0);
}

/* ===== 화면 : 상품 카드 ===== */
function card(p) {
  const s = getStock(p);
  const bd = BEST_IDS.includes(p.id) ? '<span class="badge">BEST</span>' : NEW_IDS.includes(p.id) ? '<span class="badge new">NEW</span>' : "";
  return `<a class="card" href="#detail/${p.id}">${bd}<img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><div class="in"><span class="tag">${p.category}</span><span class="nm">${esc(p.name)}</span><span class="price">${won(p.price)}</span>${s <= 0 ? '<span class="soldout">품절</span>' : ""}</div></a>`;
}

/* ===== 화면 : 홈 · 목록 · 상세 ===== */
function renderHome() {
  $("#catTiles").innerHTML = CATEGORIES.map(c => { const l = PRODUCTS.filter(p => p.category === c); return `<a class="tile" href="#shop/${encodeURIComponent(c)}"><img src="${l[0].image}" alt="${c} 대표 상품"><span>${c}</span><small>${l.length}개 상품</small></a>`; }).join("");
  $("#homeGrid").innerHTML = PRODUCTS.filter(p => BEST_IDS.includes(p.id)).map(card).join("");
  $("#newGrid").innerHTML = PRODUCTS.filter(p => NEW_IDS.includes(p.id)).map(card).join("");
}

let shopQ = "", keepQ = false;
function renderShop(cat) {
  cat = cat || "전체";
  $("#shopTitle").textContent = shopQ ? `'${shopQ}' 검색 결과` : (cat === "전체" ? "전체 상품" : cat);
  $("#filters").innerHTML = ["전체", ...CATEGORIES].map(c => `<button type="button" data-act="cat" data-v="${c}" class="${c === cat ? "on" : ""}">${c}</button>`).join("");
  const list = PRODUCTS.filter(p => (cat === "전체" || p.category === cat) && p.name.toLowerCase().includes(shopQ.toLowerCase()));
  $("#shopCount").textContent = `총 ${list.length}개 상품`;
  $("#shopGrid").innerHTML = list.length ? list.map(card).join("") : '<p class="muted">조건에 맞는 상품이 없어요.</p>';
}

let detailQty = 1;
function renderDetail(id) {
  const p = findP(id), box = $("#detailBox");
  if (!p) { box.innerHTML = "<p>상품을 찾을 수 없습니다.</p>"; return; }
  const s = getStock(p); detailQty = 1;
  box.innerHTML = `<img src="${p.image}" alt="${esc(p.name)}"><div><span class="tag">${p.category}</span><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><p class="price">${won(p.price)}</p><p class="muted">재고 ${s}개 · 적립 ${(me() ? gradeOf(me()).rate : 1)}%</p>
    ${s > 0 ? `<div class="row"><div class="qty"><button type="button" data-act="dq" data-v="-1" aria-label="수량 줄이기">−</button><span id="dq">1</span><button type="button" data-act="dq" data-v="1" aria-label="수량 늘리기">+</button></div></div>
    <div class="row"><button class="btn line" type="button" data-act="add" data-id="${p.id}">장바구니 담기</button><button class="btn" type="button" data-act="buy" data-id="${p.id}">바로 구매</button></div>` : '<p class="soldout">품절된 상품입니다.</p>'}</div>`;
}

/* ===== 화면 : 장바구니 ===== */
function cartTotals() {
  const rows = getCart().map(c => ({ ...c, p: findP(c.id) })).filter(r => r.p);
  const items = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const ship = rows.length && items < FREE_SHIPPING ? SHIPPING_FEE : 0;
  return { rows, items, ship };
}
function renderCart() {
  const { rows, items, ship } = cartTotals(), box = $("#cartBox");
  if (!rows.length) { box.innerHTML = '<p class="muted">장바구니가 비어 있어요.</p><p style="margin-top:12px"><a class="btn" href="#shop">쇼핑하러 가기</a></p>'; return; }
  box.innerHTML = `<div class="scroll-x"><table class="tbl"><thead><tr><th></th><th>상품</th><th>수량</th><th>금액</th><th></th></tr></thead><tbody>` +
    rows.map(r => `<tr><td><img src="${r.p.image}" alt=""></td><td>${esc(r.p.name)}<br><span class="muted">${won(r.p.price)}</span></td>
    <td><div class="qty"><button type="button" data-act="cq" data-id="${r.p.id}" data-v="-1" aria-label="수량 줄이기">−</button><span>${r.qty}</span><button type="button" data-act="cq" data-id="${r.p.id}" data-v="1" aria-label="수량 늘리기">+</button></div></td>
    <td><b>${won(r.p.price * r.qty)}</b></td><td><button type="button" class="btn line" data-act="del" data-id="${r.p.id}">삭제</button></td></tr>`).join("") +
    `</tbody></table></div><div class="sum">상품 합계 ${won(items)}<br>배송비 ${ship ? won(ship) : "무료"} <span class="muted">(${won(FREE_SHIPPING)} 이상 무료)</span><div class="big">합계 ${won(items + ship)}</div><p style="margin-top:10px"><button class="btn" type="button" data-act="tocheckout">주문하기</button></p></div>`;
}

/* ===== 화면 : 체험 결제 ===== */
function renderCheckout() {
  const u = me(), box = $("#checkoutBox"), { rows, items, ship } = cartTotals();
  if (!rows.length) { box.innerHTML = '<p class="muted">주문할 상품이 없어요.</p><p style="margin-top:12px"><a class="btn" href="#shop">쇼핑하러 가기</a></p>'; return; }
  const g = gradeOf(u);
  box.innerHTML = `<div class="box"><b>주문 상품</b><ul style="margin:8px 0 0 18px">${rows.map(r => `<li>${esc(r.p.name)} × ${r.qty} — ${won(r.p.price * r.qty)}</li>`).join("")}</ul></div>
  <form id="payForm" class="box form"><b>배송 정보</b>
    <label>받는 분<input name="rname" required value="${esc(u.name)}"></label>
    <label>연락처<input name="phone" required inputmode="tel" placeholder="010-0000-0000"></label>
    <label>주소<input name="addr" required placeholder="배송받을 주소"></label>
    <label>사용할 포인트 (보유 ${pt(u.points)})<input name="use" type="number" min="0" step="100" value="0"></label>
    <div class="sum" style="text-align:left">상품 합계 ${won(items)}<br>배송비 ${ship ? won(ship) : "무료"}<br>포인트 사용 <span id="sUse">0P</span><div class="big">결제 금액 <span id="sPay"></span></div>적립 예정 <b id="sEarn"></b> (${g.name} ${g.rate}%)</div>
    <p class="err" id="payErr"></p><button class="btn" type="submit">체험 결제하기</button></form>`;
  const f = $("#payForm"), calc = () => {
    let use = Math.floor(Number(f.use.value) || 0); use = Math.max(0, Math.min(use, u.points, items));
    $("#sUse").textContent = pt(use); $("#sPay").textContent = won(items + ship - use); $("#sEarn").textContent = pt(Math.floor((items - use) * g.rate / 100));
    return use;
  };
  f.use.addEventListener("input", calc); calc();
  f.addEventListener("submit", e => {
    e.preventDefault();
    const use = calc(), cur = me(), cart = cartTotals();
    for (const r of cart.rows) if (r.qty > getStock(r.p)) { $("#payErr").textContent = `'${r.p.name}' 재고가 부족해요. 장바구니에서 수량을 줄여주세요.`; return; }
    const gr = gradeOf(cur), earned = Math.floor((cart.items - use) * gr.rate / 100), pay = cart.items + cart.ship - use;
    const orders = store.get("orders", []), no = "K" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(orders.length + 1).padStart(4, "0");
    orders.push({ orderNo: no, userId: cur.id, date: new Date().toLocaleString("ko-KR"), items: cart.rows.map(r => ({ id: r.p.id, name: r.p.name, price: r.p.price, qty: r.qty })),
      itemsTotal: cart.items, shipping: cart.ship, usedPoints: use, payAmount: pay, earnedPoints: earned, receiver: f.rname.value, phone: f.phone.value, address: f.addr.value, status: "체험 결제 완료" });
    store.set("orders", orders);
    const stock = store.get("stock", {}); cart.rows.forEach(r => { stock[r.p.id] = getStock(r.p) - r.qty; }); store.set("stock", stock);
    cur.points = cur.points - use + earned; cur.totalSpent += pay; saveUser(cur);
    store.set("cart", []); renderHeader(); toast(`주문 완료! ${pt(earned)} 적립되었어요.`); location.hash = "#mypage";
  });
}

/* ===== 화면 : 마이페이지 ===== */
function renderMy() {
  const u = me(), g = gradeOf(u), next = GRADES.find(x => x.level === g.level + 1);
  const mine = store.get("orders", []).filter(o => o.userId === u.id).reverse();
  const pct = next ? Math.min(100, Math.round((u.totalSpent - g.minSpent) / (next.minSpent - g.minSpent) * 100)) : 100;
  $("#myBox").innerHTML = `<div class="box"><p><b>${esc(u.name)}</b> (${esc(u.id)}) · ${esc(u.email)}</p>
    <p style="margin-top:6px">회원 등급 <span class="grade">${g.name}</span> · 적립률 ${g.rate}%</p>
    <p>보유 포인트 <b>${pt(u.points)}</b> · 누적 구매 ${won(u.totalSpent)}</p>
    <div class="bar-out"><div class="bar-in" style="width:${pct}%"></div></div>
    <p class="muted">${next ? `다음 등급 ${next.name}(${next.rate}%)까지 ${won(next.minSpent - u.totalSpent)} 남았어요.` : "최고 등급입니다!"}</p></div>
    <div class="box"><b>회원 등급 안내</b><div class="scroll-x"><table class="tbl"><tr><th>등급</th><th>적립률</th><th>누적 구매 기준</th></tr>${GRADES.map(x => `<tr><td>${x.name}</td><td>${x.rate}%</td><td>${won(x.minSpent)} 이상</td></tr>`).join("")}</table></div></div>
    <h3 class="title" style="margin-top:20px">주문 내역</h3>` +
    (mine.length ? mine.map(o => `<div class="box"><b>${o.orderNo}</b> <span class="muted">${esc(o.date)} · ${o.status}</span><ul style="margin:6px 0 6px 18px">${o.items.map(i => `<li>${esc(i.name)} × ${i.qty}</li>`).join("")}</ul>
      결제 ${won(o.payAmount)} (포인트 사용 ${pt(o.usedPoints)}) · 적립 ${pt(o.earnedPoints)}<br><span class="muted">배송지: ${esc(o.address)}</span></div>`).join("") : '<p class="muted">아직 주문 내역이 없어요.</p>');
}

/* ===== 라우터 ===== */
const VIEWS = ["home", "shop", "detail", "cart", "checkout", "login", "signup", "mypage"];
let returnTo = "";
function route() {
  const parts = location.hash.replace(/^#/, "").split("/"); let name = parts[0] || "home";
  const arg = decodeURIComponent(parts[1] || "");
  if (!VIEWS.includes(name)) name = "home";
  if ((name === "mypage" || name === "checkout") && !me()) { returnTo = "#" + name; toast("로그인이 필요해요."); location.hash = "#login"; return; }
  if ((name === "login" || name === "signup") && me()) { location.hash = "#mypage"; return; }
  if (name === "shop") { if (!keepQ) { shopQ = ""; $("#searchInput").value = ""; } keepQ = false; renderShop(arg); }
  if (name === "home") renderHome();
  if (name === "detail") renderDetail(arg);
  if (name === "cart") renderCart();
  if (name === "checkout") renderCheckout();
  if (name === "mypage") renderMy();
  VIEWS.forEach(v => $("#view-" + v).classList.toggle("show", v === name));
  document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + (name === "shop" ? "shop" + (arg ? "/" + arg : "") : name)));
  renderHeader(); window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ===== 클릭 처리 ===== */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, id = Number(b.dataset.id), v = Number(b.dataset.v);
  if (act === "logout") { store.set("session", null); toast("로그아웃 되었어요."); location.hash = "#home"; renderHeader(); route(); }
  if (act === "cat") { keepQ = true; const h = "#shop/" + encodeURIComponent(b.dataset.v); if (location.hash === h) route(); else location.hash = h; }
  if (act === "dq") { const s = getStock(findP(location.hash.split("/")[1])); detailQty = Math.max(1, Math.min(s, detailQty + v)); $("#dq").textContent = detailQty; }
  if (act === "add" && addCart(id, detailQty)) toast("장바구니에 담았어요.");
  if (act === "buy" && addCart(id, detailQty)) location.hash = "#cart";
  if (act === "cq") {
    const cart = getCart(), it = cart.find(c => c.id === id), s = getStock(findP(id));
    if (v > 0 && it.qty >= s) return toast("재고는 " + s + "개까지 담을 수 있어요.");
    it.qty = Math.max(1, it.qty + v); store.set("cart", cart); renderCart(); renderHeader();
  }
  if (act === "del") { store.set("cart", getCart().filter(c => c.id !== id)); renderCart(); renderHeader(); }
  if (act === "tocheckout") { if (!me()) { returnTo = "#checkout"; toast("로그인 후 주문할 수 있어요."); location.hash = "#login"; } else location.hash = "#checkout"; }
});

/* ===== 검색 · 회원가입 · 로그인 ===== */
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault(); shopQ = $("#searchInput").value.trim(); keepQ = true;
  if (location.hash === "#shop/전체" || location.hash === "#shop") route(); else location.hash = "#shop/" + encodeURIComponent("전체");
});
$("#signupForm").addEventListener("submit", e => {
  e.preventDefault(); const f = e.target, err = $("#signupErr"), list = users();
  if (!/^[A-Za-z0-9]{4,}$/.test(f.id.value)) return err.textContent = "아이디는 영문·숫자 4자 이상이에요.";
  if (list.some(u => u.id.toLowerCase() === f.id.value.toLowerCase())) return err.textContent = "이미 사용 중인 아이디예요.";
  if (f.pw.value.length < 6) return err.textContent = "비밀번호는 6자 이상이에요.";
  if (f.pw.value !== f.pw2.value) return err.textContent = "비밀번호가 서로 달라요.";
  err.textContent = "";
  list.push({ id: f.id.value, pw: f.pw.value, name: f.name.value.trim(), email: f.email.value.trim(), points: SIGNUP_POINT, totalSpent: 0, joinedAt: new Date().toISOString() });
  store.set("users", list); store.set("session", f.id.value); f.reset();
  toast(`가입 완료! ${pt(SIGNUP_POINT)}가 지급되었어요.`); location.hash = "#mypage";
});
$("#loginForm").addEventListener("submit", e => {
  e.preventDefault(); const f = e.target, u = users().find(x => x.id === f.id.value && x.pw === f.pw.value);
  if (!u) return $("#loginErr").textContent = "아이디 또는 비밀번호가 맞지 않아요.";
  $("#loginErr").textContent = ""; store.set("session", u.id); f.reset();
  const go = returnTo || "#home"; returnTo = ""; toast(u.name + "님 환영해요!"); location.hash = go; if (location.hash === go) route();
});

/* ===== 첫 화면 슬라이드 (6초마다 교차) ===== */
(function slider() {
  const slides = document.querySelectorAll("#slider .slide"), dots = $("#dots"); let i = 0, timer;
  slides.forEach((_, n) => { const d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", (n + 1) + "번 사진"); d.onclick = () => { show(n); start(); }; dots.appendChild(d); });
  function show(n) { i = n; slides.forEach((s, k) => s.classList.toggle("on", k === i)); [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i)); }
  function start() { clearInterval(timer); timer = setInterval(() => show((i + 1) % slides.length), 6000); }
  show(0); start();
})();

route();
