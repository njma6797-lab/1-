let data = [];
let files = ["data1.json", "data2.json", "data3.json", "data4.json", "data5.json"];

window.onload = async () => {
  // تحميل كل ملفات الداتا
  for (let file of files) {
    try {
      const res = await fetch(file);
      const part = await res.json();
      data = data.concat(part);
    } catch (e) {
      console.log("Error loading:", file, e);
    }
  }

  render(data);

  // رسالة الترحيب
  setTimeout(() => hideWelcome(), 5000);
};

function hideWelcome(){
  const w = document.getElementById("welcome");
  if(w) w.style.display = "none";
}

function render(list){
  const container = document.getElementById("list");
  container.innerHTML = "";

  list.forEach(item =>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${item.term_en}</h3><p>${item.term_ar}</p>`;
    card.onclick = ()=> openModal(item);
    container.appendChild(card);
  });
}

search.oninput = ()=>{
  const t = search.value.toLowerCase();
  render(
    data.filter(d =>
      d.term_en.toLowerCase().includes(t) ||
      d.term_ar.includes(t)
    )
  );
};

sectionFilter.onchange = ()=>{
  const s = sectionFilter.value;
  render(s ? data.filter(d => d.section === s) : data);
};

function openModal(item){
  current = item;
  document.getElementById("mTitle").innerText = item.term_en;
  document.getElementById("mMeaning").innerText = item.term_ar + " — " + item.meaning;
  document.getElementById("mDetails").innerText = item.details;
  document.getElementById("modal").style.display = "flex";
}

function closeModal(){ document.getElementById("modal").style.display="none"; }

function speakDetails(){
  if(!current) return;
  const msg = new SpeechSynthesisUtterance(
    `${current.term_en}. ${current.term_ar}. ${current.meaning}. ${current.details}`
  );
  msg.lang = "ar";
  speechSynthesis.speak(msg);
}
