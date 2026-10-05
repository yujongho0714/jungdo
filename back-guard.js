/* back-guard.js
 * 뒤로가기를 눌러도 바로 꺼지지 않고 "사이트를 종료하시겠습니까?" 팝업을 먼저 보여줍니다.
 * 사용법: 각 페이지의 </body> 바로 위에 아래 한 줄만 넣으면 됩니다.
 *   <script src="back-guard.js"></script>
 */
(function(){
  if(window.__backGuard) return; window.__backGuard=true;

  /* ---- 팝업 스타일 + 마크업 (페이지 디자인과 충돌하지 않도록 bg- 접두어 사용) ---- */
  var css=
    ".bg-wrap{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(5,9,32,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}"+
    ".bg-wrap.bg-on{display:flex;animation:bgFade .2s ease-out both}"+
    ".bg-card{width:min(340px,100%);background:#fffdf6;color:#1b2033;border-radius:22px;padding:26px 20px 20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:inherit}"+
    ".bg-title{margin:0 0 20px;font-size:20px;font-weight:800;line-height:1.35;word-break:keep-all}"+
    ".bg-btns{display:flex;gap:10px}"+
    ".bg-btns button{flex:1;padding:14px 10px;border-radius:12px;font:inherit;font-size:17px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}"+
    ".bg-no{background:#fff;color:#1b2033;border:2px solid #1b2033}"+
    ".bg-yes{background:#d62828;color:#fff;border:2px solid #d62828}"+
    "@keyframes bgFade{from{opacity:0}to{opacity:1}}";
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

  var wrap=document.createElement("div");
  wrap.className="bg-wrap"; wrap.setAttribute("role","alertdialog"); wrap.setAttribute("aria-modal","true"); wrap.setAttribute("aria-labelledby","bgTitle");
  wrap.innerHTML='<div class="bg-card"><p class="bg-title" id="bgTitle">사이트를 종료하시겠습니까?</p>'+
    '<div class="bg-btns"><button type="button" class="bg-no">아니오</button><button type="button" class="bg-yes">예</button></div></div>';
  document.body.appendChild(wrap);
  var noBtn=wrap.querySelector(".bg-no"), yesBtn=wrap.querySelector(".bg-yes");

  function isOpen(){ return wrap.classList.contains("bg-on"); }
  function show(){ wrap.classList.add("bg-on"); try{ noBtn.focus(); }catch(_){} }
  function hide(){ wrap.classList.remove("bg-on"); }

  /* ---- 방어 기록: 크롬은 터치 없이 쌓은 기록을 건너뛰므로 첫 터치/키 입력 때 쌓음 ---- */
  var armed=false, exiting=false, exitStep=false;
  function push(){ try{ history.pushState({bg:"guard"},"",location.href); }catch(_){} }
  function arm(){
    if(armed) return; armed=true;
    try{ history.replaceState({bg:"root"},"",location.href); }catch(_){}
    push();
  }
  ["pointerup","touchend","click","keydown"].forEach(function(ev){
    window.addEventListener(ev,function once(){ arm(); window.removeEventListener(ev,once,true); },true);
  });

  window.addEventListener("popstate",function(){
    if(exiting){ if(!exitStep){ exitStep=true; try{ history.back(); }catch(_){} } return; }
    if(!armed) return;
    push();
    if(isOpen()) hide(); else show();
  });

  noBtn.addEventListener("click",hide);
  wrap.addEventListener("click",function(e){ if(e.target===wrap) hide(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&isOpen()) hide(); });

  yesBtn.addEventListener("click",function(){
    exiting=true; hide();
    try{ window.close(); }catch(_){}
    setTimeout(function(){ try{ history.go(-1); }catch(_){} },150);
    setTimeout(function(){ if(!document.hidden) location.replace("about:blank"); },1200);
  });
})();
