let data = [];
let current = null;
let files = ["data1.json","data2.json","data3.json","data4.json","data5.json","data6.json","data7.json","data8.json","data9.json","data10.json"];

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
  setTimeout(()=> hideWelcome(), 4000);
  loadVoices();
  initStars();
};

function hideWelcome(){document.getElementById("welcome").style.display="none";}

function render(list){
  const container=document.getElementById("list");
  container.innerHTML="";
  list.forEach(item=>{
    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <h3>${item.term_en}</h3>
      <p>${item.term_ar}</p>
      <button class="playBtn">▶️ استماع</button>
      <button class="shareBtn">🔗 مشاركة / نسخ</button>
    `;

    card.onclick=()=>openModal(item);

    card.querySelector(".playBtn").onclick=(e)=>{
      e.stopPropagation();
      current=item;
      speakDetails();
    };

    card.querySelector(".shareBtn").onclick=(e)=>{
      e.stopPropagation();
      const text=`${item.term_en}: ${item.term_ar} — ${item.meaning}\n${item.details}`;
      if(navigator.share){
        navigator.share({text});
      }else{
        navigator.clipboard.writeText(text).then(()=>alert("تم نسخ المصطلح!"));
      }
    };

    container.appendChild(card);
  });
}

/* البحث والفلاتر */
search.oninput=()=>{
  const t=search.value.toLowerCase();
  render(data.filter(d =>
    d.term_en.toLowerCase().includes(t) ||
    d.term_ar.includes(t)
  ));
};
sectionFilter.onchange=()=>{
  const s=sectionFilter.value;
  render(s ? data.filter(d=>d.section===s) : data);
};

/* مودال */
function openModal(item){
  current=item;
  mTitle.innerText=item.term_en;
  mMeaning.innerText=item.term_ar + " — " + item.meaning;
  mDetails.innerText=item.details;
  modal.style.display="flex";
}
function closeModal(){modal.style.display="none";}

/* الصوت */
let selectedVoice=null;
function loadVoices(){
  let voices=speechSynthesis.getVoices();
  selectedVoice=voices[0];
}
speechSynthesis.onvoiceschanged=loadVoices;
function speakDetails(){
  if(!current)return;
  const msg=new SpeechSynthesisUtterance(
    `${current.term_en}. ${current.term_ar}. ${current.meaning}. ${current.details}`
  );
  msg.voice=selectedVoice;
  msg.lang=(langSelect.value==="ar")?"ar":"en-US";
  speechSynthesis.speak(msg);
}
function stopSpeak(){speechSynthesis.cancel();}

/* الإعدادات */
function openSettings(){document.getElementById("settingsPanel").classList.add("show");}
function closeSettings(){document.getElementById("settingsPanel").classList.remove("show");}
function closeSettingsByClick(e){if(e.target.id==="settingsPanel"){closeSettings();}}

/* اللغة */
function changeLanguage(){
  let lang=langSelect.value;
  document.documentElement.lang=lang;
  document.documentElement.dir=(lang==="ar")?"rtl":"ltr";
}

/* نجوم Canvas */
function initStars(){
  const canvas=document.getElementById("starsCanvas");
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  const ctx=canvas.getContext("2d");
  let stars=[];
  for(let i=0;i<200;i++){
    stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.5+0.5, d:Math.random()*0.5});
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="white";
    stars.forEach(s=>{
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
      s.y+=s.d;
      if(s.y>canvas.height){s.y=0; s.x=Math.random()*canvas.width;}
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.onresize=()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight;}
}
