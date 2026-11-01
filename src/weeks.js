/* ===================== Weekly lesson packs (#31, #32, ...) =====================
   Each workbook week is one pack: lessons (Mon–Fri questions), Bible passage, memory verse, storybook, parent guide.
   The pack for a date is the newest pack whose Monday is on or before that date, so a new week starts by itself on Monday.
   usePack(P) points the shared names (VERSES, LESSONS, PG, BOOK, MEM ...) at one week before a screen is drawn.
   Older packs stay in WEEKS, so last week's QT, storybook and parent guide can still be opened (Home: ‹ 지난 주).
   A new week = one more pack object below + its cover picture in BOOK_ART. */
var BKN={col:['골로새서','Colossians'],phm:['빌레몬서','Philemon'],gal:['갈라디아서','Galatians'],'1co':['고린도전서','1 Corinthians']};
var BK_KO={'골로새서':'col','골':'col','빌레몬서':'phm','몬':'phm','갈라디아서':'gal','갈':'gal','고린도전서':'1co','고전':'1co'};
var BK_EN={'Colossians':'col','Col':'col','Philemon':'phm','Phlm':'phm','Galatians':'gal','Gal':'gal','1 Corinthians':'1co','1 Cor':'1co'};
function vmap(list){var o={};list.forEach(function(v){o[v[0]]=[v[1],v[2]];});return o;}

var PACK31={no:31,start:new Date(2026,9,19),code:'col',
 title:'예수님이 누구신지 바로 알아야 해요!',titleEn:"Let's Know Who Jesus Really Is!",
 ref:'골로새서 1:13-20',refEn:'Colossians 1:13–20',
 memRef:'골로새서 1:15',memRefEn:'Colossians 1:15',mem:VERSES[2][1],memEn:VERSES[2][2],
 verses:VERSES,lessons:LESSONS,lessonsEn:LESSONS_EN,pg:PG,pgEn:PG_EN,book:BOOK,memo:MEM,
 bible:{col:{1:vmap(VERSES),2:BIBLE_MORE[2],3:BIBLE_MORE[3]}}};

/* ---------- #32 · 빌레몬서 1:10-18 · 사랑받는 형제 (2026.10.26–11.1) ----------
   개역개정 and ESV text checked against the Korean Bible Society (bskorea.or.kr) and esv.org / bibleserver (ESV). */
