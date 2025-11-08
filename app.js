let data=[];
let current=null;
let files=[
  "data1.json","data2.json","data3.json","data4.json","data5.json",
  "data6.json","data7.json","data8.json","data9.json","data10.json"
];

const search=document.getElementById("search");
const sectionFilter=document.getElementById("sectionFilter");
const langSelect=document.getElementById("langSelect");
const container=document.getElementById("list");
const modal=document.getElementById("modal");
const mTitle=document.getElementById("mTitle");
const mMeaning=document.getElementById("mMeaning");
const mDetails=document.getElementById("mDetails");
const settingsPanel=document.getElementById("settingsPanel");

window.onload=async ()=>{
  for(let file of files){
    try{
      let res=await fetch(file);
      let part=await res.json();
      data=data.concat(part);
    }catch(e){console.log("خطأ تحميل:",file,e);}
  }
  render(data);
  populateSections();
  setTimeout(()=>hideWelcome(),4000);
  loadVoices();
};

function hideWelcome(){document.getElementById("welcome").style.display="none";}
function render(list){
  container.innerHTML="";
  list.forEach(item=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h3>${item.term_en}</h3>
      <p>${item.term_ar}</p>
      <button onclick="speakCard(event, ${data.indexOf(item)})">🔊 استمع</button>
      <button onclick="stopCard(event)">⏹️ إيقاف</button>
    `;
    card.onclick=()=>openModal(item);
    container.appendChild(card);
  });
}

search.oninput=()=>{const t=search.value.toLowerCase(); render(data.filter(d=>d.term_en.toLowerCase().includes(t)||d.term_ar.includes(t)));};
sectionFilter.onchange=()=>{const s=sectionFilter.value; render(s?data.filter(d=>d.section===s):data);};
function populateSections(){const sections=[...new Set(data.map(d=>d.section))];sections.forEach(sec=>{let opt=document.createElement("option");opt.value=sec;opt.innerText=sec;sectionFilter.appendChild(opt);});}

// المودال
function openModal(item){current=item;mTitle.innerText=item.term_en;mMeaning.innerText=item.term_ar + " — " + item.meaning;mDetails.innerText=item.details;modal.style.display="flex";}
function closeModal(){modal.style.display="none";}

// الإعدادات
function openSettings(){settingsPanel.classList.add("show");}
function closeSettings(){settingsPanel.classList.remove("show");}
function closeSettingsByClick(e){if(e.target.id==="settingsPanel"){closeSettings();}}

// الصوت
let selectedVoice=null;
let msg=null;
function loadVoices(){
  let voices=speechSynthesis.getVoices();
  selectedVoice=voices[0];
}
speechSynthesis.onvoiceschanged=loadVoices;
function speakCard(e,index){e.stopPropagation();speechSynthesis.cancel();let item=data[index];msg=new SpeechSynthesisUtterance(`${item.term_en}. ${item.term_ar}. ${item.meaning}. ${item.details}`);msg.voice=selectedVoice;msg.lang=(langSelect.value==="ar")?"ar":"en-US";speechSynthesis.speak(msg);}
function stopCard(e){e.stopPropagation();speechSynthesis.cancel();}

// اللغة
function changeLanguage(){let lang=langSelect.value;document.documentElement.lang=lang;document.documentElement.dir=(lang==="ar")?"rtl":"ltr";}
