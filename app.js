/* ===============================
      ربط 5 ملفات الداتا
===============================*/

let data = [];
let current = null;

let files = [
  "data1.json",
  "data2.json",
  "data3.json",
  "data4.json",
  "data5.json"
];

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
  setTimeout(()=> hideWelcome(), 5000);

  loadVoices();
};

/* ===============================
            عرض المصطلحات
===============================*/

function hideWelcome(){
  document.getElementById("welcome").style.display="none";
}

function render(list){
  const container=document.getElementById("list");
  container.innerHTML="";

  list.forEach(item=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h3>${item.term_en}</h3>
      <p>${item.term_ar}</p>
    `;
    card.onclick=()=>openModal(item);
    container.appendChild(card);
  });
}

search.oninput=()=>{
  const t=search.value.toLowerCase();
  render(
    data.filter(d =>
      d.term_en.toLowerCase().includes(t) ||
      d.term_ar.includes(t)
    )
  );
};

sectionFilter.onchange=()=>{
  const s=sectionFilter.value;
  render(s ? data.filter(d=>d.section===s) : data);
};

/* ===============================
            المودال
===============================*/

function openModal(item){
  current=item;
  mTitle.innerText=item.term_en;
  mMeaning.innerText=item.term_ar + " — " + item.meaning;
  mDetails.innerText=item.details;
  modal.style.display="flex";
}

function closeModal(){
  modal.style.display="none";
}

/* ===============================
         الصوت — تشغيل / إيقاف
===============================*/

let selectedVoice = null;

function loadVoices(){
  let voices = speechSynthesis.getVoices();
  let voiceSelect=document.getElementById("voiceSelect");

  voiceSelect.innerHTML="";

  voices.forEach((v,i)=>{
    let opt=document.createElement("option");
    opt.value=i;
    opt.innerText=v.name;
    voiceSelect.appendChild(opt);
  });

  selectedVoice = voices[0];
}

speechSynthesis.onvoiceschanged = loadVoices;

function changeVoice(){
  let voices=speechSynthesis.getVoices();
  selectedVoice = voices[voiceSelect.value];
}

function speakDetails(){
  if(!current) return;

  const msg = new SpeechSynthesisUtterance(
    `${current.term_en}. ${current.term_ar}. ${current.meaning}. ${current.details}`
  );

  msg.voice = selectedVoice;
  msg.lang = (langSelect.value === "ar") ? "ar" : "en-US";

  speechSynthesis.speak(msg);
}

function stopSpeak(){
  speechSynthesis.cancel();
}

/* ===============================
           الإعدادات
===============================*/

function openSettings(){
  document.getElementById("settingsPanel").classList.add("show");
}

function closeSettings(){
  document.getElementById("settingsPanel").classList.remove("show");
}

/* ===============================
           تغيير اللغة
===============================*/

function changeLanguage(){
  let lang = langSelect.value;

  if(lang === "en"){
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  } else {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }
}
