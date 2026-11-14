// Loads open jobs for one country page from Supabase. Reads data-countries / data-label / data-iso from <body>.
(async () => {
  const b = document.body;
  const names = JSON.parse(b.dataset.countries || "[]");
  const label = b.dataset.label || "";
  const iso = b.dataset.iso || "";
  let number = "254181308652";
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const wa = m => `https://wa.me/${number}?text=${encodeURIComponent(m)}`;
  const setWa = () => document.querySelectorAll("[data-wa]").forEach(a => a.href = wa(a.dataset.wa));
  setWa();

  const showEmpty = () => { $("jobsGrid").hidden = true; $("noJobs").hidden = false; };
  if (typeof SB_URL === "undefined" || SB_URL.startsWith("PASTE") || typeof supabase === "undefined") return showEmpty();
  const sb = supabase.createClient(SB_URL, SB_KEY);

  try {
    const { data: rows } = await sb.from("settings").select("*");
    const s = Object.fromEntries((rows || []).filter(r => r.value && r.value.trim()).map(r => [r.key, r.value.trim()]));
    if (s.whatsapp) { number = s.whatsapp.replace(/\D/g, ""); setWa(); }
    if (s.phone) { $("ftPhone").textContent = s.phone; $("ftPhone").href = "tel:" + s.phone.replace(/[^\d+]/g, ""); }
    if (s.email) { $("ftEmail").textContent = s.email; $("ftEmail").href = "mailto:" + s.email; }
    if (s.address) $("ftAddress").textContent = s.address;
  } catch (e) { console.warn("settings", e); }

  try {
    const { data: jobs, error } = await sb.from("jobs").select("*").in("country", names).eq("is_open", true).order("created_at", { ascending: false });
    if (error) throw error;
    if (!jobs || !jobs.length) return showEmpty();
    $("jobsGrid").innerHTML = jobs.map(j => `
      <div class="card">
        <small>${esc(j.country)}${j.category ? " · " + esc(j.category) : ""}</small>
        <h3>${esc(j.title)}</h3>
        ${j.salary ? `<p><b>${esc(j.salary)}</b></p>` : ""}
        ${j.description ? `<p>${esc(j.description)}</p>` : ""}
        <a class="btn" target="_blank" rel="noopener" href="${wa("Hello Alamry Tours, I am interested in: " + j.title + " (" + j.country + ")")}">Apply on WhatsApp</a>
      </div>`).join("");
    $("noJobs").hidden = true;
    if (iso) {
      const ld = jobs.map(j => ({
        "@context": "https://schema.org", "@type": "JobPosting", title: j.title,
        description: j.description || (j.title + " job in " + label),
        datePosted: String(j.created_at).slice(0, 10),
        hiringOrganization: { "@type": "Organization", name: "Alamry Tours and Travel", sameAs: location.origin },
        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: iso } },
        directApply: false
      }));
      const t = document.createElement("script"); t.type = "application/ld+json"; t.textContent = JSON.stringify(ld);
      document.head.appendChild(t);
    }
  } catch (e) { console.warn("jobs", e); showEmpty(); }
})();