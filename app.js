/* app.js — يدعم تحميل data1..data10.json، كروت مع أزرار استمع/إيقاف داخل كل كرت */
let data = [];
let current = null;
const files = [
  "data1.json","data2.json","data3.json","data4.json","data5.json",
  "data6.json","data7.json","data8.json","data9.json","data10.json"
];

const search = document.getElementById("search");
const sectionFilter = document.getElementById("sectionFilter");
const langSelect = document.getElementById("langSelect");
const voiceSelect = document.getElementById("voiceSelect");
const container = document.getElementById("list");
const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mMeaning = document.getElementById("mMeaning");
const mDetails = document.getElementById("mDetails");
const modalClose = document.getElementById("modalClose") || document.getElementById("modalClose");

window.onload = async () => {
  await loadAllData();
  render(data);
  populateSections();
  hideWelcome();
  loadVoices();
};

async function loadAllData(){
  for (const file of files){
    try{
      const res = await fetch(file);
      if(!res.ok) { console.warn("fetch failed:", file, res.status); continue; }
      const part = await res.json();
      if(Array.isArray(part)) data = data.concat(part);
    }catch(err){
      console.error("خطأ تحميل", file, err);
    }
  }
}

/* render */
function render(list){
  container.innerHTML = "";
  list.forEach((item, idx) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.innerHTML = `
      <h3>${escapeHtml(item.term_en || "")}</h3>
      <p>${escapeHtml(item.term_ar || "")}</p>
      <div class="card-controls">
        <button class="btn-play" data-idx="${idx}">استمع</button>
        <button class="btn-stop" data-idx="${idx}">إيقاف</button>
        <button class="btn-detail" data-idx="${idx}">تفاصيل</button>
      </div>
    `;
    // play
    card.querySelector(".btn-play").addEventListener("click", (e)=>{
      e.stopPropagation();
      speakItem(item);
    });
    card.querySelector(".btn-stop").addEventListener("click", (e)=>{
      e.stopPropagation();
      stopSpeak();
    });
    card.querySelector(".btn-detail").addEventListener("click", (e)=>{
      e.stopPropagation();
      openModal(item);
    });
    // فتح المودال عند كليك على الكرت نفسه
    card.addEventListener("click", ()=> openModal(item));
    container.appendChild(card);
  });
}

/* البحث */
search.addEventListener("input", ()=>{
  const t = search.value.trim().toLowerCase();
  render(data.filter(d =>
    (d.term_en || "").toLowerCase().includes(t) ||
    (d.term_ar || "").toLowerCase().includes(t)
  ));
});

/* فلتر الأقسام */
sectionFilter.addEventListener("change", ()=>{
  const s = sectionFilter.value;
  render(s ? data.filter(d=>d.section === s) : data);
});

function populateSections(){
  sectionFilter.innerHTML = '<option value="">كل الأقسام</option>';
  const sections = [...new Set(data.map(d=>d.section).filter(Boolean))].sort();
  sections.forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec; opt.textContent = sec;
    sectionFilter.appendChild(opt);
  });
}

/* مودال */
function openModal(item){
  current = item;
  document.getElementById("mTitle").innerText = item.term_en || "";
  document.getElementById("mMeaning").innerText = (item.term_ar || "") + " — " + (item.meaning || "");
  document.getElementById("mDetails").innerText = item.details || "";
  modal.setAttribute("aria-hidden","false");
  modal.style.display = "flex";
}
function closeModal(){
  modal.setAttribute("aria-hidden","true");
  modal.style.display = "none";
}
document.querySelectorAll(".modal .close").forEach(b=>b.addEventListener("click", closeModal));
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

/* أصوات */
let selectedVoice = null;
function loadVoices(){
  const voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((v,i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = v.name + (v.lang ? ` — ${v.lang}` : "");
    voiceSelect.appendChild(opt);
  });
  if(voices.length) {
    selectedVoice = voices[0];
    voiceSelect.selectedIndex = 0;
  }
}
speechSynthesis.onvoiceschanged = loadVoices;
voiceSelect.addEventListener("change", ()=>{
  const v = speechSynthesis.getVoices()[voiceSelect.value];
  if(v) selectedVoice = v;
});

function speakItem(item){
  stopSpeak();
  if(!item) return;
  const text = `${item.term_en || ""}. ${item.term_ar || ""}. ${item.meaning || ""}. ${item.details || ""}`;
  const u = new SpeechSynthesisUtterance(text);
  if(selectedVoice) u.voice = selectedVoice;
  u.lang = (langSelect.value === "ar") ? "ar-SA" : "en-US";
  speechSynthesis.speak(u);
}
function stopSpeak(){ speechSynthesis.cancel(); }

/* مساعدة صغيرة */
function hideWelcome(){ const w = document.getElementById("welcome"); if(w) w.style.display="none"; }

/* إسكييب html بسيطة */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
