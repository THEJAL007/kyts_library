/* ---------- Settings ---------- */
const GALLERY_COUNT = 8;          /* photos photo1.jpg ... in images/gallery/ */
const SLIDE_SECONDS = 5;          /* hero slideshow speed */
const FEATURED_PER_CATEGORY = 2;  /* books per category in the hero slideshow */
const DEPOSIT = 750;

/* Plans: price per month, then [standard, door delivery x2, door delivery x4] */
const PLANS = [
  { name: "2 Books Plan", price: 450, six: [2430, 3030, 3630], twelve: [4320, 5520, 6720] },
  { name: "3 Books Plan", price: 500, six: [2700, 3300, 3900], twelve: [4800, 6000, 7200], popular: true },
  { name: "4 Books Plan", price: 550, six: [2970, 3570, 4170], twelve: [5280, 6480, 7680] }
];

/* ---------- Helpers ---------- */
const $ = function (id) { return document.getElementById(id); };
const COLORS = ["#5B5BD6", "#2F7D6D", "#B5543A", "#8A4F9E", "#3A6EA5", "#A67C1B"];
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
}
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ } }
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
}
function findBook(id) { return BOOKS.find(function (b) { return b.id === id; }); }
function money(n) { return "₹" + n.toLocaleString("en-IN"); }

/* ---------- Covers and stars ---------- */
function coverHTML(book) {
  const color = COLORS[BOOKS.indexOf(book) % COLORS.length];
  return '<div class="cover"><div class="ph" style="background:' + color + '">' + esc(book.title) + "</div>" +
    '<img src="images/books/' + book.id + '.jpg" alt="Cover of ' + esc(book.title) + '" loading="lazy" onerror="this.remove()"></div>';
}
function reviewsFor(id) { return load("kyts_reviews", {})[id] || []; }
function starsHTML(id) {
  const list = reviewsFor(id);
  const avg = list.length ? list.reduce(function (s, r) { return s + r.stars; }, 0) / list.length : 0;
  let out = "";
  for (let i = 1; i <= 5; i++) out += i <= Math.round(avg) ? "★" : '<span class="off">★</span>';
  return '<span class="stars">' + out + "<small>" + (list.length ? avg.toFixed(1) + " (" + list.length + ")" : "No ratings yet") + "</small></span>";
}

/* ---------- Login / sign up (demo, saved in this browser only) ---------- */
let user = load("kyts_user", null), pendingBorrow = null, mode = "login";
function updateAuthButton() { $("authBtn").textContent = user ? "Hi, " + user.name.split(" ")[0] + " (Logout)" : "Login / Sign up"; }
function setMode(m, message) {
  mode = m;
  const s = m === "signup";
  $("authTitle").textContent = s ? "Sign up" : "Login";
  $("authSubmit").textContent = s ? "Create account" : "Login";
  $("nameLabel").hidden = !s;
  $("authName").required = s;
  $("authSwitchText").textContent = s ? "Already a member?" : "New here?";
  $("authSwitch").textContent = s ? "Login" : "Sign up";
  $("authMsg").textContent = message || (s ? "Join Kyts Library to borrow books." : "Welcome back.");
}
function openAuth(m, message) { setMode(m, message); $("authDialog").showModal(); }
$("authBtn").addEventListener("click", function () {
  if (user) { user = null; save("kyts_user", null); updateAuthButton(); toast("You have logged out"); }
  else openAuth("login");
});
$("authSwitch").addEventListener("click", function () { setMode(mode === "login" ? "signup" : "login"); });
$("authForm").addEventListener("submit", function () {
  const email = $("authEmail").value.trim();
  const name = mode === "signup" ? $("authName").value.trim() : email.split("@")[0];
  user = { name: name, email: email };
  save("kyts_user", user);
  updateAuthButton();
  toast("Welcome, " + name.split(" ")[0]);
  if (pendingBorrow) { const id = pendingBorrow; pendingBorrow = null; borrow(id); }
});
document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });

/* ---------- Borrow: guests are asked to sign up here ---------- */
function borrow(id) {
  if (!user) { pendingBorrow = id; $("bookDialog").close(); openAuth("signup", "Sign up or log in to borrow this book."); return; }
  const shelf = load("kyts_shelf", []), book = findBook(id);
  if (shelf.indexOf(id) !== -1) { toast(book.title + " is already on your shelf"); return; }
  shelf.push(id);
  save("kyts_shelf", shelf);
  toast(book.title + " added to your shelf");
}

