let data=[],current=null;
let files=["data1.json","data2.json","data3.json","data4.json","data5.json","data6.json","data7.json","data8.json","data9.json","data10.json"];

const search=document.getElementById("search");
const sectionFilter=document.getElementById("sectionFilter");
const langSelect=document.getElementById("langSelectSettings");
const container=document.getElementById("list");
const modal=document.getElementById("modal");
const mTitle=document.getElementById("mTitle");
const mMeaning=document.getElementById("mMeaning");
const mDetails=document.getElementById("mDetails");
const settingsPanel=document.getElementById("settingsPanel");

let selectedVoice=null,msg=null;

window.onload=async ()=>{
  for(let f of files){
    try{let r=await fetch(f);data=data.concat(await r.json());}catch(e){console.log("خطأ تحميل:",f,e);}
  }
  render(data);populateSections();
  setTimeout(()=>document.getElementById("welcome").style.display="none",4000);
  loadVoices();
};

function render(list){
  container.innerHTML="";
  list.forEach(item=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<h3>${item.term_en}</h3><p>${item.term_ar}</p>
      <button onclick="speakCard(event,${data.indexOf(item)})">🔊 استمع</button>
      <button onclick="stopCard(event)">⏹️ إيقاف</button>`;
    card.onclick=()=>openModal(item);
    container.appendChild(card);
  });
}

search.oninput=()=>{const t=search.value.toLowerCase();render(data.filter(d=>d.term_en.toLowerCase().includes(t)||d.term_ar.includes(t)));};
sectionFilter.onchange=()=>{const s=sectionFilter.value;render(s?data.filter(d=>d.section===s):data);};
function populateSections(){[...new Set(data.map(d=>d.section))].forEach(sec=>{let opt=document.createElement("option");opt.value=sec;opt.innerText=sec;sectionFilter.appendChild(opt);});}

function openModal(item){current=item;mTitle.innerText=item.term_en;mMeaning.innerText=item.term_ar+" — "+item.meaning;mDetails.innerText=item.details;modal.style.display="flex";}
function closeModal(){modal.style.display="none";}
function openSettings(){settingsPanel.classList.add("show");}
function closeSettings(){settingsPanel.classList.remove("show");}
function closeSettingsByClick(e){if(e.target.id==="settingsPanel"){closeSettings();}}

function loadVoices(){let voices=speechSynthesis.getVoices();if(voices.length>0) selectedVoice=voices[0];}
speechSynthesis.onvoiceschanged=loadVoices;

function speakCard(e,i){e.stopPropagation();speechSynthesis.cancel();let item=data[i];msg=new SpeechSynthesisUtterance(`${item.term_en}. ${item.term_ar}. ${item.meaning}. ${item.details}`);msg.voice=selectedVoice;msg.lang=(langSelect.value==="ar")?"ar":"en-US";speechSynthesis.speak(msg);}
function stopCard(e){e.stopPropagation();speechSynthesis.cancel();}
function changeLanguage(){let lang=langSelect.value;document.documentElement.lang=lang;document.documentElement.dir=(lang==="ar")?"rtl":"ltr";}

/* النجوم */
const canvas=document.getElementById("stars");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;canvas.height=window.innerHeight;
let stars=[];
for(let i=0;i<200;i++){
  stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,radius:Math.random()*1.5+0.5,speed:Math.random()*0.5+0.2});
}
function animateStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="white";
  stars.forEach(s=>{
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);
    ctx.fill();
    s.y+=s.speed;
    if(s.y>canvas.height){s.y=0;s.x=Math.random()*canvas.width;}
  });
  requestAnimationFrame(animateStars);
}
animateStars();
