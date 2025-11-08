let data = [];
let current = null;

// 10 ملفات JSON
let files = [
  "data1.json","data2.json","data3.json","data4.json","data5.json",
  "data6.json","data7.json","data8.json","data9.json","data10.json"
];

// ربط جميع العناصر
const search = document.getElementById("search");
const sectionFilter = document.getElementById("sectionFilter");
const langSelect = document.getElementById("langSelect");
const voiceSelect = document.getElementById("voiceSelect");
const container = document.getElementById("list");
const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mMeaning = document.getElementById("mMeaning");
const mDetails = document.getElementById("mDetails");
const settingsPanel = document.getElementById("settingsPanel");

window.onload = async () => {
  for (let file of files){
    try{
      let res = await fetch(file);
      let part = await res.json();
      data = data.concat(part);
    }catch(e){
      console.log("خطأ تحميل:", file, e);
    }
  }
  render(data);
  populateSections();
  setTimeout(()=> hideWelcome(), 4000);
  loadVoices();
};

/* عرض المصطلحات */
function hideWelcome(){document.getElementById("welcome").style.display="none";}
function render(list){
  container.innerHTML="";
  list.forEach(item=>{
    const card = document.createElement("div");
    card.className="card";
    card.innerHTML = `<h3>${item.term_en}</h3><p>${item.term_ar}</p>`;
    card.onclick = ()=>openModal(item);
    container.appendChild(card);
  });
}

/* البحث */
search.oninput = () => {
  const t = search.value.toLowerCase();
  render(data.filter(d =>
    d.term_en.toLowerCase().includes(t) ||
    d.term_ar.includes(t)
  ));
};

/* تصفية الأقسام */
sectionFilter.onchange = () => {
  const s = sectionFilter.value;
  render(s ? data.filter(d=>d.section===s) : data);
};

function populateSections(){
  const sections = [...new Set(data.map(d=>d.section))];
  sections.forEach(sec=>{
    let opt = document.createElement("option");
    opt.value = sec;
    opt.innerText = sec;
    sectionFilter.appendChild(opt);
  });
}

/* نافذة التفاصيل */
function openModal(item){
  current = item;
  mTitle.innerText = item.term_en;
  mMeaning.innerText = item.term_ar + " — " + item.meaning;
  mDetails.innerText = item.details;
  modal.style.display = "flex";
}
function closeModal(){ modal.style.display = "none"; }

/* الصوت */
let selectedVoice = null;
function loadVoices(){
  let voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((v,i)=>{
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerText = v.name;
    voiceSelect.appendChild(opt);
  });
  selectedVoice = voices[0];
}
speechSynthesis.onvoiceschanged = loadVoices;

function speakDetails(){
  if(!current) return;
  const msg = new SpeechSynthesisUtterance(
    `${current.term_en}. ${current.term_ar}. ${current.meaning}. ${current.details}`
  );
  msg.voice = selectedVoice;
  msg.lang = (langSelect.value==="ar") ? "ar" : "en-US";
  speechSynthesis.speak(msg);
}
function stopSpeak(){ speechSynthesis.cancel(); }

/* الإعدادات */
function openSettings(){ settingsPanel.classList.add("show"); }
function closeSettings(){ settingsPanel.classList.remove("show"); }
function closeSettingsByClick(e){
  if(e.target.id==="settingsPanel"){ closeSettings(); }
}

/* اللغة */
function changeLanguage(){
  let lang = langSelect.value;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang==="ar") ? "rtl" : "ltr";
}