/* ---------- Hero slideshow ---------- */
const featured = [];
Object.keys(TOP_BOOKS).forEach(function (cat) {
  BOOKS.filter(function (b) { return b.category === cat; }).slice(0, FEATURED_PER_CATEGORY).forEach(function (b) { featured.push(b); });
});
let slide = 0, timer = null;
function renderHero() {
  $("heroTrack").innerHTML = featured.map(function (b) {
    return '<div class="slide">' + coverHTML(b) + '<div class="slide-info"><span class="cat">Top ' + b.rank + " in " + esc(b.category) +
      "</span><h3>" + esc(b.title) + '</h3><p class="author">' + esc(b.author) + "</p>" + starsHTML(b.id) +
      '<div class="btn-row"><button class="btn btn-dark small" data-borrow="' + b.id + '">Borrow</button>' +
      '<button class="btn btn-light small" data-open="' + b.id + '">Details</button></div></div></div>';
  }).join("");
  $("heroDots").innerHTML = featured.map(function (b, i) { return '<button class="dot" data-slide="' + i + '" aria-label="Show book ' + (i + 1) + '"></button>'; }).join("");
  goTo(slide);
}
function goTo(i) {
  slide = (i + featured.length) % featured.length;
  $("heroTrack").style.transform = "translateX(-" + slide * 100 + "%)";
  document.querySelectorAll(".dot").forEach(function (d, n) { d.classList.toggle("active", n === slide); });
}
function autoplay() {
  clearInterval(timer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(function () { goTo(slide + 1); }, SLIDE_SECONDS * 1000);
}
$("heroPrev").addEventListener("click", function () { goTo(slide - 1); autoplay(); });
$("heroNext").addEventListener("click", function () { goTo(slide + 1); autoplay(); });
$("heroDots").addEventListener("click", function (e) { if (e.target.dataset.slide) { goTo(Number(e.target.dataset.slide)); autoplay(); } });
$("heroSlider").addEventListener("mouseenter", function () { clearInterval(timer); });
$("heroSlider").addEventListener("mouseleave", autoplay);
let touchX = null;
$("heroSlider").addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
$("heroSlider").addEventListener("touchend", function (e) {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) { goTo(slide + (dx < 0 ? 1 : -1)); autoplay(); }
  touchX = null;
});

