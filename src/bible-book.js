/* ===================== Weekly Bible storybook (말씀 읽기) =====================
   The weekly passage opens as an illustrated book: cover -> one verse per page -> an ending page that leads to the QT.
   BOOK describes this lesson's passage (#31). A new lesson changes BOOK (id, title, reference, verses) and adds its
   own cover picture to BOOK_ART. Progress is kept per week (the week's Monday key):
     S.bible[wk]     = {id, p}  current page (1..N = verses, N+1 = ending page)
     S.bibleDone[wk] = true     once the ending page is reached (add-only)
     S.flipSound     = false    when the page sound is turned off
   All three are saved to the child's account and sync between devices like the rest of the progress. */
var BOOK={id:'col-1-13-20',no:31,ch:1,book:['골로새서','Colossians'],title:'예수님이 누구신지 바로 알아야 해요!',ref:'골로새서 1:13-20',verses:VERSES,art:'cuteBible'};
var BOOK_ART={
 /* a smiling Bible with a little cross, under a rainbow, with a smiling sun, a sleepy cloud and sticker-style hearts, stars and flowers.
    Every shape gets a white sticker outline (drawn first, thicker) and a soft shadow, like a sheet of cute stickers. */
 cuteBible:function(){
  var O=function(shape,fill,extra){return shape.replace('/>',' fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>')+shape.replace('/>',' fill="'+fill+'"'+(extra||'')+'/>');};
  var heart=function(x,y,s,c){return O('<path d="M0 7S-8 2.2-8-3a4.2 4.2 0 0 1 8-1.8A4.2 4.2 0 0 1 8-3c0 5.2-8 10-8 10z" transform="translate('+x+' '+y+') scale('+s+')"/>',c);};
  var star=function(x,y,r,c){var p='';for(var i=0;i<10;i++){var a=(i*36-90)*Math.PI/180,rr=i%2?r*.5:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(1)+' '+(y+rr*Math.sin(a)).toFixed(1);}return O('<path d="'+p+'z"/>',c,' stroke="'+c+'" stroke-width="2" stroke-linejoin="round"');};
  var spark=function(x,y,s,c){return '<path d="m'+x+' '+(y-6*s)+' '+(1.6*s)+' '+(4.4*s)+' '+(4.4*s)+' '+(1.6*s)+'-'+(4.4*s)+' '+(1.6*s)+'L'+x+' '+(y+6*s)+'l-'+(1.6*s)+'-'+(4.4*s)+'-'+(4.4*s)+'-'+(1.6*s)+' '+(4.4*s)+'-'+(1.6*s)+'z" fill="'+c+'"/>';};
  var fl=function(x,y,r,c){var h='';for(var i=0;i<5;i++){var a=(i*72-90)*Math.PI/180;h+='<circle cx="'+(x+r*1.1*Math.cos(a)).toFixed(1)+'" cy="'+(y+r*1.1*Math.sin(a)).toFixed(1)+'" r="'+(r+3.5).toFixed(1)+'" fill="#FFFFFF"/>';}for(i=0;i<5;i++){a=(i*72-90)*Math.PI/180;h+='<circle cx="'+(x+r*1.1*Math.cos(a)).toFixed(1)+'" cy="'+(y+r*1.1*Math.sin(a)).toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';}return h+'<circle cx="'+x+'" cy="'+y+'" r="'+(r*.85).toFixed(1)+'" fill="#FCD866"/>';};
  var face=function(x,y,s){return '<circle cx="'+(x-6*s)+'" cy="'+y+'" r="'+(2.6*s)+'" fill="#3A2620"/><circle cx="'+(x+6*s)+'" cy="'+y+'" r="'+(2.6*s)+'" fill="#3A2620"/><circle cx="'+(x-6.8*s)+'" cy="'+(y-.9*s)+'" r="'+(.9*s)+'" fill="#FFFFFF"/><circle cx="'+(x+5.2*s)+'" cy="'+(y-.9*s)+'" r="'+(.9*s)+'" fill="#FFFFFF"/><circle cx="'+(x-11*s)+'" cy="'+(y+6*s)+'" r="'+(3.4*s)+'" fill="#F7A39A"/><circle cx="'+(x+11*s)+'" cy="'+(y+6*s)+'" r="'+(3.4*s)+'" fill="#F7A39A"/><path d="M'+(x-4*s)+' '+(y+5*s)+'q'+(4*s)+' '+(3.6*s)+' '+(8*s)+' 0" fill="none" stroke="#3A2620" stroke-width="'+(1.8*s)+'" stroke-linecap="round"/>';};
  var cloud=function(x,y,s){return O('<path d="M'+(x-26*s)+' '+(y+8*s)+'a'+(10*s)+' '+(10*s)+' 0 0 1 '+(4*s)+'-'+(18*s)+' '+(14*s)+' '+(14*s)+' 0 0 1 '+(26*s)+'-'+(6*s)+' '+(11*s)+' '+(11*s)+' 0 0 1 '+(18*s)+' '+(10*s)+' '+(8*s)+' '+(8*s)+' 0 0 1 -'+(2*s)+' '+(14*s)+'z"/>','#FFFFFF');};
  return '<svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+t('무지개 아래에서 웃고 있는 성경책과 해님 그림')+'">'+
  /* rainbow */
  '<g fill="none" stroke-linecap="round"><path d="M60 168a90 90 0 0 1 180 0" stroke="#FFFFFF" stroke-width="44"/><path d="M68 168a82 82 0 0 1 164 0" stroke="#F7B8B0" stroke-width="12"/><path d="M80 168a70 70 0 0 1 140 0" stroke="#FBE3A0" stroke-width="12"/><path d="M92 168a58 58 0 0 1 116 0" stroke="#C6E2B0" stroke-width="12"/></g>'+
  cloud(70,170,1.05)+cloud(232,170,1.05)+
  /* sun */
  '<g stroke-linecap="round"><g stroke="#FFFFFF" stroke-width="10"><path d="M44 12v-6M44 82v6M9 47H3M79 47h6M19 22l-4-4M69 72l4 4M69 22l4-4M19 72l-4 4"/></g><g stroke="#F8C548" stroke-width="5"><path d="M44 12v-6M44 82v6M9 47H3M79 47h6M19 22l-4-4M69 72l4 4M69 22l4-4M19 72l-4 4"/></g></g>'+
  '<circle cx="44" cy="47" r="27" fill="#FFFFFF"/><circle cx="44" cy="47" r="22" fill="#FCD866"/>'+face(44,45,.9)+
  /* sleepy cloud, top right */
  '<path d="M218 58a12 12 0 0 1 4-22 16 16 0 0 1 30-6 13 13 0 0 1 22 12 10 10 0 0 1-2 16z" fill="rgba(79,111,150,.14)" transform="translate(2 4)"/>'+O('<path d="M218 58a12 12 0 0 1 4-22 16 16 0 0 1 30-6 13 13 0 0 1 22 12 10 10 0 0 1-2 16z"/>','#FFFFFF')+
  '<path d="M236 44q3 3 6 0M252 44q3 3 6 0" fill="none" stroke="#3A2620" stroke-width="1.8" stroke-linecap="round"/><circle cx="234" cy="50" r="2.8" fill="#F7A39A"/><circle cx="260" cy="50" r="2.8" fill="#F7A39A"/>'+
  /* the Bible: shadow, white sticker edge, pink cover, cream pages, cross label, smiling face */
  '<rect x="104" y="64" width="96" height="120" rx="20" fill="rgba(79,111,150,.16)" transform="translate(3 5)"/>'+
  '<rect x="104" y="64" width="96" height="120" rx="20" fill="#FFFFFF"/>'+
  '<rect x="183" y="74" width="10" height="102" rx="5" fill="#FFF6E8"/>'+
  '<rect x="110" y="70" width="78" height="108" rx="15" fill="#F6B8C4"/><rect x="110" y="70" width="15" height="108" rx="7.5" fill="#EE9AAE"/>'+
  '<rect x="134" y="86" width="42" height="34" rx="11" fill="#FFFFFF"/><path d="M155 92v22M146 100h18" stroke="#F2B33A" stroke-width="4.5" stroke-linecap="round"/>'+
  face(155,140,1)+
  '<path d="M149 70v-10l5 4 5-4v10" fill="#B7A8EE"/>'+
  /* stickers around it */
  heart(222,104,1,'#F2A79E')+heart(80,112,.8,'#F6B19A')+
  star(70,140,10,'#FCD866')+star(246,138,8,'#B7A8EE')+
  fl(256,186,6,'#9CCBE8')+fl(42,190,6,'#F2A79E')+
  spark(126,40,1.1,'#FFFFFF')+spark(186,38,.8,'#FCD866')+spark(100,92,.7,'#FFFFFF')+spark(206,86,.8,'#FFFFFF')+
  '</svg>';
 }
};
function bookArt(){return (BOOK_ART[BOOK.art]||BOOK_ART.cuteBible)();}
function bkN(){return BOOK.verses.length;}
function bkRef(n){return (isEn()?BOOK.book[1]:BOOK.book[0])+' '+BOOK.ch+':'+n;}
function bkSpread(){try{return window.matchMedia('(min-width: 760px)').matches;}catch(e){return false;}}
function bkReduce(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function bkData(){if(!S.bible||typeof S.bible!=='object'||Array.isArray(S.bible))S.bible={};if(!S.bibleDone||typeof S.bibleDone!=='object'||Array.isArray(S.bibleDone))S.bibleDone={};var wk=week().wk,r=S.bible[wk];return {wk:wk,p:r&&r.id===BOOK.id&&r.p>=1&&r.p<=bkN()+1?r.p:0,done:!!S.bibleDone[wk]};}
function bkSave(){var d=bkData(),p=ui.bk.p;S.bible[d.wk]={id:BOOK.id,p:p};if(p>bkN())S.bibleDone[d.wk]=true;save();}

/* soft paper page-turn sound, made with Web Audio (no sound file); only ever played right after a tap or swipe */
var BkSound=(function(){
 var ctx=null,noise=null;
 function init(){if(ctx)return ctx;var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{ctx=new AC();}catch(e){return null;}
  var n=Math.floor(ctx.sampleRate*.6),d,b=0;noise=ctx.createBuffer(1,n,ctx.sampleRate);d=noise.getChannelData(0);for(var i=0;i<n;i++){b=.82*b+.18*(Math.random()*2-1);d[i]=b*1.8;}return ctx;}
 function play(){
  if(S.flipSound===false)return;var c=init();if(!c)return;
  try{if(c.state==='suspended')c.resume();var t0=c.currentTime+.02,src=c.createBufferSource(),hp=c.createBiquadFilter(),bp=c.createBiquadFilter(),g=c.createGain();
   src.buffer=noise;hp.type='highpass';hp.frequency.value=450;bp.type='bandpass';bp.Q.value=.7;
   bp.frequency.setValueAtTime(900,t0);bp.frequency.exponentialRampToValueAtTime(3600,t0+.18);bp.frequency.exponentialRampToValueAtTime(1400,t0+.45);
   g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.2,t0+.07);g.gain.exponentialRampToValueAtTime(.05,t0+.22);g.gain.exponentialRampToValueAtTime(.14,t0+.32);g.gain.exponentialRampToValueAtTime(.0001,t0+.52);
   src.connect(hp);hp.connect(bp);bp.connect(g);g.connect(c.destination);src.start(t0);src.stop(t0+.56);}catch(e){}
 }
 return {play:play};
})();

/* little garden pictures drawn for this app: tiny flowers, a flower strip for the bottom of pages, a smiling watering can */
function bkFlower(x,y,r,c,ctr){var h='';for(var i=0;i<5;i++){var a=(i*72-90)*Math.PI/180;h+='<circle cx="'+(x+r*1.05*Math.cos(a)).toFixed(1)+'" cy="'+(y+r*1.05*Math.sin(a)).toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+c+'"/>';}return h+'<circle cx="'+x+'" cy="'+y+'" r="'+(r*.8).toFixed(1)+'" fill="'+(ctr||'#FFF6D6')+'"/>';}
function bkGarden(){
 var cols=['#F2A79E','#F8C548','#9CCBE8','#B7A8EE','#F6B19A','#E8828A'],x=10,i=0,
  g='<ellipse cx="40" cy="55" rx="50" ry="10" fill="#DCE7C6"/><ellipse cx="165" cy="56" rx="66" ry="10" fill="#DCE7C6"/><ellipse cx="290" cy="55" rx="52" ry="10" fill="#DCE7C6"/>';
 while(x<316){
  var c=cols[i%cols.length],ht=18+((i*7)%4)*5,cy=50-ht,k=i%4,ly=(52-ht*.45).toFixed(1);
  g+='<path d="M'+x+' 52V'+(cy+3)+'" stroke="#7FA44E" stroke-width="1.8" stroke-linecap="round"/>';
  g+='<path d="M'+x+' '+ly+(i%2?'c6-1 9-5 9-8-5 0-9 3-9 8z':'c-6-1-9-5-9-8 5 0 9 3 9 8z')+'" fill="#A9C66F"/>';
  if(k===1)g+='<path d="M'+(x-5)+' '+(cy-1)+'q0-6 2.5-8l2.5 3 2.5-3q2.5 2 2.5 8a5 5 0 0 1-10 0z" fill="'+c+'"/>';
  else if(k===3)g+='<circle cx="'+x+'" cy="'+cy+'" r="3.2" fill="'+c+'"/><circle cx="'+(x-3)+'" cy="'+(cy+4)+'" r="2.6" fill="'+c+'"/><circle cx="'+(x+3)+'" cy="'+(cy+4)+'" r="2.6" fill="'+c+'"/>';
  else g+=bkFlower(x,cy,3.4,c,k===0?'#FFF6D6':'#F8C548');
  x+=20+((i*5)%3)*5;i++;
 }
 return '<svg class="bk-garden" viewBox="0 0 320 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+g+'</svg>';
}
function bkCanArt(w){
 return '<svg width="'+w+'" height="'+Math.round(w*.75)+'" viewBox="0 0 96 72" aria-hidden="true">'+
 '<ellipse cx="72" cy="66" rx="20" ry="5" fill="#DCE7C6"/><path d="M72 64V52" stroke="#7FA44E" stroke-width="2.4" stroke-linecap="round"/><path d="M72 56c-1-6-6-9-11-8 0 5 5 9 11 8z" fill="#A9C66F"/><path d="M72 54c1-6 6-9 12-8 0 6-6 9-12 8z" fill="#8DB061"/>'+
 '<g fill="#9CCBE8"><circle cx="61" cy="33" r="1.9"/><circle cx="66" cy="40" r="1.9"/><circle cx="62" cy="46" r="1.6"/><circle cx="70" cy="36" r="1.6"/></g>'+
 '<path d="M15 26a13 11 0 0 1 26 0" fill="none" stroke="#7B9CC9" stroke-width="3.4" stroke-linecap="round"/>'+
 '<path d="M44 38l12-11" stroke="#9CCBE8" stroke-width="6" stroke-linecap="round"/><rect x="52" y="19" width="10" height="8" rx="3.5" fill="#7B9CC9" transform="rotate(-42 57 23)"/>'+
 '<rect x="8" y="24" width="38" height="30" rx="13" fill="#9CCBE8"/>'+
 '<circle cx="21" cy="38" r="1.7" fill="#3A2620"/><circle cx="32" cy="38" r="1.7" fill="#3A2620"/><path d="M24 42.5q2.5 2 5 0" stroke="#3A2620" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="43" r="2.3" fill="#F7A39A"/><circle cx="35.5" cy="43" r="2.3" fill="#F7A39A"/>'+
 bkFlower(88,12,3,'#F2A79E')+bkFlower(8,9,2.6,'#F8C548')+'<circle cx="86" cy="34" r="2" fill="#B7A8EE"/></svg>';
}
/* a few tiny flowers and dots scattered behind the Bible page, like a sticker sheet */
function bkBgDeco(){
 var spots=[[4,22,'#F2A79E',18],[90,18,'#F8C548',14],[2,48,'#9CCBE8',14],[93,40,'#B7A8EE',18],[5,74,'#F8C548',12],[91,66,'#F2A79E',14],[48,96,'#B7A8EE',12],[88,90,'#9CCBE8',16],[8,94,'#F6B19A',14]],h='';
 spots.forEach(function(s,i){var r=s[3]/2;h+='<span style="left:'+s[0]+'%;top:'+s[1]+'%"><svg width="'+(s[3]+6)+'" height="'+(s[3]+6)+'" viewBox="0 0 '+(s[3]+6)+' '+(s[3]+6)+'">'+(i%3===2?'<circle cx="'+(r+3)+'" cy="'+(r+3)+'" r="'+(r*.55)+'" fill="'+s[2]+'"/>':bkFlower(r+3,r+3,r*.5,s[2]))+'</svg></span>';});
 return '<div class="bk-bg" aria-hidden="true">'+h+'</div>';
}
function bkNumRing(n){
 var cols=['#F2A79E','#F8C548','#9CCBE8','#B7A8EE'],g='';
 for(var i=0;i<8;i++){var a=(i*45-90)*Math.PI/180;g+=bkFlower(65+57*Math.cos(a),65+57*Math.sin(a),i%2?2.6:3.4,cols[i%4]);}
 return '<span class="bk-numwrap"><svg viewBox="0 0 130 130" aria-hidden="true">'+g+'</svg><span class="bk-bignum">'+n+'</span></span>';
}
function bkCoverInner(){
 var d=bkData();
 return '<span class="bk-ribbon" aria-hidden="true"></span>'+star4(16,'#FFFFFF','position:absolute;right:16px;bottom:62px;animation:twinkle 2.2s ease-in-out infinite').replace('<svg','<svg class="bk-csp"')+star4(11,'#F8C548','position:absolute;right:42px;bottom:28px;animation:twinkle 1.8s ease-in-out .6s infinite').replace('<svg','<svg class="bk-csp"')+
 '<span class="bk-cart">'+bookArt()+'</span>'+
 '<span class="bk-ctext"><span class="bk-cchip">'+star4(11,'#9B8AE3')+t('#31 · 이번 주')+(d.done?' · '+t('읽기 완료'):'')+'</span>'+
 '<span class="bk-ctitle">'+t(BOOK.title)+'</span>'+
 '<span class="bk-cref">'+ico('<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 1-2-2z"/><path d="M13 3h5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-5z"/>',17,'#7B68D0')+t(BOOK.ref)+'</span></span>';
}
function bkCoverFace(){return '<div class="bk-cover">'+bkCoverInner()+bkGarden()+'</div>';}
/* the reading page for page p (a verse, or the ending page) */
function bkPageR(p){
 var N=bkN();
 if(p>N)return '<div class="bk-page r bk-end"><span class="bk-endstars" aria-hidden="true">'+star4(18,'#F8C548','animation:twinkle 1.6s ease-in-out infinite')+star4(12,'#B7A8EE','animation:twinkle 1.9s ease-in-out .5s infinite')+star4(14,'#F2A79E','animation:twinkle 1.7s ease-in-out .9s infinite')+'</span>'+
  '<span class="bk-endflower">'+flower(84)+'</span><h2 class="disp" style="font-size:25px;line-height:1.3">'+t('하나님의 말씀을 잘 읽었어요!')+'</h2><p style="margin:0;font-size:16px;line-height:1.6;color:#5E514A">'+t('이제 말씀을 함께 묵상해 볼까요?')+'</p>'+
  '<button type="button" class="btn dark" data-a="go" data-v="quiz" style="max-width:280px;margin-top:8px">'+t('묵상하러 가기')+arrow()+'</button><button type="button" class="ghost" data-a="bkRestart">'+t('처음부터 다시 읽기')+'</button>'+bkGarden()+'</div>';
 var v=BOOK.verses[p-1],main=(ui.tr==='en'||(ui.tr==='both'&&isEn()))?v[2]:v[1];
 return '<div class="bk-page r"><span class="bk-tape" aria-hidden="true"></span><div class="bk-ph"><span class="vn'+(ui.playing===v[0]?' now':'')+'">'+v[0]+'</span><span class="bk-ref">'+bkRef(v[0])+'</span></div>'+
 (v[3]?'<span class="chip" style="align-self:flex-start;margin-top:8px;background:#E1DBF8;color:#5B4A9E;font-size:11px">'+star4(12,'#9B8AE3')+t('이번 주 암송 구절')+'</span>':'')+
 '<div class="bk-body"><p class="bk-vt">'+main+'</p>'+(ui.tr==='both'?'<p class="bk-vsub">'+(isEn()?v[1]:v[2])+'</p>':'')+'</div><div class="bk-folio">'+p+'</div>'+bkGarden()+'</div>';
}
/* tablets: the left page of the spread, a quiet picture page for the same verse */
function bkPageL(p){
 if(p===null)return '<div class="bk-page l hide"></div>';
 var N=bkN();
 if(p>N)return '<div class="bk-page l bk-orn"><span class="bk-art bk-artmini">'+bookArt()+'</span><span class="disp" style="font-size:19px;line-height:1.35">'+t(BOOK.title)+'</span><span class="bk-ref">'+t(BOOK.ref)+'</span>'+bkGarden()+'</div>';
 var v=BOOK.verses[p-1];
 return '<div class="bk-page l bk-orn">'+bkNumRing(v[0])+'<span class="bk-ref" style="font-size:16px">'+bkRef(v[0])+'</span>'+(v[3]?'<span class="chip" style="background:#E1DBF8;color:#5B4A9E;font-size:12px">'+star4(12,'#9B8AE3')+t('이번 주 암송 구절')+'</span>':'')+
 '<span style="margin-top:4px;display:flex">'+bkCanArt(104)+'</span>'+
 '<span class="bk-folio" style="margin-top:auto">'+p+'</span>'+bkGarden()+'</div>';
}
function bkBlank(){return '<div class="bk-page l blank"></div>';}
function bkPagesHTML(lp,rp){return (bkSpread()?bkPageL(lp):'')+bkPageR(rp);}
function bkToolsHTML(){
 var seg=function(c,l){return '<button type="button" data-a="tr" data-v="'+c+'" aria-pressed="'+(ui.tr===c)+'" class="'+(ui.tr===c?'on':'')+'">'+l+'</button>';};
 var snd=S.flipSound!==false,tts=('speechSynthesis' in window);
 return '<div class="seg">'+seg('ko',t('개역개정'))+seg('en','ESV')+seg('both',t('함께'))+'</div>'+
 '<button type="button" class="bk-ib'+(ui.big?' dark':'')+'" data-a="big" aria-label="'+(ui.big?t('글자 작게'):t('글자 크게'))+'" aria-pressed="'+ui.big+'" style="width:52px;font-family:var(--display)"><span style="font-size:12px">'+t('가')+'</span><span style="font-size:18px">'+t('가')+'</span></button>'+
 (tts?'<button type="button" class="bk-ib'+(ui.playing?' on':'')+'" data-a="tts" aria-label="'+(ui.playing?t('듣기 멈추기'):t('이 쪽 소리로 듣기'))+'">'+(ui.playing?'<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3" fill="#FFFFFF"/></svg>':ico('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',20))+'</button>':'')+
 '<button type="button" class="bk-ib'+(snd?'':' mute')+'" data-a="bkSound" aria-pressed="'+snd+'" aria-label="'+(snd?t('책장 넘기는 소리 끄기'):t('책장 넘기는 소리 켜기'))+'">'+ico(snd?'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>':'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="m3 3 18 18"/>',19)+'</button>';
}
/* page arrows sit on the left and right edges of the book (half over the cover edge, never over the verse) */
function bkArrowHTML(dir){
 var b=ui.bk,N=bkN(),dis=dir<0?b.p<=1:b.p>N;
 return dir<0?'<button type="button" class="bk-arrow side prev" id="bkprev" data-a="bkPrev" aria-label="'+t('이전 장')+'"'+(dis?' disabled':'')+'>'+back()+'</button>'
  :'<button type="button" class="bk-arrow side next" id="bknext" data-a="bkNext" aria-label="'+t('다음 장')+'"'+(dis?' disabled':'')+'>'+fwd()+'</button>';
}
/* below the book: only the progress (verse n of N and the bar) */
function bkNavHTML(){
 var b=ui.bk,N=bkN(),p=Math.min(b.p,N),end=b.p>N;
 return '<div class="bk-prog" role="status"><span class="bk-pnum">'+(end?t('다 읽었어요!'):t('{n} / {t} 절',{n:p,t:N}))+'</span><span class="bar" style="display:block"><i style="width:'+(p/N*100).toFixed(1)+'%"></i></span></div>';
}
function bkChrome(){
 var a=document.getElementById('bktools');if(a)a.innerHTML=bkToolsHTML();var n=document.getElementById('bknav');if(n)n.innerHTML=bkNavHTML();
 var N=bkN(),pv=document.getElementById('bkprev'),nx=document.getElementById('bknext');if(pv)pv.disabled=ui.bk.p<=1;if(nx)nx.disabled=ui.bk.p>N;
}
/* first time on this device: a short "swipe or tap the arrows" hint at the bottom of the page (over the flower strip, not the verse) */
var BK_HINT_KEY='iamkids.bookHint';
function bkHintSeen(){try{return localStorage.getItem(BK_HINT_KEY)==='1';}catch(e){return false;}}
function bkHintShow(){
 if(bkHintSeen()||view!=='bible'||!ui.bk||!ui.bk.open)return;
 var book=document.getElementById('bkbook');if(!book||document.getElementById('bkhint'))return;
 try{localStorage.setItem(BK_HINT_KEY,'1');}catch(e){}
 var el=document.createElement('div');el.id='bkhint';el.className='bk-hint';el.setAttribute('role','status');
 el.innerHTML='<span class="bk-hand" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="#FFF6E8" stroke="#4A2C25" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10"/><path d="M12 9.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L4 15.6a1.5 1.5 0 0 1 2.3-1.9L9 16.2V11"/></svg></span><span>'+t('손가락으로 좌우로 밀거나 화살표를 눌러 책장을 넘겨보세요!')+'</span>';
 book.appendChild(el);
 ui.bkHintT=setTimeout(bkHintHide,5200);
}
function bkHintHide(){clearTimeout(ui.bkHintT);var el=document.getElementById('bkhint');if(!el)return;el.classList.add('out');setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},350);}
function bkSet(lp,rp){var el=document.getElementById('bkpages');if(el)el.innerHTML=bkPagesHTML(lp,rp);}
function bkArea(){
 var b=ui.bk,sp=bkSpread(),d=bkData();b.sp=sp;
 if(!b.open){
  var mid=d.p>1&&d.p<=bkN();
  return '<div class="bk-wrap'+(sp?' spread':'')+'"><button type="button" class="bk-closed" data-a="bkOpen" aria-label="'+t('{r} 이야기책 열기',{r:t(BOOK.ref)})+'">'+bkCoverFace()+'</button>'+
  '<div class="bk-cbtns"><button type="button" class="btn dark" data-a="bkOpen">'+ico('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',22,'#F8C548',2.2)+(mid?t('이어서 읽기')+' · '+t('{n} / {t} 절',{n:d.p,t:bkN()}):(d.done?t('다시 읽기'):t('성경책 열기')))+'</button>'+(mid?'<button type="button" class="ghost" data-a="bkFromStart">'+t('처음부터 읽기')+'</button>':'')+'</div></div>';
 }
 return '<div class="bk-wrap'+(sp?' spread':'')+'"><div class="bk-tools" id="bktools">'+bkToolsHTML()+'</div>'+
 '<div class="bk-book'+(ui.big?' big':'')+'" id="bkbook"><div class="bk-stage" id="bkstage"><div class="bk-pages" id="bkpages">'+bkPagesHTML(b.opening&&sp?null:b.p,b.p)+'</div></div>'+bkArrowHTML(-1)+bkArrowHTML(1)+'</div>'+
 '<div class="bk-nav" id="bknav">'+bkNavHTML()+'</div></div>';
}
/* a turning page: front = what it shows before turning, back = what it shows lying on the left */
function bkLeaf(front,backHtml,dir,dur,done){
 var pages=document.getElementById('bkpages'),ref=pages&&(pages.querySelector('.bk-page.r'));if(!ref){done();return;}
 var leaf=document.createElement('div');leaf.className='bk-leaf '+(dir>0?'fwd':'back');
 leaf.style.left=ref.offsetLeft+'px';leaf.style.top=ref.offsetTop+'px';leaf.style.width=ref.offsetWidth+'px';leaf.style.height=ref.offsetHeight+'px';leaf.style.setProperty('--bkd',dur+'s');
 leaf.innerHTML='<div class="bk-face f">'+front+'</div><div class="bk-face b">'+backHtml+'</div>';
 pages.appendChild(leaf);
 var fin=false,end=function(){if(fin)return;fin=true;if(leaf.parentNode)leaf.parentNode.removeChild(leaf);done();};
 leaf.addEventListener('animationend',function(e){if(e.target===leaf)end();});
 setTimeout(end,dur*1000+350);
}
function bkGo(np){
 var b=ui.bk,N=bkN();if(!b||!b.open||b.busy||view!=='bible')return;
 var op=b.p;if(np<1||np>N+1||np===op)return;
 bkHintHide();
 if(ui.playing)stopTTS();
 BkSound.play();b.p=np;bkSave();
 var sp=bkSpread(),fwdTurn=np>op;
 if(bkReduce()){bkSet(np,np);bkChrome();return;}
 b.busy=true;
 if(fwdTurn){bkSet(sp?op:np,np);bkLeaf(bkPageR(op),sp?bkPageL(np):bkBlank(),1,.7,fin);}
 else{bkSet(np,op);bkLeaf(bkPageR(np),sp?bkPageL(op):bkBlank(),-1,.7,fin);}
 bkChrome();
 function fin(){b.busy=false;if(view==='bible'&&ui.bk===b)bkSet(b.p,b.p);}
}
function bkOpen(p){
 var b=ui.bk;if(!b||b.open||b.busy)return;
 b.open=true;b.p=p;bkSave();BkSound.play();
 var reduce=bkReduce(),sp=bkSpread();b.opening=!reduce;
 keepRender();
 var nv=document.getElementById('bknav');if(nv){var over=nv.getBoundingClientRect().bottom-(window.innerHeight-96);window.scrollTo({top:Math.max(0,over>0?window.scrollY+over:0),behavior:reduce?'auto':'smooth'});}
 if(reduce){bkHintShow();return;}
 b.busy=true;
 bkLeaf(bkCoverFace(),sp?bkPageL(p):'<div class="bk-page l endp"></div>',1,.95,function(){b.busy=false;b.opening=false;if(view==='bible'&&ui.bk===b){bkSet(b.p,b.p);bkHintShow();}});
}
function bkSpeak(){
 var b=ui.bk,N=bkN();if(!b||!b.open||b.p<1||b.p>N)return;
 stopTTS();var tok=ttsToken,v=BOOK.verses[b.p-1],en=ui.tr==='en'||(ui.tr==='both'&&isEn());
 var u=new SpeechSynthesisUtterance((en?'Verse '+v[0]+'. ':v[0]+'절. ')+(en?v[2]:v[1]));u.lang=en?'en-US':'ko-KR';u.rate=.85;
 try{var vs=window.speechSynthesis.getVoices().filter(function(x){return x.lang&&x.lang.replace('_','-').indexOf(u.lang.slice(0,2))===0;});if(vs[0])u.voice=vs[0];}catch(e){}
 u.onend=u.onerror=function(){if(tok===ttsToken){ui.playing=0;bkChrome();var vn=document.querySelector('#bkpages .vn.now');if(vn)vn.classList.remove('now');}};
 ui.playing=v[0];bkChrome();var vn=document.querySelector('#bkpages .bk-page.r .vn');if(vn)vn.classList.add('now');
 window.speechSynthesis.speak(u);
}
var BK_ACTIONS={
 bkOpen:function(){var d=bkData();bkOpen(d.p>1&&d.p<=bkN()?d.p:1);},
 bkFromStart:function(){bkOpen(1);},
 bkNext:function(){bkGo(ui.bk.p+1);},
 bkPrev:function(){bkGo(ui.bk.p-1);},
 bkRestart:function(){bkGo(1);},
 bkClose:function(){var b=ui.bk;if(!b||!b.open||b.busy)return;if(ui.playing)stopTTS();b.open=false;b.opening=false;window.scrollTo(0,0);render();var c=document.querySelector('.bk-closed');if(c)c.focus({preventScroll:true});},
 bkSound:function(){S.flipSound=S.flipSound===false;save();bkChrome();if(S.flipSound)BkSound.play();}
};
/* swipe left = next page, swipe right = previous page (one page per swipe) */
(function(){
 var sw=null;
 document.addEventListener('pointerdown',function(e){if(view!=='bible'||!ui.bk||!ui.bk.open)return;var st=e.target.closest&&e.target.closest('#bkstage');if(!st||e.target.closest('button,a'))return;sw={x:e.clientX,y:e.clientY,id:e.pointerId};});
 document.addEventListener('pointerup',function(e){if(!sw||e.pointerId!==sw.id)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)bkGo(ui.bk.p+(dx<0?1:-1));});
 document.addEventListener('pointercancel',function(){sw=null;});
 document.addEventListener('keydown',function(e){if(view!=='bible'||!ui.bk||!ui.bk.open||ui.verse)return;var a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();bkGo(ui.bk.p+1);}else if(e.key==='ArrowLeft'){e.preventDefault();bkGo(ui.bk.p-1);}});
 window.addEventListener('resize',function(){if(view==='bible'&&ui.bk&&!ui.bk.busy&&ui.bk.sp!==bkSpread())keepRender();});
})();
