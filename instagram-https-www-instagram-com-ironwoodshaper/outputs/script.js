const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const year = document.querySelector("[data-year]");
const instagramFeed = document.querySelector("[data-instagram-feed]");
const instagramSource = document.querySelector("[data-instagram-source]");

year.textContent = new Date().getFullYear();

const setHeader = () => header.classList.toggle("scrolled", window.scrollY > 40);
setHeader();
window.addEventListener("scroll", setHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "メニューを開く" : "メニューを閉じる");
  menuButton.classList.toggle("active", !open);
  mobileMenu.classList.toggle("open", !open);
  document.body.classList.toggle("menu-open", !open);
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    menuButton.classList.remove("active");
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px" });

document.querySelectorAll(".reveal").forEach((element, index) => {
  if (element.closest(".hero")) element.style.transitionDelay = `${index * 90}ms`;
  revealObserver.observe(element);
});

const formatInstagramDate = (date) => {
  if (!date) return "ARCHIVE";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const renderInstagramPosts = (posts) => {
  if (!instagramFeed || !posts.length) return;

  instagramFeed.replaceChildren(...posts.slice(0, 8).map((post) => {
    const article = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const meta = document.createElement("div");
    const time = document.createElement("time");
    const caption = document.createElement("p");

    article.className = "insta-post";
    link.className = "insta-tile";
    link.href = post.permalink || "https://www.instagram.com/ironwoodshaper/";
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", "Instagramの投稿を見る");

    image.src = post.imageUrl;
    image.alt = post.caption ? post.caption.slice(0, 80) : "Iron.Wood.ShaperのInstagram投稿";
    image.loading = "lazy";

    meta.className = "insta-meta";
    time.dateTime = post.date || "";
    time.textContent = formatInstagramDate(post.date);
    caption.textContent = post.caption || "Iron.Wood.Shaper";

    link.append(image);
    meta.append(time, caption);
    article.append(link, meta);
    return article;
  }));
};

const loadInstagramFeed = async () => {
  if (!instagramFeed || window.location.protocol === "file:") return;

  try {
    const response = await fetch("/api/instagram", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Instagram feed returned ${response.status}`);

    const payload = await response.json();
    if (!Array.isArray(payload.posts) || !payload.posts.length) return;

    renderInstagramPosts(payload.posts);
    if (instagramSource) {
      instagramSource.textContent = payload.source === "instagram"
        ? "LATEST POSTS VIA INSTAGRAM GRAPH API"
        : "INSTAGRAM FEED / MANUAL FALLBACK";
    }
  } catch (error) {
    console.info("Using the static Instagram fallback.", error);
  }
};

loadInstagramFeed();
