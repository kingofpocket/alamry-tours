// Loads jobs, gallery and settings from Supabase into the public page.
// If config.js is not filled in, the page stays as written in index.html.
(async () => {
  if (typeof SB_URL === "undefined" || SB_URL.startsWith("PASTE")) return;
  const sb = supabase.createClient(SB_URL, SB_KEY);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const $ = id => document.getElementById(id);

  try {
    const { data: rows } = await sb.from("settings").select("*");
    const s = Object.fromEntries((rows || []).filter(r => r.value && r.value.trim()).map(r => [r.key, r.value.trim()]));
    if (s.whatsapp) { WHATSAPP = s.whatsapp.replace(/\D/g, ""); $("waFloat").href = wa("Hello Alamry Tours, I want to work abroad. Please assist."); }
    if (s.hero_title) $("heroTitle").textContent = s.hero_title;
    if (s.hero_text) $("heroText").textContent = s.hero_text;
    if (s.phone) { $("ftPhone").textContent = s.phone; $("ftPhone").href = "tel:" + s.phone.replace(/[^\d+]/g, ""); }
    if (s.email) { $("ftEmail").textContent = s.email; $("ftEmail").href = "mailto:" + s.email; }
    if (s.address) $("ftAddress").textContent = s.address;
    if (s.nea_license) $("ftLicence").textContent = "NEA licence: " + s.nea_license + " · ";
  } catch (e) { console.warn("settings", e); }

  try {
    const { data: jobs } = await sb.from("jobs").select("*").eq("is_open", true).order("created_at", { ascending: false });
    if (jobs && jobs.length) {
      $("openingsGrid").innerHTML = jobs.map(j => `
        <div class="card">
          <small>${esc(j.country)}${j.category ? " · " + esc(j.category) : ""}</small>
          <h3>${esc(j.title)}</h3>
          ${j.salary ? `<p><b>${esc(j.salary)}</b></p>` : ""}
          ${j.description ? `<p>${esc(j.description)}</p>` : ""}
          <a class="btn" target="_blank" rel="noopener" href="${wa("Hello Alamry Tours, I am interested in: " + j.title + " (" + j.country + ")")}">Apply on WhatsApp</a>
        </div>`).join("");
      $("openings").hidden = false;
    }
  } catch (e) { console.warn("jobs", e); }

  try {
    const { data: media } = await sb.from("media").select("*").order("created_at", { ascending: false });
    if (media && media.length) {
      $("gallery").innerHTML = media.map(m => `
        <figure>${m.kind === "video"
          ? `<video src="${esc(m.url)}" controls preload="metadata" playsinline></video>`
          : `<img src="${esc(m.url)}" alt="${esc(m.caption || "Kenyans travelling and working abroad")}" loading="lazy">`}
          ${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}
        </figure>`).join("");
    }
  } catch (e) { console.warn("media", e); }
})();