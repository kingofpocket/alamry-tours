// Smooth scrolling to sections without putting #something in the address bar.
(() => {
  const onHome = () => location.pathname === "/" || /\/index(\.html)?$/.test(location.pathname);
  const go = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    const h = a.getAttribute("href");
    let id = null, cross = false;
    if (h.startsWith("#") && h.length > 1) id = h.slice(1);
    else if (h.startsWith("/#")) { id = h.slice(2); cross = !onHome(); }
    if (!id) return;
    e.preventDefault();
    if (cross) { try { sessionStorage.setItem("scrollTo", id); } catch (_) {} location.href = "/"; }
    else go(id);
  });
  window.addEventListener("load", () => {
    let id = null;
    try { id = sessionStorage.getItem("scrollTo"); sessionStorage.removeItem("scrollTo"); } catch (_) {}
    if (id) setTimeout(() => go(id), 400);
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });
})();