/* ---------- Top 10 by category ---------- */
let topCategory = Object.keys(TOP_BOOKS)[0];
function renderTop() {
  $("topTabs").innerHTML = Object.keys(TOP_BOOKS).map(function (c) {
    return '<button class="tab' + (c === topCategory ? " active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
  }).join("");
  $("topRow").innerHTML = BOOKS.filter(function (b) { return b.category === topCategory; }).map(function (b) {
    return '<button class="top-item" data-open="' + b.id + '"><div style="position:relative"><span class="rank">#' + b.rank + "</span>" + coverHTML(b) +
      "</div><h4>" + esc(b.title) + '</h4><div class="author">' + esc(b.author) + "</div>" + starsHTML(b.id) + "</button>";
  }).join("");
}
$("topTabs").addEventListener("click", function (e) { if (e.target.dataset.cat) { topCategory = e.target.dataset.cat; renderTop(); } });

/* ---------- Catalog (open to guests) ---------- */
function renderCatalog() {
  const q = $("search").value.trim().toLowerCase(), cat = $("filter").value;
  const list = BOOKS.filter(function (b) { return (cat === "all" || b.category === cat) && (b.title + " " + b.author).toLowerCase().indexOf(q) !== -1; });
  $("catalogGrid").innerHTML = list.map(function (b) {
    return '<article class="book"><button class="open" data-open="' + b.id + '">' + coverHTML(b) + "<h4>" + esc(b.title) + "</h4></button>" +
      '<div class="author">' + esc(b.author) + "</div>" + starsHTML(b.id) + '<button class="btn btn-dark small" data-borrow="' + b.id + '">Borrow</button></article>';
  }).join("");
  $("empty").hidden = list.length > 0;
}
$("filter").innerHTML = '<option value="all">All categories</option>' + Object.keys(TOP_BOOKS).map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
$("search").addEventListener("input", renderCatalog);
$("filter").addEventListener("change", renderCatalog);

/* ---------- Book details and reviews ---------- */
let chosenStars = 0;
function reviewListHTML(id) {
  const list = reviewsFor(id);
  if (!list.length) return '<p class="author">No reviews yet. Be the first.</p>';
  return list.slice().reverse().map(function (r) {
    return '<div class="review"><span class="stars">' + "★".repeat(r.stars) + '</span><div class="who">' + esc(r.name) + " · " + esc(r.date) + "</div>" + (r.text ? "<div>" + esc(r.text) + "</div>" : "") + "</div>";
  }).join("");
}
function openBook(id) {
  const b = findBook(id);
  chosenStars = 0;
  $("bookBody").innerHTML =
    '<button type="button" class="close" data-close-book aria-label="Close">&times;</button><div class="book-head">' + coverHTML(b) + "<div><h3>" + esc(b.title) +
    '</h3><p class="author">' + esc(b.author) + '</p><p class="author">' + esc(b.category) + " · Top " + b.rank + "</p>" + starsHTML(b.id) +
    '<div class="btn-row"><button class="btn btn-dark small" data-borrow="' + b.id + '">Borrow</button></div></div></div><h4>Rate this book</h4><div class="star-input" id="starInput">' +
    [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-star="' + n + '" aria-label="' + n + ' stars">★</button>'; }).join("") +
    '</div><textarea id="reviewText" rows="3" maxlength="200" placeholder="Write a short review (up to 200 characters)"></textarea><p class="err" id="reviewErr"></p>' +
    '<button class="btn btn-accent small" id="reviewSubmit" data-id="' + b.id + '">Post review</button><h4>Reviews</h4><div class="review-list">' + reviewListHTML(b.id) + "</div>";
  if (!$("bookDialog").open) $("bookDialog").showModal();
}
function postReview(id) {
  if (!chosenStars) { $("reviewErr").textContent = "Choose a star rating first."; return; }
  const all = load("kyts_reviews", {});
  all[id] = all[id] || [];
  all[id].push({ stars: chosenStars, text: $("reviewText").value.trim(), name: user ? user.name : "Guest", date: new Date().toLocaleDateString("en-IN") });
  save("kyts_reviews", all);
  toast("Thanks for your review");
  renderHero(); renderTop(); renderCatalog();
  openBook(id);
}
document.addEventListener("click", function (e) {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.borrow) borrow(t.dataset.borrow);
  else if (t.dataset.open) openBook(t.dataset.open);
  else if (t.dataset.star) {
    chosenStars = Number(t.dataset.star);
    document.querySelectorAll("#starInput button").forEach(function (s) { s.classList.toggle("on", Number(s.dataset.star) <= chosenStars); });
    $("reviewErr").textContent = "";
  }
  else if (t.id === "reviewSubmit") postReview(t.dataset.id);
  else if (t.hasAttribute("data-close-book")) $("bookDialog").close();
  else if (t.dataset.plan) { if (user) toast("Call +91 8884174000 to start your plan"); else openAuth("signup", "Sign up to start your plan."); }
});
$("bookDialog").addEventListener("click", function (e) { if (e.target === this) this.close(); });
$("authDialog").addEventListener("click", function (e) { if (e.target === this) this.close(); });

/* ---------- Plans ---------- */
function block(title, off, p) {
  return "<h4>" + title + " <span>(" + off + " off)</span></h4>" +
    '<div class="row"><span>Standard plan</span><span>' + money(p[0]) + "</span></div>" +
    '<div class="row"><span>Door delivery (x2)</span><span>' + money(p[1]) + "</span></div>" +
    '<div class="row"><span>Door delivery (x4)</span><span>' + money(p[2]) + "</span></div>";
}
$("plansGrid").innerHTML = PLANS.map(function (p) {
  return '<div class="card plan' + (p.popular ? " popular" : "") + '"><div class="tag">' + (p.popular ? "Most popular" : "") + "</div><h3>" + p.name +
    '</h3><div class="price">' + money(p.price) + " <small>/ month</small></div>" + block("6 months plan", "10%", p.six) + block("12 months plan", "20%", p.twelve) +
    '<p class="deposit">One-time refundable deposit: ' + money(DEPOSIT) + '</p><button class="btn ' + (p.popular ? "btn-accent" : "btn-dark") + '" data-plan="1">Get started</button></div>';
}).join("");

/* ---------- Gallery, menu, start ---------- */
let tiles = "";
for (let i = 1; i <= GALLERY_COUNT; i++) tiles += '<div class="photo"><img src="images/gallery/photo' + i + '.jpg" alt="Kyts Library member with a book" loading="lazy" onerror="this.remove()"></div>';
$("gallery").innerHTML = tiles;
const nav = $("nav");
$("menuBtn").addEventListener("click", function () { nav.classList.toggle("open"); });
nav.addEventListener("click", function () { nav.classList.remove("open"); });

updateAuthButton();
renderHero();
renderTop();
renderCatalog();
autoplay();