var VERSES32=[
 [10,'갇힌 중에서 낳은 아들 오네시모를 위하여 네게 간구하노라','I appeal to you for my child, Onesimus, whose father I became in my imprisonment.'],
 [11,'그가 전에는 네게 무익하였으나 이제는 나와 네게 유익하므로','(Formerly he was useless to you, but now he is indeed useful to you and to me.)'],
 [12,'네게 그를 돌려 보내노니 그는 내 심복이라','I am sending him back to you, sending my very heart.'],
 [13,'그를 내게 머물러 있게 하여 내 복음을 위하여 갇힌 중에서 네 대신 나를 섬기게 하고자 하나','I would have been glad to keep him with me, in order that he might serve me on your behalf during my imprisonment for the gospel,'],
 [14,'다만 네 승낙이 없이는 내가 아무 것도 하기를 원하지 아니하노니 이는 너의 선한 일이 억지 같이 되지 아니하고 자의로 되게 하려 함이라','but I preferred to do nothing without your consent in order that your goodness might not be by compulsion but of your own accord.'],
 [15,'아마 그가 잠시 떠나게 된 것은 너로 하여금 그를 영원히 두게 함이리니','For this perhaps is why he was parted from you for a while, that you might have him back forever,'],
 [16,'이 후로는 종과 같이 대하지 아니하고 종 이상으로 곧 사랑 받는 형제로 둘 자라 내게 특별히 그러하거든 하물며 육신과 주 안에서 상관된 네게랴','no longer as a bondservant but more than a bondservant, as a beloved brother—especially to me, but how much more to you, both in the flesh and in the Lord.',1],
 [17,'그러므로 네가 나를 동역자로 알진대 그를 영접하기를 내게 하듯 하고','So if you consider me your partner, receive him as you would receive me.'],
 [18,'그가 만일 네게 불의를 하였거나 네게 빚진 것이 있으면 그것을 내 앞으로 계산하라','If he has wronged you at all, or owes you anything, charge that to my account.']
];
var BIBLE32={
 phm:{1:Object.assign(vmap(VERSES32),{
  8:['이러므로 내가 그리스도 안에서 아주 담대하게 네게 마땅한 일로 명할 수도 있으나','Accordingly, though I am bold enough in Christ to command you to do what is required,'],
  9:['도리어 사랑으로써 간구하노라 나이가 많은 나 바울은 지금 또 예수 그리스도를 위하여 갇힌 자 되어','yet for love’s sake I prefer to appeal to you—I, Paul, an old man and now a prisoner also for Christ Jesus—']})},
 gal:{3:{28:['너희는 유대인이나 헬라인이나 종이나 자유인이나 남자나 여자나 다 그리스도 예수 안에서 하나이니라','There is neither Jew nor Greek, there is neither slave nor free, there is no male and female, for you are all one in Christ Jesus.']}},
 '1co':{15:{3:['내가 받은 것을 먼저 너희에게 전하였노니 이는 성경대로 그리스도께서 우리 죄를 위하여 죽으시고','For I delivered to you as of first importance what I also received: that Christ died for our sins in accordance with the Scriptures,']}},
 col:{1:{20:[VERSES[7][1],VERSES[7][2]]}}
};
var LESSONS32={
 mon:{name:'마음 열기',tag:'OPEN OUR HEARTS',title:'말씀을 느껴요!',en:'Feel the Story!',color:'#F6D6D1',ink:'#7A3A35',teaser:'바울이 감옥에서 쓴 특별한 편지',qs:[
  {type:'draw',label:'그림 그리기',q:'바울은 감옥에 갇혀 있는 동안 빌레몬에게 편지를 썼어요. 바울이 편지를 쓰는 모습을 상상해 그림으로 그려 보세요.',en:'Paul wrote a letter to Philemon while he was a prisoner. Imagine the scene and draw it.',hint:'바울이 편지를 쓰는 모습을 그려 보세요',ok:'멋진 그림이에요! 바울은 갇혀 있었지만 다른 사람을 위해 편지를 썼어요.'},
  {type:'pick',label:'골라 보기',q:'당시 오네시모는 빌레몬의 종이었어요. 종으로 살아가는 오네시모는 어떤 마음이었을까요? 상상하며 골라 보세요.',en:'Onesimus was enslaved by Philemon. How might he have felt?',opts:[['두려워요','Afraid'],['슬퍼요','Sad'],['답답해요','Trapped'],['다른 마음','Another feeling']],ok:'좋아요! 성경은 오네시모의 마음을 자세히 알려 주지 않아요. 우리는 상상해 볼 수 있어요.'},
  {type:'text',bubble:true,label:'말풍선 쓰기',q:'오네시모는 바울의 편지를 가지고 빌레몬에게 돌아가고 있어요. 빌레몬을 다시 만난다면 어떤 말을 하고 싶었을까요? 말풍선에 적어 보세요.',en:'Onesimus is returning to Philemon with Paul’s letter. What might he want to say when he sees Philemon again?',ph:'오네시모가 하고 싶은 말',ok:'오네시모의 마음을 잘 상상했어요!'},
  {type:'single',label:'고르기',q:'빌레몬이 편지를 읽을 때, 바울은 어떤 일이 일어나기를 바랐을까요?',en:'What do you think Paul hoped would happen when Philemon read the letter?',opts:[['빌레몬이 오네시모를 따뜻하게 맞아줘요.','Philemon warmly welcomes Onesimus.'],['빌레몬이 오네시모를 멀리해요.','Philemon turns Onesimus away.']],answer:0,ok:'맞아요! 바울은 빌레몬이 오네시모를 따뜻하게 맞아 주기를 바랐어요.',no:'다시 생각해 봐요. 바울은 오네시모를 아끼고 사랑했어요.'}
 ]},
 tue:{name:'말씀 찾기',tag:'VIEWING WHAT HAS BEEN GIVEN',title:'말씀에 있는 그대로 찾아요',en:'Explore the Word.',color:'#E1DBF8',ink:'#4F4290',teaser:'바울은 오네시모를 누구라고 불렀을까?',qs:[
  {type:'single',label:'고르기 · 10절',q:'바울은 오네시모를 누구라고 불렀나요?',en:'What did Paul call Onesimus?',opts:[['나의 친구','My friend'],['나의 아들','My son'],['나의 선생님','My teacher']],answer:1,ok:'맞아요! 바울은 오네시모를 “갇힌 중에서 낳은 아들”이라고 불렀어요.',no:'10절을 다시 읽어 볼까요?'},
  {type:'single2',label:'고르기 · 11절',q:'바울은 오네시모가 이전과 지금 어떻게 달라졌다고 말했나요? 알맞은 말을 골라요.',en:'How did Paul describe Onesimus before and now? Choose the correct words.',groups:[{label:'이전 / Before',opts:[['무익한','Useless'],['유익한','Useful']],answer:0},{label:'지금 / Now',opts:[['무익한','Useless'],['유익한','Useful']],answer:1}],ok:'잘 찾았어요! 오네시모는 전에는 무익했지만 이제는 유익한 사람이 되었어요.',no:'11절을 다시 읽어 볼까요?'},
  {type:'single',label:'고르기 · 16절',q:'바울은 빌레몬이 오네시모를 어떻게 받아들이기를 바랐나요?',en:'How did Paul want Philemon to receive Onesimus?',opts:[['낯선 사람으로','As a stranger'],['사랑받는 형제로','As a beloved brother'],['종으로만','Only as a slave']],answer:1,ok:'맞아요! “사랑받는 형제로” 받아 달라고 했어요.',no:'16절을 다시 읽어 볼까요?'},
  {type:'text',label:'써 보기 · 18절',q:'오네시모가 빌레몬에게 잘못했거나 빚진 것이 있다면, 바울은 어떻게 하라고 했나요? 성경에서 답을 찾아 짧게 적어 보세요.',en:'What did Paul ask Philemon to do if Onesimus had wronged him or owed him anything? Find the answer in the Bible.',ph:'18절을 읽고 적어 보세요',ok:'잘 찾았어요! 바울은 “그것을 내 앞으로 계산하라”고 했어요.'}
 ]},
 wed:{name:'숨은 이야기',tag:'FINDING HIDDEN STORIES',title:'숨은 마음을 발견해요!',en:'Discover the Heart!',color:'#DCE7C6',ink:'#44572A',teaser:'바울은 왜 사랑으로 부탁했을까?',qs:[
  {type:'single',label:'고르기 · 8-9절',q:'바울은 빌레몬에게 명령할 수도 있었지만, 사랑으로 부탁했어요. 왜 그랬을까요?',en:'Paul could have commanded Philemon, but he appealed to him in love. Why?',opts:[['빌레몬이 두려워서 순종하기를 바라서','He wanted Philemon to obey out of fear.'],['빌레몬이 사랑으로 선택하기를 바라서','He wanted Philemon to choose out of love.'],['빌레몬에게 관심이 없어서','He did not care about Philemon.']],answer:1,ok:'맞아요! 바울은 빌레몬이 사랑으로 선택하기를 바랐어요.',no:'다시 생각해 봐요. 바울은 명령 대신 부탁을 했어요.'},
  {type:'multi',label:'두 가지 고르기 · 12절',q:'바울은 오네시모를 자신의 ‘심복’이라고 불렀어요. 이 말에 담긴 바울의 마음 두 가지를 골라요.',en:'Paul called Onesimus his very heart. Choose the two words that show Paul’s feelings.',opts:[['소중히 여겨요','Treasures him'],['멀리하고 싶어요','Wants to avoid him'],['사랑해요','Loves him']],answer:[0,2],ok:'맞아요! 바울은 오네시모를 소중히 여기고 사랑했어요.',no:'바울의 마음이 아닌 것도 골랐어요. 다시 살펴봐요.'},
  {type:'ox',label:'O / X · 14절',q:'바울이 빌레몬에게 바란 마음은 무엇이었을까요? 맞으면 O, 틀리면 X를 골라요.',en:'What kind of heart did Paul want Philemon to have? Mark O for true or X for false.',items:[['억지로 선한 일을 하기를 바랐어요.','He wanted Philemon to do good because he was forced.','X'],['스스로 기쁜 마음으로 선한 일을 하기를 바랐어요.','He wanted Philemon to choose to do good willingly.','O']],ok:'잘했어요! 바울은 빌레몬이 스스로 기쁜 마음으로 선한 일을 하기를 바랐어요.'},
  {type:'blanks',label:'빈칸 채우기 · 17절',q:'바울은 빌레몬에게 오네시모를 자신처럼 받아 달라고 부탁했어요. 바울은 두 사람이 어떤 관계가 되기를 바랐을까요?',en:'Paul asked Philemon to welcome Onesimus as he would welcome Paul. What kind of relationship did Paul hope they would have?',lines:[['바울은 두 사람이 ',0,'으로 서로를 대하기를 바랐어요.']],words:['미움','사랑','두려움'],answers:['사랑'],ok:'맞아요! 바울은 두 사람이 사랑으로 서로를 대하기를 바랐어요.'}
 ]},
 thu:{name:'하나님 마음',tag:'ENCOUNTERING THE HEART OF GOD',title:'하나님의 마음을 알아가요!',en:"Getting to Know God's Heart!",color:'#FBE3D2',ink:'#8A4A22',teaser:'예수님 안에서 우리는 어떻게 하나가 될까?',qs:[
  {type:'blanks',label:'빈칸 채우기 · 16절',q:'바울은 오네시모를 종이 아니라 무엇으로 받아들이라고 했나요?',en:'What did Paul ask Philemon to receive Onesimus as, rather than merely a slave?',lines:[['“종 이상으로 곧 사랑받는 ',0,'로 둘 자라.”']],words:['형제','손님','종'],answers:['형제'],ok:'맞아요! 오네시모는 이제 사랑받는 형제예요.'},
  {type:'single',label:'고르기 · 갈 3:28',q:'예수님 안에서 서로 다른 사람들이 어떻게 하나가 될 수 있을까요?',en:'What makes us one even though we are different?',opts:[['모두 똑같이 생겼기 때문에','Because we all look the same.'],['모두 예수 그리스도 안에서 하나이기 때문에','Because we are one in Jesus Christ.'],['모두 같은 일을 하기 때문에','Because we all do the same work.']],answer:1,ok:'맞아요! 우리는 모두 그리스도 예수 안에서 하나예요.',no:'갈라디아서 3:28을 함께 읽어 볼까요?'},
  {type:'blanks',label:'빈칸 채우기 · 몬 1:18 · 고전 15:3',q:'바울의 행동과 예수님의 사랑을 비교해 보세요.',en:'Compare Paul’s action with Jesus’ love.',lines:[['① 바울: “그가 만일 네게 불의를 하였거나 네게 ',0,'이 있으면 그것을 내 앞으로 계산하라.”'],['② 예수님: “이는 성경대로 그리스도께서 우리 ',1,'를 위하여 죽으시고”']],words:['빚진 것','죄','선물'],answers:['빚진 것','죄'],ok:'잘했어요! 바울은 오네시모의 빚을 대신 갚겠다고 했고, 예수님은 우리 죄를 위해 죽으셨어요.'},
  {type:'text',label:'써 보기',q:'예수님을 믿는 빌레몬과 오네시모는 서로를 어떻게 대해야 할까요?',en:'How should Philemon and Onesimus treat each other as believers in Jesus?',ph:'내 생각을 적어 보세요',ok:'좋은 생각이에요! 두 사람 모두 예수님 안에 있는 형제이기 때문이에요.'}
 ]},
 fri:{name:'내 삶으로',tag:'INTO MY LIFE',title:'나는 어떻게 살아야 할까요?',en:'How Should I Live?',color:'#FBEBB8',ink:'#6E5410',teaser:'예수님의 사랑을 누구에게 보여 줄까?',qs:[
  {type:'multi',label:'모두 고르기',q:'친구가 예전에 잘못한 일이 있어요. 그런데 친구들이 그 아이를 계속 나쁜 아이라고 불러요. 나는 어떻게 하면 좋을까요? 예수님의 사랑을 보여 주는 행동을 모두 골라요.',en:'Some friends keep calling a child bad because of a past mistake. What should you do? Check all the actions that show Jesus’ love.',opts:[['친구를 함께 놀려요.','Join in making fun of the friend.'],['친구를 나쁜 아이라고 단정하지 않아요.','Don’t label the friend as a bad person.'],['친구에게 친절하게 대해요.','Treat the friend with kindness.']],answer:[1,2],ok:'잘했어요! 한 사람의 가치는 잘못 하나로 정해지지 않아요.',no:'예수님의 사랑을 보여 주는 행동만 골라 볼까요?'},
  {type:'match',label:'짝 맞추기',q:'친구와 다투었을 때 어떤 말이 관계를 회복하는 데 도움이 될까요? 왼쪽의 말을 누르고 알맞은 행동을 오른쪽에서 눌러요.',en:'Which words can help restore a friendship after an argument? Match the words to the actions.',left:[['“미안해.”','“I’m sorry.”'],['“네 말을 들어볼게.”','“I’ll listen to you.”'],['“다시 잘 지내고 싶어.”','“I want us to be friends again.”']],right:[['화해하기','Making peace'],['잘못 인정하기','Admitting a mistake'],['상대방 이해하기','Understanding others']],answer:[1,2,0],ok:'모두 맞았어요! 이런 말들이 관계를 다시 따뜻하게 해 줘요.'},
  {type:'fill',label:'실천하기',q:'예수님이 나를 사랑하신 것처럼, 나는 누구에게 어떻게 사랑을 보여 줄 수 있을까요? 한 사람과 한 가지 행동을 적어 보세요.',en:'Who can you show Jesus’ love to this week, and how? Write one person and one action.',parts:['사랑을 보여 줄 사람: ',0,'<br>내가 할 행동: ',1],ok:'꼭 실천해 봐요! 예수님이 먼저 우리를 사랑하셨어요.'}
 ]}
};
var LESSONS32_EN={
 mon:{name:'Open Hearts',title:'Feel the Story!',teaser:'Paul’s special letter from prison',qs:[
  {label:'Draw',q:'Paul wrote a letter to Philemon while he was a prisoner. Imagine the scene and draw it.',hint:'Draw Paul writing his letter',ok:'What a wonderful picture! Paul was in prison, but he still wrote a letter to help someone else.'},
  {label:'Choose',q:'Onesimus was enslaved by Philemon. How might he have felt? Imagine and choose.',ok:'Good! The Bible doesn’t tell us exactly how Onesimus felt, but we can imagine.'},
  {label:'Speech bubble',q:'Onesimus is returning to Philemon with Paul’s letter. What might he want to say when he sees Philemon again? Write it in the speech bubble.',ph:'What Onesimus might say',ok:'You imagined Onesimus’s heart so well!'},
  {label:'Choose',q:'What do you think Paul hoped would happen when Philemon read the letter?',ok:'That’s right! Paul hoped Philemon would welcome Onesimus warmly.',no:'Let’s think again. Paul cared about Onesimus and loved him.'}
 ]},
 tue:{name:'Find the Word',title:'Explore the Word',teaser:'What did Paul call Onesimus?',qs:[
  {label:'Choose · v. 10',q:'What did Paul call Onesimus?',ok:'That’s right! Paul called Onesimus his child, whose father he became in prison.',no:'Let’s read verse 10 again.'},
  {label:'Choose · v. 11',q:'How did Paul describe Onesimus before and now? Choose the correct words.',groupLabels:['Before','Now'],ok:'Well done! Onesimus was once useless, but now he is useful.',no:'Let’s read verse 11 again.'},
  {label:'Choose · v. 16',q:'How did Paul want Philemon to receive Onesimus?',ok:'That’s right! Paul asked Philemon to receive him as a beloved brother.',no:'Let’s read verse 16 again.'},
  {label:'Write · v. 18',q:'What did Paul ask Philemon to do if Onesimus had wronged him or owed him anything? Find the answer in the Bible and write it.',ph:'Read verse 18 and write your answer',ok:'Great job! Paul said, “Charge that to my account.”'}
 ]},
 wed:{name:'Hidden Story',title:'Discover the Heart!',teaser:'Why did Paul ask in love?',qs:[
  {label:'Choose · vv. 8–9',q:'Paul could have commanded Philemon, but he appealed to him in love. Why?',ok:'That’s right! Paul wanted Philemon to choose out of love.',no:'Let’s think again. Paul asked instead of giving an order.'},
  {label:'Choose two · v. 12',q:'Paul called Onesimus his very heart. Choose the two words that show Paul’s feelings.',ok:'That’s right! Paul treasured Onesimus and loved him.',no:'You picked something that isn’t Paul’s feeling. Let’s look again.'},
  {label:'True or False · v. 14',q:'What kind of heart did Paul want Philemon to have? Choose O if it is true and X if it is false.',ok:'Well done! Paul wanted Philemon to do good willingly, with a happy heart.'},
  {label:'Fill in the blank · v. 17',q:'Paul asked Philemon to welcome Onesimus as he would welcome Paul. What kind of relationship did Paul hope they would have?',lines:[['Paul hoped they would treat each other with ',0,'.']],wordsEn:['hatred','love','fear'],ok:'That’s right! Paul hoped they would treat each other with love.'}
 ]},
 thu:{name:"God's Heart",title:"Getting to Know God's Heart!",teaser:'How can we be one in Jesus?',qs:[
  {label:'Fill in the blank · v. 16',q:'What did Paul ask Philemon to receive Onesimus as, rather than merely a slave?',lines:[['“No longer as a bondservant but more than a bondservant, as a beloved ',0,'.”']],wordsEn:['brother','guest','servant'],ok:'That’s right! Onesimus is now a beloved brother.'},
  {label:'Choose · Gal 3:28',q:'What makes us one even though we are different?',ok:'That’s right! We are all one in Christ Jesus.',no:'Let’s read Galatians 3:28 together.'},
  {label:'Fill in the blanks · Phlm 1:18 · 1 Cor 15:3',q:'Compare Paul’s action with Jesus’ love.',lines:[['① Paul: “If he has wronged you at all, or owes you ',0,', charge that to my account.”'],['② Jesus: “Christ died for our ',1,' in accordance with the Scriptures.”']],wordsEn:['anything','sins','gifts'],ok:'Well done! Paul offered to pay what Onesimus owed, and Jesus died for our sins.'},
  {label:'Write',q:'How should Philemon and Onesimus treat each other as believers in Jesus?',ph:'Write what you think',ok:'Great thinking! They are both brothers in Jesus.'}
 ]},
 fri:{name:'Into My Life',title:'How Should I Live?',teaser:'Who can I show Jesus’ love to?',qs:[
  {label:'Choose all',q:'Some friends keep calling a child bad because of a past mistake. What should you do? Check all the actions that show Jesus’ love.',ok:'Well done! A person’s worth isn’t decided by one mistake.',no:'Let’s choose only the actions that show Jesus’ love.'},
  {label:'Match',q:'Which words can help restore a friendship after an argument? Tap the words on the left, then tap the matching action on the right.',ok:'All correct! Words like these help friendships grow warm again.'},
  {label:'Do it',q:'Who can you show Jesus’ love to this week, and how? Write one person and one action.',parts:['Person I will show love to: ',0,'<br>What I will do: ',1],ok:'Try it this week! Jesus loved us first.'}
 ]}
};
/* parent guide #32 (text from the church's guide, Korean and English) */
var PG32={
 week:{chip:'이번 주 말씀 한눈에 보기',title:'사랑받는 형제',sub:'빌레몬서 — 복음은 사람을 새롭게 하고 관계를 변화시킵니다',period:'2026.10.26–11.1 · 부모님을 위한 묵상 가이드',ref:'빌레몬서 1:10-18',color:'#FBEBB8',ink:'#6E5410',desc:'한 주의 핵심 메시지와 주제',
  refs:[['본문','빌레몬서 1:10–18'],['참고 말씀','빌레몬서 1장'],['암송 말씀','빌레몬서 1:16상']],
  parts:[
   ['복음은 사람을 새롭게 하고 관계를 변화시킵니다',[
    '빌레몬서는 사도 바울이 빌레몬에게 보낸 짧고 개인적인 편지입니다. 그러나 그 안에는 예수 그리스도의 복음이 한 사람의 정체성과 사람들 사이의 관계를 어떻게 변화시키는지에 관한 깊은 신학적 메시지가 담겨 있습니다.',
    '빌레몬은 골로새 지역의 그리스도인으로, 그의 집에는 교회가 모이고 있었습니다(몬 1:2). 오네시모는 빌레몬에게 속한 종이었지만, 어떤 이유로 그를 떠나 바울과 만나게 되었습니다. 성경은 오네시모가 빌레몬에게 불의를 행했거나 빚을 졌을 가능성을 언급하지만(18절), 구체적으로 무슨 일이 있었는지는 알려 주지 않습니다.',
    '바울과 만난 오네시모는 복음을 받아들였고, 바울은 그를 자신의 아들이자 심복이라고 부를 만큼 소중히 여기게 되었습니다. 이제 바울은 오네시모를 빌레몬에게 돌려보내면서 특별한 요청을 합니다. 그를 이전처럼 종으로만 대하지 말고, 그리스도 안에서 사랑받는 형제로 받아 달라는 것입니다.',
    '당시 로마 사회에서 주인과 종의 관계는 분명한 신분적 차이를 바탕으로 형성되어 있었습니다. 그러나 바울은 이 관계 안에 복음이 가져온 새로운 기준을 제시합니다. 오네시모는 여전히 같은 사람이지만, 그리스도 안에서 그를 바라보는 시선과 대하는 방식은 달라져야 한다는 것입니다.',
    '이것이 이번 주 묵상의 중심입니다.',
    '<b>예수 그리스도의 복음은 우리에게 새로운 정체성을 주며, 다른 사람을 바라보고 대하는 태도까지 변화시킵니다.</b>']],
   ['성경의 큰 이야기 속에서 빌레몬서 바라보기',[
    '이번 주에는 빌레몬서의 작은 이야기를 성경 전체에 나타난 하나님의 구원 이야기와 연결하여 살펴보고자 합니다.',
    '하나님은 모든 사람을 자신의 형상대로 창조하셨습니다(창 1:27). 그러나 죄는 하나님과 인간의 관계뿐 아니라 사람과 사람 사이에도 갈등과 분열을 가져왔습니다. 예수 그리스도는 십자가를 통해 하나님과 우리를 화목하게 하셨으며, 그리스도 안에서 서로 다른 사람들이 하나님의 백성으로 함께 살아가는 새로운 공동체를 이루게 하셨습니다(엡 2:14–16).',
    '이러한 복음의 의미가 빌레몬서에 구체적으로 드러납니다.',
    '바울은 오네시모를 사랑받는 형제로 받아 달라고 요청했고, 그에게 빚이 있다면 자신이 책임지겠다고 말합니다. 이는 그리스도 안에서 이루어지는 화목이 단순히 마음속의 생각으로 끝나지 않고 실제적인 관계와 행동에 영향을 주어야 한다는 사실을 보여 줍니다.',
    '다만 바울이 오네시모의 빚을 책임지겠다고 한 행동과 예수 그리스도의 십자가 구속을 동일하게 해석해서는 안 됩니다. 바울의 행동은 우리를 위해 자신을 내어주신 그리스도의 사랑을 떠올리게 하는 실천적 모습으로 이해할 수 있습니다.']]],
  threeTitle:'부모님이 기억해야 할 세 가지 신학적 관점',
  three:[
   ['첫째, 용서는 잘못을 없었던 일로 만드는 것이 아닙니다.','바울은 오네시모를 사랑하면서도 그가 빌레몬에게 잘못하거나 빚진 것이 있다면 그 문제를 책임지겠다고 말합니다. 사랑과 책임은 서로 반대되지 않습니다. 아이들에게도 용서는 잘못을 무조건 괜찮다고 말하거나 자신의 상처를 무시하는 것이 아님을 알려 주세요.'],
   ['둘째, 복음은 사람의 가치를 바라보는 기준을 변화시킵니다.','바울은 오네시모를 그의 과거와 사회적 신분으로만 규정하지 않았습니다. 그리스도 안에서 사랑받는 형제라는 새로운 관계를 강조했습니다. 이는 우리가 사람을 외모, 능력, 형편, 과거의 잘못으로만 판단해서는 안 된다는 중요한 가르침으로 이어집니다.'],
   ['셋째, 사랑은 자발적인 마음에서 시작하여 행동으로 나타납니다.','바울은 빌레몬에게 명령할 수 있었지만 사랑으로 부탁했습니다(8–9절). 또한 그의 선한 행동이 억지로 이루어지기보다 자발적으로 나타나기를 원했습니다(14절). 하나님께서 기뻐하시는 사랑은 단순히 시켜서 하는 행동이 아니라, 받은 사랑을 깨닫고 스스로 선택하는 삶으로 드러납니다.']],
  verse:['빌레몬서 1:16상','이 후로는 종과 같이 대하지 아니하고 종 이상으로 곧 사랑 받는 형제로 둘 자라'],
  closing:{title:'한 주간 묵상을 마무리하며',body:[
    '이번 주 아이들은 바울이 빌레몬에게 보낸 짧은 편지를 읽으며 한 사람을 바라보는 시선이 복음 안에서 어떻게 달라지는지 묵상했습니다.',
    '오네시모는 빌레몬에게 종이었지만, 바울은 그를 사랑받는 형제로 받아 달라고 요청했습니다. 바울이 전한 복음은 단순히 새로운 지식을 배우게 하는 소식이 아니었습니다. 사람의 정체성을 새롭게 하고, 서로의 관계를 변화시키며, 사랑을 구체적인 행동으로 나타나게 하는 능력이었습니다.',
    '부모님께서도 이번 주 묵상을 마무리하면서 아이들과 함께 다음 질문을 나누어 보시면 좋겠습니다.'],
   ask:'“예수님이 나를 사랑하신다는 사실을 기억할 때, 다른 사람을 바라보는 내 마음은 어떻게 달라질 수 있을까?”',
   after:['아이가 자신의 말로 답할 수 있도록 충분히 기다려 주세요. 짧은 대답이라도 그 안에서 복음과 자신의 삶을 연결하려는 생각을 발견한다면, 그것이 이번 묵상의 중요한 열매가 될 것입니다.'],
   keyTitle:'이번 주의 핵심 메시지',
   key:'예수님은 우리를 사랑하시고 새롭게 하십니다. 그리고 그 사랑을 받은 우리가 다른 사람도 소중히 여기며 사랑하도록 이끌어 주십니다.',
   end:'작은 편지에 담긴 이 이야기를 통해 아이들이 하나님의 크고 놀라운 구원 이야기를 조금씩 알아 가기를 소망합니다.'}},
 mon:{day:'월요일',name:'마음 열기',sub:'말씀을 느껴요!',title:'바울이 보낸 특별한 편지',color:'#F6D6D1',ink:'#7A3A35',
  focus:'당시의 상황을 상상하며 성경 속 세계로 들어가기',
  body:['월요일에는 바울이 편지를 쓰는 모습과 오네시모가 처한 상황을 상상합니다. 아이들이 성경의 사건을 자신의 삶과 연결하기 전에, 먼저 그 이야기가 일어났던 시대와 사람들의 상황에 관심을 갖도록 도와주세요.',
   '당시 로마 사회의 종은 오늘날의 직원이나 가사도우미와는 달랐습니다. 종은 자유와 권리에 심각한 제약을 받았으며, 주인과 동등한 사회적 지위를 누리지 못했습니다. 이러한 배경을 간단하게 설명하면 바울이 오네시모를 ‘사랑받는 형제’로 받아 달라고 요청한 일이 얼마나 특별한 의미를 갖는지 이해하는 데 도움이 됩니다.',
   '1번에서 바울의 모습을 그릴 때는 감옥이나 갇혀 있는 상황을 함께 상상할 수 있도록 안내해 주세요. 바울은 자유롭지 못한 상황에 있었지만 다른 사람을 위해 편지를 쓰고 있었습니다.',
   '2번과 3번에서는 오네시모의 감정과 말을 상상합니다. 그러나 성경은 오네시모가 빌레몬에게 돌아가면서 어떤 마음이었는지, 무슨 말을 했는지 직접 알려 주지 않습니다. 아이가 두려움이나 걱정을 선택할 수도 있고, 빌레몬이 자신을 받아 줄 것이라는 기대를 표현할 수도 있습니다. 어느 하나를 정답으로 정하기보다 자신의 상상과 성경의 기록을 구별하도록 도와주세요.',
   '4번에서는 바울이 편지를 통해 어떤 결과를 기대했을지 생각합니다. 이때 빌레몬이 실제로 어떻게 반응했는지 성경이 알려 주지 않는다는 점을 기억해 주세요.'],
  insight:['성경 해석은 오늘날 우리의 생각을 본문에 곧바로 적용하는 것에서 시작하지 않습니다. 먼저 성경이 기록된 시대와 상황을 이해하려는 노력이 필요합니다. 아이들이 당시의 세계를 상상하는 것은 단순한 그림 활동이 아니라 성경의 역사적 배경을 이해하는 첫걸음입니다.']},
 tue:{day:'화요일',name:'말씀 찾기',sub:'말씀을 살펴요!',title:'바울은 무엇을 부탁했을까요?',color:'#E1DBF8',ink:'#4F4290',
  focus:'성경이 실제로 말하는 내용을 정확하게 발견하기',
  body:['화요일에는 본문을 자세히 읽으며 바울이 오네시모를 어떻게 소개하고, 빌레몬에게 무엇을 요청했는지 찾아봅니다.',
   '1번에서 바울은 오네시모를 자신의 ‘아들’이라고 부릅니다. 이는 오네시모가 바울의 친아들이라는 뜻이 아니라, 바울이 갇혀 있는 동안 오네시모가 복음을 받아들이게 된 영적인 관계를 나타냅니다. 아이들이 이 표현을 통해 바울과 오네시모가 얼마나 가까운 관계가 되었는지 이해하도록 안내해 주세요.',
   '2번에서는 바울이 오네시모를 이전에는 ‘무익한’ 사람이었지만 이제는 ‘유익한’ 사람이라고 표현한 점을 살펴봅니다. 오네시모라는 이름 자체가 ‘유익한’이라는 의미와 관련되어 있어, 바울은 이름의 뜻을 활용하여 그의 달라진 모습을 강조합니다.',
   '여기서 중요한 것은 오네시모가 이제 바울에게 도움이 되는 사람이 되었기 때문에 가치 있는 존재가 되었다는 뜻으로 해석하지 않는 것입니다. 사람의 가치는 유용성으로 결정되지 않습니다. 바울은 복음을 통해 오네시모에게 일어난 변화를 설명하고 있는 것입니다.',
   '3번은 이번 주 전체를 이끄는 핵심 구절입니다. 바울은 오네시모를 ‘사랑받는 형제’로 받아 달라고 요청합니다. 이 말은 단순히 친절하게 대하라는 부탁보다 깊은 의미를 갖습니다. 그리스도 안에서 두 사람이 새로운 관계를 맺게 되었다는 선언이기 때문입니다.',
   '4번에서는 바울이 오네시모의 잘못이나 빚을 자신의 책임으로 돌리라고 요청한 내용을 확인합니다. 이때 18절의 ‘만일’이라는 조건에 주목해 주세요. 성경은 오네시모가 실제로 얼마를 빚졌는지, 어떤 잘못을 저질렀는지 구체적으로 밝히지 않습니다.'],
  insight:['성경을 바르게 이해하기 위해서는 본문이 명확하게 말하는 것과 우리가 추측하는 것을 구별해야 합니다. 아이들에게 성경에서 답을 직접 찾아보게 하는 것은 단순한 성경 지식 확인이 아니라 말씀에 근거하여 생각하는 습관을 기르는 훈련입니다.']},
 wed:{day:'수요일',name:'숨은 이야기',sub:'숨은 마음을 발견해요!',title:'바울의 부탁에 담긴 마음',color:'#DCE7C6',ink:'#44572A',
  focus:'바울의 말과 행동 속에 담긴 의도를 발견하기',
  body:['수요일에는 바울이 무엇을 말했는지를 넘어 왜 그렇게 말했는지를 생각합니다.',
   '1번에서는 바울이 명령할 수도 있었지만 사랑으로 부탁했다는 사실에 주목합니다(8–9절). 바울에게는 사도로서 권위를 가지고 요청할 수 있는 위치가 있었지만, 그는 빌레몬에게 사랑에 근거한 결정을 요청합니다.',
   '3번의 내용도 이와 연결됩니다. 바울은 빌레몬이 억지로 선한 일을 행하기보다 자발적인 마음으로 선택하기를 원했습니다(14절). 이는 기독교 윤리에서 중요한 의미를 갖습니다. 선한 행동은 외적인 행위뿐 아니라 그 행동을 선택하는 마음과 동기도 함께 살펴야 하기 때문입니다.',
   '2번에서 바울은 오네시모를 자신의 ‘심복’이라고 부릅니다. 원문에서 이 표현은 내장이나 마음을 가리키는 단어로, 매우 깊은 애정을 나타냅니다. 오네시모는 바울에게 단순히 도움을 주는 사람이 아니라 마음을 나누는 소중한 사람이 되었습니다.',
   '4번에서는 바울이 빌레몬에게 오네시모를 자기 자신을 맞이하듯 받아 달라고 한 요청을 묵상합니다(17절). 바울은 자신의 관계와 신뢰를 활용하여 오네시모가 받아들여질 수 있도록 돕고 있습니다.',
   '부모님은 아이들과 함께 누군가를 사랑한다는 말이 실제로 어떤 태도와 행동으로 나타날 수 있는지 생각해 보세요. 그러나 수요일에는 아직 아이들에게 특정 행동을 실천하라고 요구하기보다, 바울의 마음을 충분히 발견하도록 안내하는 것이 좋습니다.'],
  insight:['바울의 요청에는 사랑과 자발성이라는 중요한 가치가 담겨 있습니다. 그는 자신의 권위로 상대방의 행동을 강제하기보다, 복음을 받은 사람이 사랑으로 응답하기를 기대했습니다. 이 모습은 부모가 자녀의 신앙을 지도할 때에도 의미가 있습니다. 믿음의 행동을 단순히 요구하는 것에서 나아가, 아이가 왜 그렇게 살아야 하는지 스스로 이해하고 선택하도록 돕는 것이 중요합니다.']},
 thu:{day:'목요일',name:'하나님 마음',sub:'하나님의 마음을 알아요!',title:'예수님 안에서 새로워지는 관계',color:'#FBE3D2',ink:'#8A4A22',
  focus:'빌레몬서의 이야기를 예수 그리스도의 복음과 연결하기',
  body:['목요일에는 바울과 오네시모, 빌레몬의 이야기를 성경 전체의 구원 이야기 속에서 바라봅니다.',
   '1번에서는 빌레몬서 1:16을 통해 바울이 오네시모를 ‘종’이 아니라 <b>‘사랑받는 형제’</b>로 받아들이라고 요청한 의미를 살펴봅니다.',
   '당시 로마 사회에서 종과 주인은 사회적 신분과 권리에 큰 차이가 있었습니다. 그러나 바울은 오네시모가 그리스도 안에서 새롭게 된 사람이므로, 빌레몬도 그를 이전의 신분으로만 바라보아서는 안 된다고 강조합니다.',
   '이는 복음이 단순히 개인의 내면을 변화시키는 데 그치지 않고, 사람과 사람 사이의 관계를 새롭게 한다는 사실을 보여 줍니다.',
   '아이들에게 ‘사랑받는 형제’라는 표현은 단순히 친하게 지내라는 뜻이 아니라, 예수님 안에서 서로를 소중한 하나님의 가족으로 받아들이라는 의미임을 설명해 주세요.',
   '2번에서는 갈라디아서 3:28을 읽으며 그리스도 안에서 서로 다른 사람들이 하나라는 사실을 발견합니다. 당시 사회에서는 출신과 신분, 성별에 따라 사람을 구분했습니다. 그러나 그리스도 안에서는 이러한 차이가 하나님의 백성으로서 서로를 받아들이는 데 장벽이 되어서는 안 됩니다.',
   '3번에서는 바울이 오네시모의 빚을 자신에게 계산하라고 한 행동과 우리의 죄를 위해 죽으신 예수님의 사랑을 비교합니다. 바울은 다른 사람의 부담을 자신이 감당하겠다고 했고, 예수님은 우리를 위해 십자가에서 자신을 내어주셨습니다.',
   '여기서 바울의 행동은 예수님의 구속 사역과 동일하지 않지만, 그리스도의 사랑을 닮아 가는 삶이 어떤 모습인지 보여 줍니다. 복음은 우리가 하나님께 받은 사랑을 다른 사람과의 관계 속에서 실천하도록 이끕니다.',
   '4번에서는 빌레몬과 오네시모가 그리스도 안에서 서로를 어떻게 대해야 하는지 생각합니다. 아이들이 ‘사랑해야 해요’, ‘존중해야 해요’, ‘형제로 받아들여야 해요’와 같은 표현으로 답한다면, 그 이유가 두 사람 모두 그리스도 안에 속한 사람이기 때문이라는 점을 함께 살펴주세요.'],
  insight:['빌레몬서는 복음이 개인의 내면에만 머무르지 않고 인간관계에 새로운 질서를 가져온다는 사실을 보여 줍니다. 주인과 종이라는 기존의 사회적 관계를 넘어, 바울은 그리스도 안에서 서로를 사랑받는 형제로 대하도록 요청합니다. 이것이 그리스도 안에서 이루어지는 새로운 공동체의 모습입니다.',
   '특히 부모님은 아이들이 이 이야기를 단순히 ‘착하게 살아야 한다’는 교훈으로 받아들이지 않도록 도와주세요. 우리가 사랑해야 하는 근거는 예수님께서 먼저 우리를 사랑하셨다는 복음에 있습니다.']},
 fri:{day:'금요일',name:'내 삶으로',sub:'말씀대로 살아가요!',title:'예수님의 사랑을 삶으로',color:'#D6ECF5',ink:'#2F5A72',
  focus:'복음으로 다른 사람을 바라보고 사랑을 실천하기',
  body:['금요일에는 한 주간 발견한 말씀을 일상적인 관계 속으로 가져옵니다.',
   '1번에서는 과거에 잘못한 친구를 계속 나쁜 아이라고 부르는 상황을 제시합니다. 아이들이 친구의 잘못을 무조건 괜찮다고 생각하도록 하는 것이 아니라, 한 사람의 가치를 그가 저지른 잘못으로만 판단해서는 안 된다는 사실을 배우도록 안내해 주세요.',
   '이는 바울이 오네시모를 과거의 신분이나 잘못으로만 바라보지 않고 그리스도 안에서 사랑받는 형제로 받아들였던 태도와 연결됩니다.',
   '2번에서는 다툰 친구와 관계를 회복하기 위해 필요한 말을 찾아봅니다. ‘미안해’, ‘네 말을 들어볼게’, ‘다시 잘 지내고 싶어’라는 말은 각각 자신의 잘못을 인정하고 상대방을 이해하며 화해를 향해 나아가는 태도를 보여 줍니다.',
   '이때 모든 갈등이 반드시 즉시 화해로 이어져야 한다고 가르치지 않도록 주의해 주세요. 잘못을 인정하고 사과하는 일은 중요하지만, 용서가 곧바로 신뢰의 회복을 의미하지는 않습니다. 특히 누군가 반복해서 상처를 주거나 위험한 행동을 한다면 부모님이나 믿을 만한 어른에게 도움을 요청해야 합니다.',
   '3번에서는 아이가 실제로 사랑을 보여 줄 한 사람과 한 가지 행동을 정합니다. 부모님은 아이가 거창한 행동을 선택하도록 요구하기보다 일상에서 실천할 수 있는 작은 사랑을 발견하도록 도와주세요.',
   '먼저 인사하기, 외로운 친구에게 말 걸기, 동생의 이야기를 끝까지 듣기, 잘못한 일을 인정하고 사과하기 등 구체적이고 실천 가능한 행동이면 충분합니다.',
   '중요한 것은 아이가 사랑을 실천해야만 하나님의 사랑을 받을 수 있다고 생각하지 않는 것입니다. 우리는 하나님의 사랑을 얻기 위해 사랑하는 것이 아니라, 이미 그리스도 안에서 받은 사랑에 응답하여 사랑합니다.'],
  insight:['성경의 적용은 본문에서 발견한 의미와 분리되어서는 안 됩니다. 빌레몬서의 중심은 단순히 다른 사람에게 친절하게 대하라는 도덕적 가르침이 아닙니다. 그리스도 안에서 새로워진 정체성이 사람을 바라보는 시선과 실제 관계를 변화시킨다는 복음의 선언입니다. 그러므로 금요일의 실천도 예수님의 사랑에서 출발해야 합니다.']}
};
var PG32_EN={
 week:{chip:'This Week at a Glance',title:'A Beloved Brother',sub:'Philemon — The Gospel Makes Us New and Transforms Our Relationships',period:'Oct 26 – Nov 1, 2026 · Devotional Guide for Parents',ref:'Philemon 1:10–18',desc:"This week's main message and theme",
  refs:[['Passage','Philemon 1:10–18'],['Further reading','Philemon 1'],['Memory verse','Philemon 1:16a']],
  parts:[
   ['The Gospel Makes Us New and Transforms Our Relationships',[
    'Philemon is a short and personal letter written by the Apostle Paul to a fellow believer named Philemon. Although the letter addresses a particular situation between individuals, it contains a profound theological message about how the gospel of Jesus Christ transforms both our identity and our relationships with others.',
    'Philemon was a Christian whose home served as a gathering place for the church (Philemon 1:2). Onesimus was an enslaved man belonging to Philemon who had become separated from him and eventually encountered Paul. Scripture suggests the possibility that Onesimus had wronged Philemon or owed him something (v. 18), but it does not explain exactly what happened.',
    'Through his encounter with Paul, Onesimus came to faith in Christ. Paul grew to love him deeply, referring to him as his son and even his very heart. Paul then sent Onesimus back to Philemon with an extraordinary request: Receive Onesimus no longer merely as a slave, but as a beloved brother in Christ.',
    'In Roman society, the relationship between an enslaved person and an owner was defined by a significant difference in social status, freedom, and legal rights. Yet Paul introduced a new way of understanding their relationship, one shaped by the gospel.',
    'Onesimus was still the same person, but because of his new identity in Christ, the way Philemon viewed and treated him needed to change.',
    'This is the central message of our devotional this week:',
    '<b>The gospel of Jesus Christ gives us a new identity and transforms the way we see and treat others.</b>']],
   ['Understanding Philemon Within the Bigger Story of the Bible',[
    "This week, we want to help our children recognize that the story of Philemon is part of God's greater story of redemption.",
    "God created every human being in His image (Genesis 1:27). However, sin brought brokenness not only into humanity's relationship with God but also into relationships between people.",
    "Through Jesus Christ, God reconciled us to Himself and brought peace through the cross. In Christ, people from different backgrounds are brought together as members of God's family (Ephesians 2:14–16).",
    'The letter to Philemon offers a practical glimpse of what this gospel-centered reconciliation can look like.',
    'Paul asked Philemon to receive Onesimus as a beloved brother. He even offered to take responsibility for anything Onesimus owed. These actions remind us that reconciliation is not simply an idea or a feeling. The gospel calls us to express love through meaningful actions and renewed relationships.',
    "However, we should not interpret Paul's willingness to assume Onesimus's debt as being identical to Christ's redemptive work on the cross. Rather, Paul's actions can be understood as a human expression of love that reflects the sacrificial love of Christ."]]],
  threeTitle:'Three Theological Truths for Parents to Remember',
  three:[
   ['First, forgiveness does not mean pretending that wrongdoing never happened.','Paul loved Onesimus, but he did not simply ignore the possibility that Onesimus had wronged Philemon or owed him something. Instead, Paul offered to take responsibility for the debt. Love and responsibility are not opposites. Help your child understand that forgiveness does not require denying wrongdoing, ignoring pain, or pretending that harmful actions do not matter.'],
   ['Second, the gospel changes how we recognize the value of others.',"Paul did not define Onesimus only by his past or his social position. He emphasized Onesimus's new relationship with Philemon as a beloved brother in Christ. This teaches us that a person's worth should not be determined by appearance, abilities, circumstances, social position, or past mistakes."],
   ['Third, genuine love grows from a willing heart and becomes visible through action.',"Paul could have commanded Philemon, but he chose to appeal to him through love (vv. 8–9). He wanted Philemon's good deed to come willingly rather than through compulsion (v. 14). Christian love is more than doing the right thing because someone tells us to. It is a response that grows from understanding the love we have already received in Christ."]],
  threeAfter:['Throughout this week, rather than immediately providing answers, encourage your child to observe what the Bible actually says. Help them distinguish between what Scripture clearly records and what we may imagine or infer.',
   'Learning to observe Scripture carefully, understand its meaning in context, and connect a particular passage to the larger message of the gospel is an essential part of growing in biblical understanding.'],
  verse:['Philemon 1:16a','No longer as a bondservant but more than a bondservant, as a beloved brother.'],
  closing:{title:"Closing This Week's Devotional",body:[
    'Throughout this week, children have explored a short letter written by Paul to Philemon and discovered how the gospel can change the way we view and treat others.',
    'Onesimus had been enslaved by Philemon, yet Paul asked that he be received as a beloved brother in Christ. The gospel Paul preached was not simply a collection of religious teachings or new information. It was the good news of Jesus Christ, bringing new life, a new identity, and a new way of relating to others.',
    "Paul's letter reminds us that God's love is not meant to remain an abstract idea. It is meant to shape our attitudes, our decisions, and our relationships.",
    "As you conclude this week's devotional, consider discussing this question with your child:"],
   ask:'“When I remember how much Jesus loves me, how might that change the way I see and treat other people?”',
   after:['Give your child time to think and respond in their own words. Even a simple answer can reveal that your child is beginning to connect the truth of the gospel with everyday life.',
    "This is one of the most meaningful goals of devotional learning: not merely knowing what the Bible says, but gradually learning to understand God's Word and live in response to it."],
   keyTitle:"This Week's Key Message",
   key:'Jesus loves us and makes us new. Because we have received His love, we are called to value and love others as He has loved us.',
   end:"May this small but meaningful letter help our children discover a little more of God's great story of redemption and grow in their ability to recognize His love throughout Scripture and in their everyday lives."}},
 mon:{day:'Monday',name:'Open Hearts',sub:'Feel the Story!',title:"Paul's Special Letter",
  focus:'Entering the world of the Bible through imagination and historical understanding',
  body:['On Monday, children will imagine Paul writing his letter and consider the situation Onesimus may have faced. Before connecting the biblical story to their own experiences, help children become familiar with the historical world in which the events took place.',
   "In Roman society, an enslaved person was not simply an employee or household helper. Enslaved people lived with serious restrictions on their freedom and legal rights and did not enjoy the same social standing as their owners. A simple explanation of this background can help children begin to understand why Paul's request to receive Onesimus as a beloved brother was so significant.",
   'In Question 1, encourage your child to imagine Paul writing his letter while imprisoned. Although Paul was not free, he continued caring for others and writing on their behalf.',
   "Questions 2 and 3 invite children to imagine Onesimus's feelings and what he might have wanted to say when returning to Philemon. However, Scripture does not tell us exactly how Onesimus felt or what he said. Your child might imagine that Onesimus felt afraid, worried, or hopeful. Rather than choosing one emotion as the correct answer, encourage your child to recognize the difference between what Scripture records and what we imagine.",
   'Question 4 asks children to consider what Paul hoped would happen when Philemon received the letter. Remember that the Bible does not tell us how Philemon ultimately responded.'],
  insight:['Understanding Scripture begins with recognizing that the biblical world was different from our own. We should not immediately impose modern assumptions on an ancient text. Instead, we first seek to understand its historical and cultural setting.',
   'When children imagine the circumstances surrounding Paul and Onesimus, they are taking an early step toward interpreting Scripture within its original context.']},
 tue:{day:'Tuesday',name:'Find the Word',sub:'Explore the Word!',title:'What Did Paul Ask Philemon to Do?',
  focus:'Discovering what Scripture actually says',
  body:['On Tuesday, children will carefully examine the passage to discover how Paul describes Onesimus and what he asks Philemon to do.',
   'In Question 1, Paul refers to Onesimus as his "son." This does not mean Onesimus was Paul\'s biological child. Rather, it expresses their spiritual relationship, since Onesimus came to faith while Paul was imprisoned. Help your child recognize the affection and spiritual connection behind Paul\'s words.',
   'Question 2 focuses on Paul\'s description of Onesimus as formerly "useless" but now "useful." The name Onesimus is associated with the idea of being useful or beneficial. Paul appears to use this wordplay to emphasize the change that has taken place in Onesimus\'s life.',
   'However, we must be careful not to suggest that Onesimus became valuable only because he became useful to Paul. A person\'s worth is not determined by how helpful or productive that person is. Instead, Paul is describing the transformation associated with Onesimus\'s new life in Christ.',
   'Question 3 introduces the central verse of the week. Paul asks Philemon to receive Onesimus as a beloved brother. This request goes beyond simply treating someone kindly. It recognizes a new relationship established through their shared identity in Christ.',
   'Question 4 examines Paul\'s willingness to take responsibility for anything Onesimus may have owed. Draw attention to the conditional language of verse 18: "If he has wronged you at all, or owes you anything." The Bible does not specify exactly what Onesimus did or how much he may have owed.'],
  insight:['Faithful biblical interpretation requires distinguishing between what Scripture explicitly states and what we assume or infer.',
   'Helping children search the passage for answers is more than a Bible knowledge exercise. It teaches them to base their understanding on Scripture rather than on personal assumptions. This habit provides an important foundation for lifelong Bible study.']},
 wed:{day:'Wednesday',name:'Hidden Story',sub:'Discover the Heart!',title:"The Heart Behind Paul's Request",
  focus:"Discovering the intentions behind Paul's words and actions",
  body:['On Wednesday, children move beyond identifying what Paul said to considering why he said it.',
   "Question 1 focuses on Paul's choice to appeal to Philemon through love rather than command (vv. 8–9). As an apostle, Paul believed he had the authority to instruct Philemon. Nevertheless, he chose to make a personal appeal grounded in love.",
   "Question 3 connects closely with this idea. Paul wanted Philemon's good deed to come willingly, not through compulsion (v. 14). This reveals an important principle of Christian ethics: the outward appearance of a good action is not the only thing that matters. The attitude and motivation behind an action are also important.",
   'In Question 2, Paul describes Onesimus as his "very heart." The Greek expression uses a word associated with deep inward feelings and affection. It communicates how precious Onesimus had become to Paul. Onesimus was not simply someone who could help Paul with practical tasks. He was someone Paul deeply loved.',
   "Question 4 highlights Paul's request that Philemon welcome Onesimus as he would welcome Paul himself (v. 17). Paul was willing to use his own relationship with Philemon to advocate for Onesimus and encourage reconciliation.",
   "As you discuss these questions, help your child think about how love can shape the way we speak and respond to others. However, Wednesday is primarily about understanding Paul's intentions. There is no need to rush immediately into personal application. Allow your child time to discover the meaning behind Paul's words."],
  insight:["Paul's appeal demonstrates the relationship between love, authority, and willing obedience. Rather than relying only on his authority to secure Philemon's compliance, Paul encouraged a response motivated by love.",
   "This principle also has implications for Christian parenting. Our goal is not merely to produce outwardly correct behavior. We want our children to gradually understand why certain actions reflect God's character and to develop the ability to make thoughtful, willing choices rooted in faith."]},
 thu:{day:'Thursday',name:"God's Heart",sub:"Getting to Know God's Heart!",title:'Relationships Made New in Jesus Christ',
  focus:"Connecting Philemon's story to the larger message of the gospel",
  body:['Thursday invites children to connect the events in Philemon with the broader biblical story of salvation and reconciliation.',
   'Question 1 focuses on Philemon 1:16, where Paul asks Philemon to receive Onesimus not merely as a slave, but as <b>a beloved brother</b> in Christ.',
   "In Roman society, enslaved people and their owners had very different social positions and legal rights. However, Paul emphasizes that Onesimus's new identity in Christ should change the way Philemon sees and treats him.",
   "This reveals an important truth: the gospel does not simply transform a person's inner life. It also transforms the way we relate to others.",
   "Help your child understand that being a “beloved brother” means more than simply being friendly. It means recognizing and welcoming one another as valued members of God's family through Jesus Christ.",
   "Question 2 introduces Galatians 3:28, which teaches that believers from different backgrounds are one in Christ Jesus. In the ancient world, distinctions of ethnicity, social status, and gender strongly influenced how people viewed and treated one another. Yet Paul teaches that these differences do not prevent believers from belonging together to Christ. The gospel does not mean that every human difference disappears. Rather, those differences should not become barriers to recognizing one another as valued members of God's family.",
   "Question 3 compares Paul's willingness to take responsibility for Onesimus's debt with Jesus' sacrifice for our sins. Paul offered to assume the cost of what Onesimus might owe. Jesus Christ gave Himself for our sins through His death on the cross.",
   "Although Paul's action is not equivalent to Christ's saving work, it helps us recognize how sacrificial love can be expressed in human relationships. The gospel invites us not only to receive God's love but also to reflect that love in the way we treat others.",
   'Question 4 asks children how Philemon and Onesimus should treat one another as believers in Jesus. Children may respond with ideas such as love, respect, forgiveness, or welcoming one another as brothers. Help them understand the reason behind these responses: both men now belonged to Christ.'],
  insight:["Philemon demonstrates that the gospel does not remain only within a person's private spiritual life. It has implications for the relationships and social structures in which people live.",
   "Within a society shaped by the distinction between enslaved people and owners, Paul called Philemon to recognize Onesimus as a beloved brother in Christ. This request challenges the assumption that social position should determine a person's worth or the love and respect that person receives.",
   'As you guide your child, avoid reducing this passage to a simple moral instruction such as "Be nice to others." The foundation of Christian love is the gospel: We love because Christ first loved us. Our actions are meant to flow from this truth.']},
 fri:{day:'Friday',name:'Into My Life',sub:'How Should I Live?',title:'Living Out the Love of Jesus',
  focus:'Applying the gospel to everyday relationships',
  body:['On Friday, children bring what they have learned throughout the week into their relationships with others.',
   'Question 1 presents a situation in which a child continues to be labeled as bad because of a past mistake. The purpose is not to teach that wrongdoing should be ignored or excused. Rather, it is to help children recognize that a person\'s identity and value should not be reduced to something they have done wrong. This connects with Paul\'s request that Philemon receive Onesimus as a beloved brother rather than viewing him only through his former position or past circumstances.',
   'Question 2 encourages children to identify words that can help restore a relationship after an argument. Expressions such as "I\'m sorry," "I\'ll listen to you," and "I want us to be friends again" represent important aspects of reconciliation: admitting wrongdoing, listening with understanding, and expressing a desire for peace.',
   'At the same time, be careful not to teach children that every conflict must result in immediate reconciliation. Acknowledging wrongdoing and offering forgiveness are important, but forgiveness does not automatically restore trust. If someone repeatedly hurts a child or behaves in an unsafe way, the child should know that seeking help from a parent or trusted adult is appropriate and necessary.',
   'Question 3 invites children to choose one person to whom they can show love and one specific action they can take. Encourage your child to think of simple and realistic ways to practice love. They might greet someone who often feels left out, invite a classmate to play, listen patiently to a sibling, or acknowledge a mistake and offer a sincere apology.',
   'The goal is not to accomplish something impressive. Instead, help your child understand that even small actions can become meaningful expressions of the love they have received from Jesus.',
   "Most importantly, children should never feel that they must perform loving actions in order to earn God's love. We do not love others to make God love us. We love because God has already loved us in Christ."],
  insight:['Faithful application of Scripture must grow out of the meaning of the passage itself. The central message of Philemon is not simply that Christians should be kind. It is that our new identity in Christ changes how we understand and relate to other people.',
   "Therefore, Friday's activities should not become merely a checklist of good behavior. Instead, they should provide opportunities for children to respond to the gospel through thoughtful and loving actions."]}
};
/* storybook cover for #32: a smiling letter (Paul's letter) with a heart seal, two little heart friends, sun, cloud and stickers */
BOOK_ART.cuteLetter=function(){
 var O=function(shape,fill,extra){return shape.replace('/>',' fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>')+shape.replace('/>',' fill="'+fill+'"'+(extra||'')+'/>');};
 var HP='M0 7S-8 2.2-8-3a4.2 4.2 0 0 1 8-1.8A4.2 4.2 0 0 1 8-3c0 5.2-8 10-8 10z';
 var heart=function(x,y,s,c){return O('<path d="'+HP+'" transform="translate('+x+' '+y+') scale('+s+')"/>',c);};
 var star=function(x,y,r,c){var p='';for(var i=0;i<10;i++){var a=(i*36-90)*Math.PI/180,rr=i%2?r*.5:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(1)+' '+(y+rr*Math.sin(a)).toFixed(1);}return O('<path d="'+p+'z"/>',c,' stroke="'+c+'" stroke-width="2" stroke-linejoin="round"');};
 var spark=function(x,y,s,c){return '<path d="m'+x+' '+(y-6*s)+' '+(1.6*s)+' '+(4.4*s)+' '+(4.4*s)+' '+(1.6*s)+'-'+(4.4*s)+' '+(1.6*s)+'L'+x+' '+(y+6*s)+'l-'+(1.6*s)+'-'+(4.4*s)+'-'+(4.4*s)+'-'+(1.6*s)+' '+(4.4*s)+'-'+(1.6*s)+'z" fill="'+c+'"/>';};
 var fl=function(x,y,r,c){var h='',i,a;for(i=0;i<5;i++){a=(i*72-90)*Math.PI/180;h+='<circle cx="'+(x+r*1.1*Math.cos(a)).toFixed(1)+'" cy="'+(y+r*1.1*Math.sin(a)).toFixed(1)+'" r="'+(r+3.5).toFixed(1)+'" fill="#FFFFFF"/>';}for(i=0;i<5;i++){a=(i*72-90)*Math.PI/180;h+='<circle cx="'+(x+r*1.1*Math.cos(a)).toFixed(1)+'" cy="'+(y+r*1.1*Math.sin(a)).toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';}return h+'<circle cx="'+x+'" cy="'+y+'" r="'+(r*.85).toFixed(1)+'" fill="#FCD866"/>';};
 var face=function(x,y,s){return '<circle cx="'+(x-6*s)+'" cy="'+y+'" r="'+(2.6*s)+'" fill="#3A2620"/><circle cx="'+(x+6*s)+'" cy="'+y+'" r="'+(2.6*s)+'" fill="#3A2620"/><circle cx="'+(x-6.8*s)+'" cy="'+(y-.9*s)+'" r="'+(.9*s)+'" fill="#FFFFFF"/><circle cx="'+(x+5.2*s)+'" cy="'+(y-.9*s)+'" r="'+(.9*s)+'" fill="#FFFFFF"/><circle cx="'+(x-11*s)+'" cy="'+(y+6*s)+'" r="'+(3.4*s)+'" fill="#F7A39A"/><circle cx="'+(x+11*s)+'" cy="'+(y+6*s)+'" r="'+(3.4*s)+'" fill="#F7A39A"/><path d="M'+(x-4*s)+' '+(y+5*s)+'q'+(4*s)+' '+(3.6*s)+' '+(8*s)+' 0" fill="none" stroke="#3A2620" stroke-width="'+(1.8*s)+'" stroke-linecap="round"/>';};
 var cloud=function(x,y,s){return O('<path d="M'+(x-26*s)+' '+(y+8*s)+'a'+(10*s)+' '+(10*s)+' 0 0 1 '+(4*s)+'-'+(18*s)+' '+(14*s)+' '+(14*s)+' 0 0 1 '+(26*s)+'-'+(6*s)+' '+(11*s)+' '+(11*s)+' 0 0 1 '+(18*s)+' '+(10*s)+' '+(8*s)+' '+(8*s)+' 0 0 1 -'+(2*s)+' '+(14*s)+'z"/>','#FFFFFF');};
 /* little heart friend: white sticker edge, coloured heart and a smiling face */
 var friend=function(x,y,c){return '<g>'+heart(x,y,2.5,c)+face(x,y-2,.62)+'</g>';};
 return '<svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+t('하트 도장이 찍힌 웃는 편지와 하트 친구들 그림')+'">'+
 /* rainbow (same family as the other covers) */
 '<g fill="none" stroke-linecap="round"><path d="M60 168a90 90 0 0 1 180 0" stroke="#FFFFFF" stroke-width="44"/><path d="M68 168a82 82 0 0 1 164 0" stroke="#F7B8B0" stroke-width="12"/><path d="M80 168a70 70 0 0 1 140 0" stroke="#FBE3A0" stroke-width="12"/><path d="M92 168a58 58 0 0 1 116 0" stroke="#C6E2B0" stroke-width="12"/></g>'+
 cloud(70,172,1.05)+cloud(232,172,1.05)+
 /* sun */
 '<g stroke-linecap="round"><g stroke="#FFFFFF" stroke-width="10"><path d="M44 12v-6M44 82v6M9 47H3M79 47h6M19 22l-4-4M69 72l4 4M69 22l4-4M19 72l-4 4"/></g><g stroke="#F8C548" stroke-width="5"><path d="M44 12v-6M44 82v6M9 47H3M79 47h6M19 22l-4-4M69 72l4 4M69 22l4-4M19 72l-4 4"/></g></g>'+
 '<circle cx="44" cy="47" r="27" fill="#FFFFFF"/><circle cx="44" cy="47" r="22" fill="#FCD866"/>'+face(44,45,.9)+
 /* sleepy cloud */
 '<path d="M218 58a12 12 0 0 1 4-22 16 16 0 0 1 30-6 13 13 0 0 1 22 12 10 10 0 0 1-2 16z" fill="rgba(79,111,150,.14)" transform="translate(2 4)"/>'+O('<path d="M218 58a12 12 0 0 1 4-22 16 16 0 0 1 30-6 13 13 0 0 1 22 12 10 10 0 0 1-2 16z"/>','#FFFFFF')+
 '<path d="M236 44q3 3 6 0M252 44q3 3 6 0" fill="none" stroke="#3A2620" stroke-width="1.8" stroke-linecap="round"/><circle cx="234" cy="50" r="2.8" fill="#F7A39A"/><circle cx="260" cy="50" r="2.8" fill="#F7A39A"/>'+
 /* the letter: open pink flap behind, paper peeking out, cream envelope pocket with a heart seal and a smile */
 '<rect x="98" y="86" width="108" height="90" rx="18" fill="rgba(79,111,150,.16)" transform="translate(3 5)"/>'+
 '<path d="M92 92 150 50l58 42z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/><path d="M98 92 150 55l52 37z" fill="#F6B8C4"/>'+
 '<rect x="112" y="46" width="76" height="70" rx="9" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="6"/><rect x="114" y="48" width="72" height="66" rx="8" fill="#FFFDF4"/>'+
 '<path d="M124 62h52M124 72h44M124 82h50" stroke="#E6DACA" stroke-width="3.4" stroke-linecap="round"/><path d="M150 92s-5-3-5-6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 3-5 6-5 6z" fill="#F2A79E"/>'+
 '<path d="M92 92v62a20 20 0 0 0 20 20h76a20 20 0 0 0 20-20V92l-58 40z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>'+
 '<path d="M98 97v56a16 16 0 0 0 16 16h72a16 16 0 0 0 16-16V97l-52 36z" fill="#FFF3E2"/>'+
 '<path d="M100 164l38-26M200 164l-38-26" stroke="#F3DFC4" stroke-width="3" stroke-linecap="round"/>'+
 heart(150,128,1.35,'#E8628F')+
 face(150,152,.95)+
 /* heart friends on both sides */
 friend(62,128,'#F2A79E')+friend(238,128,'#B7A8EE')+
 /* stickers */
 star(78,92,9,'#FCD866')+star(228,94,8,'#9CCBE8')+
 fl(258,190,6,'#F2A79E')+fl(40,192,6,'#9CCBE8')+
 spark(108,34,1.1,'#FFFFFF')+spark(196,30,.9,'#FCD866')+spark(214,112,.7,'#FFFFFF')+spark(88,118,.7,'#FFFFFF')+
 '</svg>';
};
var BOOK32={id:'phm-1-10-18',no:32,ch:1,book:['빌레몬서','Philemon'],title:'사랑받는 형제',ref:'빌레몬서 1:10-18',verses:VERSES32,art:'cuteLetter'};
var MEM32={id:'phm-1-16a',vi:6,
 ko:['이 후로는','종과 같이 대하지 아니하고','종 이상으로','곧 사랑 받는','형제로 둘 자라'],
 en:['no longer as a bondservant','but more than a bondservant,','as a beloved brother']};
var PACK32={no:32,start:new Date(2026,9,26),code:'phm',
 title:'사랑받는 형제',titleEn:'A Beloved Brother',
 ref:'빌레몬서 1:10-18',refEn:'Philemon 1:10–18',
 memRef:'빌레몬서 1:16상',memRefEn:'Philemon 1:16a',
 mem:'이 후로는 종과 같이 대하지 아니하고 종 이상으로 곧 사랑 받는 형제로 둘 자라',memEn:'No longer as a bondservant but more than a bondservant, as a beloved brother.',
 verses:VERSES32,lessons:LESSONS32,lessonsEn:LESSONS32_EN,pg:PG32,pgEn:PG32_EN,book:BOOK32,memo:MEM32,bible:BIBLE32};

var WEEKS=[PACK31,PACK32];
var CUR=PACK31;
function packFor(d){var m=mondayOf(d).getTime(),p=WEEKS[0];WEEKS.forEach(function(x){if(x.start.getTime()<=m)p=x;});return p;}
function packAt(d){var k=dkey(mondayOf(d));for(var i=0;i<WEEKS.length;i++)if(dkey(WEEKS[i].start)===k)return WEEKS[i];return null;}
function usePack(P){CUR=P;VERSES=P.verses;LESSONS=P.lessons;LESSONS_EN=P.lessonsEn;PG=P.pg;PG_EN=P.pgEn;BOOK=P.book;MEM=P.memo;}
function pk(k){return isEn()?CUR[k+'En']:CUR[k];}

/* ---------- looking at another week (Home: ‹ 지난 주 · 다음 주 ›) ----------
   ui.wkOff = 0 this week, -1 last week, +1 next week (preview). Everything week-based (day cards, storybook, thank-you
   notes, memory practice, parent guide) follows it; it goes back to this week whenever the app is opened again. */
function viewDate(){var d=today();if(ui&&ui.wkOff)d.setDate(d.getDate()+7*ui.wkOff);return d;}
function wkOk(o){if(o>1)return false;if(o===0)return true;var d=today();d.setDate(d.getDate()+7*o);return !!packAt(d);}
function wkWord(o){o=o===undefined?(ui.wkOff||0):o;return isEn()?(o<0?'Last Week':o>0?'Next Week':'This Week'):(o<0?'지난 주':o>0?'다음 주':'이번 주');}
function wkTxt(k){var w=wkWord();if(isEn())return {bible:w+"'s Bible Reading",word:w+"'s Bible",mem:w+"'s Memory Verse",memShort:'Memory Verse',go:'Read '+w.toLowerCase()+"'s Bible"}[k];return {bible:w+' 성경 읽기',word:w+' 말씀',mem:w+' 암송 구절',memShort:w+' 암송',go:w+' 말씀 읽으러 가기'}[k];}
function wkLab(o){var d=today();d.setDate(d.getDate()+7*o);return '#'+packFor(d).no+' '+wkWord(o);}
function wkSwitch(){
 var o=ui.wkOff||0,pv=wkOk(o-1),nx=wkOk(o+1);if(!pv&&!nx&&!o)return '';
 return '<div class="wksw'+(o?' away':'')+'" role="group" aria-label="'+t('주간 선택')+'">'+
  (pv?'<button type="button" class="wkb" data-a="wkGo" data-v="-1" aria-label="'+t('{w} 묵상 보기',{w:wkLab(o-1)})+'">'+back()+'<span>'+wkLab(o-1)+'</span></button>':'<span></span>')+
  '<b class="wkcur">'+wkLab(o)+'</b>'+
  (nx?'<button type="button" class="wkb nx" data-a="wkGo" data-v="1" aria-label="'+(o+1>0?t('{w} 미리 보기',{w:wkLab(o+1)}):t('{w} 묵상 보기',{w:wkLab(o+1)}))+'"><span>'+wkLab(o+1)+'</span>'+fwd()+'</button>':'<span></span>')+
 '</div>';
}
function wkBackChip(){return ui.wkOff?'<button type="button" class="chip wkback" data-a="wkGo" data-v="0">'+t('이번 주로 돌아가기')+fwd()+'</button>':'';}
function wkThanksBar(){return ui.wkOff?'<div class="row" style="gap:8px;flex-wrap:wrap"><span class="chip" style="background:#FFFFFF;color:#75685F">#'+CUR.no+' · '+wkWord()+' · '+weekRange(week())+'</span>'+wkBackChip()+'</div>':'';}
function bkQuizDate(){var d=viewDate(),w=d.getDay();if(w===0)d.setDate(d.getDate()-2);else if(w===6)d.setDate(d.getDate()-1);return d;}
var WK_ACTIONS={
 wkGo:function(v){var o=v==='0'?0:(ui.wkOff||0)+(+v);if(!wkOk(o))return;ui.wkOff=o;stopTTS();ui.bk={open:false,p:1};ui.mem=null;window.scrollTo(0,0);render();},
 bkQuiz:function(){if(!ui.wkOff){go('quiz');return;}A.lesson(dkey(bkQuizDate()));},
 qdraw:function(v){
  var i=+v,k=ansKey(i),d=qDay(),L=lessonL(lessonCode()),q=L.qs[i];if(!q)return;if(!S.qink)S.qink={};
  Ink.open('q-'+k,{plain:true,label:t('그림 그리기'),closeLabel:t('닫고 묵상으로 돌아가기'),hint:q.hint||t('여기에 그림을 그려 보세요'),
   chip:'<span class="chip" style="background:'+L.color+';color:'+L.ink+'">'+dayFull(d.getDay())+' · '+md(d)+'</span><span class="disp ink-title">'+t('그림 그리기')+'</span>',
   get:function(){return S.qink[k];},
   set:function(s){if(s.length)S.qink[k]=s;else delete S.qink[k];ui.q.v[i]=s.length;},
   onSave:function(){toast(t('그림을 저장했어요'));afterQuiz();}});
 }
};
Object.assign(EN,{
 '주간 선택':'Choose a week','{w} 묵상 보기':'Open {w}','{w} 미리 보기':'Preview {w}','이번 주로 돌아가기':'Back to this week',
 '가정에서 함께하는 묵상':'Devotions to share at home','리틀원스묵상':'Little ones QT','Little ones QT':'Little ones QT','IAM Church 주일학교':'IAM Church Sunday School',
 '그림 그리기':'Draw','닫고 묵상으로 돌아가기':'Close and go back to the QT','여기에 그림을 그려 보세요':'Draw your picture here',
 '바울이 편지를 쓰는 모습을 그려 보세요':'Draw Paul writing his letter','그림을 저장했어요':'Picture saved!','그린 그림을 저장할까요?':'Save your picture?',
 '눌러서 그림을 그려 보세요':'Tap to draw your picture','손가락, 애플펜슬, 마우스로 그릴 수 있어요':'Draw with your finger, Apple Pencil or a mouse',
 '내 그림 열어서 고치기':'Open my picture to change it','그림 그리기 시작':'Start drawing',
 '부모님을 위한 신학적 통찰':'Theological Insight for Parents','이번 주 핵심':'Key message',
 '사랑받는 형제':'A Beloved Brother','빌레몬서 1:10-18':'Philemon 1:10–18',
 '하트 도장이 찍힌 웃는 편지와 하트 친구들 그림':'A smiling letter with a heart seal and two little heart friends'
});
