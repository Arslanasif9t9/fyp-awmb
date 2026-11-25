# Presenter Guide: AI World Model Builder

Nov 21, 2026 · @Arslan Asif

Ye guide batati hai ke har slide par kya bolna hai aur kab click karna hai, taake team ka koi bhi member slide dekh kar presentation de sake.

## Shuru kaise karein

Presentation 23 slides ki hai, taqriban 22 minute. Har slide par pehle title parho, phir visual samjhao, aakhir mein "In simple words" ki patti parho.

**Click ke rules**

- Space, click ya right-arrow dabane se agla animation aata hai. Har slide par 2 se 6 click hote hain.
- Har slide ke speaker notes mein "Click guide" likha hai: kaun sa click kya dikhata hai.
- Pehla hissa slide khulte hi khud aa jata hai. Baqi click par aate hain.
- Animation sirf Slide Show mode mein chalti hai (F5). Edit view mein sab kuch dikhta hai.

**30 second ki opening (Slide 1)**

1. Salam karein aur apna naam batayein.
2. Kahein: "Hum The Sahara College Narowal se hain, jo GCUF se affiliated hai. Hamara project hai AI World Model Builder."
3. Ek sawal poochein: "Agar aap ko koi bara faisla karna ho aur uski information 10 alag jagah bikhri ho, to kya hoga?" Thora ruk kar audience ko sochne dein.
4. Phir kahein: "Hamara project isi masle ka hal hai." Aur Slide 2 par jayein.

**Har slide ka tareeqa**

1. Title parho. Wohi slide ka paigham hai.
2. Visual ko ek ek click par samjhao.
3. Aakhir mein "In simple words" parho.
4. Agle slide ka jumla bolo, jaise: "Ab dekhte hain ke Ahmed ke masle ka hal kya hai."

## Slides 1 se 8

**Slide 1: Cover (30 sec)**

- Opening upar wali hai. Animation khud chalti hai.
- Agla jumla: "Ab project ko ek jumle mein samjhate hain."

**Slide 2: Project kya hai (60 sec)**

- Bolo: aap files upload karte hain (PDF, image, table, link, text). System unse ek World banata hai, yani ek topic ki saari information ek jagah, har baat ke source ke saath. Phir aap sawal poochte hain aur jawab proof ke saath milta hai.
- Clicks: 1 Upload, 2 One World, 3 Ask, 4 Core rule wala banner, 5 In simple words.
- Core rule zaroor bolo: AI world nahi hai, database world hai.
- Agla jumla: "Ab dekhte hain aaj hum kya kya cover karenge."

**Slide 3: Agenda (30 sec)**

- Bolo: chhe hisse hain aur har hissa ek sawal ka jawab deta hai: problem, idea, system andar se, demo, tech aur plan, future.
- Clicks: 1 Hisse 4 se 6, 2 In simple words.
- Agla jumla: "Pehle problem ko ek insaan ki kahani se samajhte hain."

**Slide 4: Ahmed ka tarruf (60 sec)**

- Bolo: Ahmed 30 saal ka hai, Lahore mein rehta hai. Pehla ghar khareedna chahta hai, budget 1.5 crore. 3 properties hain: A, B, C. Usne 12 jagah se information jama ki.
- Clicks: 1 12 files ek ek karke aati hain, 2 In simple words.
- Agla jumla: "Ab dekhte hain is information ke saath masla kya hai."

**Slide 5: Masla kya hai (75 sec)**

- Bolo: agent kehta hai title clear hai, lawyer kehta hai mutation missing hai. Mutation wo official record hai jo ownership naye khareedar ke naam karta hai. Biwi ko seepage nazar aayi, agent kehta hai issue nahi. Loan 1.2 crore hai, budget 1.5 crore. 3 hafte guzar gaye, Ahmed confused hai.
- Clicks: 1 Lawyer ki email aur conflict ka nishan, 2 Mutation ka matlab aur teen masle, 3 3 weeks wala red box, 4 In simple words.
- Agla jumla: "Kya aaj ke tools ye masla hal kar lete hain?"

**Slide 6: Maujooda tools (60 sec)**

- Bolo: Google pages dhoondta hai. Chat assistant roanak jawab deta hai lekin source ka trail kamzor hai. Notebook tool sources cite karta hai lekin conflict flag nahi karta aur undo nahi hota. Folders mein sab haath se jorna parta hai.
- Clicks: 1 Notebook aur Folders ke cards, 2 In simple words.
- Note: presentation se pehle ChatGPT aur NotebookLM ke current features ek baar verify kar lein.
- Agla jumla: "Ab dekhte hain hamara idea Ahmed ke teeno masle kaise hal karta hai."

**Slide 7: Hamara hal (60 sec)**

- Bolo: files bikhri thin, hum World mein rakhte hain. Sources conflict mein thay, hum dono dikhate hain trust level ke saath. Faisla mushkil tha, hum cited jawab aur what-if dete hain.
- Clicks: 1 Masla 2, 2 Masla 3, 3 In simple words.
- Agla jumla: "In features ko samajhne ke liye pehle paanch lafz seekhte hain."

**Slide 8: Paanch bunyadi lafz (75 sec)**

- Bolo: World ek topic ka container. Entity koi cheez. Evidence claim plus source plus trust plus waqt. Contradiction jab do evidence match na karein. Status har item ki life stage.
- "Model" ka matlab ML model nahi, data ka structured naqsha hai. Hum koi model train nahi karte.
- Clicks: 1 Evidence aur Contradiction, 2 Status aur Model wali wazahat, 3 In simple words.
- Agla jumla: "Ab dekhte hain ye sab system ke andar kahan rehta hai."

## Slides 9 se 15

**Slide 9: Architecture (90 sec)**

- Bolo: user React screen par kaam karta hai. Screen FastAPI backend se baat karti hai, jo login (JWT aur bcrypt) aur rules sambhalta hai. Language ka kaam ho to backend AI router ko bulata hai: pehle Gemini, phir Groq, phir local Ollama. Asli world Supabase Postgres database mein hai, graph ke liye NetworkX.
- Yehi "AI kahan hai?" ka jawab hai: AI sirf language ke liye, sach database mein.
- Badges: Built, In progress, Planned. Sach bolo ke kya abhi bana hai.
- Clicks: 1 FastAPI backend, 2 AI Router, 3 Database, 4 In simple words.
- Agla jumla: "Ab dekhte hain data is system mein kis raste se guzarta hai."

**Slide 10: 6-step loop (75 sec)**

- Bolo: Ingest, Perceive, Construct, Reason, Simulate, Update. Har card ke neeche Ahmed ki misaal hai.
- Clicks: 1 Steps 3 aur 4, 2 Steps 5 aur 6, 3 In simple words.
- Agla jumla: "Ab sab se khaas design faisla: kuch delete nahi hota."

**Slide 11: Kuch delete nahi hota (75 sec)**

- Bolo: normal app mein delete dabate hi data chala jata hai. Hamare system mein sirf status badalta hai: ACTIVE, INACTIVE, SUPERSEDED, FAILED. Fayde: ek click undo, poori history, what-if purani states par.
- Clicks: 1 Hamara world (right side), 2 Chaar status chips, 3 In simple words.
- Agar poochein "ghalti se delete ho gaya to?": hum delete nahi karte, deactivate karte hain. Git ki tarah history rehti hai.
- Agla jumla: "Ab dekhte hain user kya kya kar sakta hai."

**Slide 12: Paanch actions (60 sec)**

- Bolo: Add File, Add Fact, Edit Fact, Deactivate, Reactivate. Chhatha card: koi delete nahi, koi overwrite nahi, har change log hota hai.
- Clicks: 1 Deactivate aur Reactivate, 2 Dark card, 3 In simple words.
- Agla jumla: "Ab dekhte hain system conflicts kaise pakadta hai."

**Slide 13: Contradiction (75 sec)**

- Bolo: agent ki chat zubani hai, trust kam. Lawyer ki email likhi hui hai, trust zyada. System dono dikhata hai, zyada reliable par nishan lagata hai, khud winner nahi chunta.
- Resurrection: lawyer ki email deactivate karo to conflict wapas aata hai, reactivate karo to dobara resolve.
- Clicks: 1 Lawyer ka card, 2 CONFLICT nishan, 3 What the system does, 4 Resurrection, 5 In simple words.
- Agla jumla: "Ab dekhte hain what-if kaise kaam karta hai."

**Slide 14: What-if (60 sec)**

- Bolo: Ahmed poochta hai: agar loan sirf 1 crore ho to? System asli world ke upar temporary overlay lagata hai, jawab nikalta hai, overlay phenk deta hai. Asli world nahi badalta. Numbers sirf misaal hain.
- Clicks: 1 Temporary overlay, 2 Nateeja, 3 Green banner, 4 In simple words.
- Agla jumla: "Ab Ahmed ka poora safar ek nazar mein."

**Slide 15: Ahmed ka safar (90 sec)**

- Bolo: Ek upload, do build, teen detect, chaar ask aur test, paanch decide. Neeche: taqriban 3 hafte ki jagah taqriban 3 din. Ye hamari umeed hai, real numbers testing ke baad dikhayenge.
- Zaroor kaho: system faisla nahi karta, evidence organise karta hai. Faisla user ka hai.
- Clicks: 1 Build, 2 Detect, 3 Ask aur Test, 4 Decide, 5 Before aur With us bars, 6 In simple words.
- Live demo ho to yahin dikhayein.
- Agla jumla: "Ab dekhte hain hum baqi tools se kaise alag hain."

## Slides 16 se 23

**Slide 16: Hum alag kaise hain (60 sec)**

- Bolo: chat aur notebook tools achhe hain, lekin persistent evidence world, conflict tracking, reversible history aur safe what-if nahi dete. Hum ye sab jorte hain. Kuch features abhi planned hain.
- Clicks: 1 In simple words.
- Note: ye tool categories hain. Presentation se pehle ChatGPT aur NotebookLM ke features verify kar lein.
- Agla jumla: "Ab technology dekhte hain."

**Slide 17: Technology (45 sec)**

- Bolo: Python 3.12 aur FastAPI backend. Supabase Postgres database, pgvector se milte julte text dhoondna. NetworkX graph. React frontend. Free AI chain Gemini, Groq, Ollama. Login JWT aur bcrypt.
- Clicks: 1 Frontend, AI chain, Login, 2 In simple words.
- Agla jumla: "Ab dekhte hain hum abhi kahan hain."

**Slide 18: Roadmap (60 sec)**

- Bolo: Phase 0 aur 1 mukammal: setup, backend, login, worlds. Phase 2 React screen chal raha hai. Phase 3 text aur PDF reading. Phir entities, evidence, conflicts. Aakhir mein Q&A, what-if, timeline, testing.
- Clicks: 1 Phase 2 aur 3, 2 Aage ke phases, 3 In simple words.
- Ye slide aap apni dates ke hisaab se edit kar sakte hain. Bars ko drag karein ya text badlein.
- Agla jumla: "Ab dekhte hain challenges aur unke hal."

**Slide 19: Challenges (60 sec)**

- Bolo: AI baat bana deta hai, hal: sirf stored evidence se jawab. Free AI ki limits, hal: router fallback. Ghalti se delete, hal: sirf hide aur undo. Kharab files, hal: FAILED status aur retry.
- Clicks: 1 Challenge 3 aur 4, 2 In simple words.
- Agla jumla: "Ab dekhte hain success kaise naapenge."

**Slide 20: Success kaise naapenge (60 sec)**

- Bolo: Grounding, Citation accuracy, Conflict recall, Time saved. Neeche 4 steps: test worlds banao, known conflicts daalo, system chalao, compare karo. Numbers testing ke baad dikhayenge.
- Clicks: 1 Cards 3 aur 4, 2 Neeche ke steps, 3 In simple words.
- Agla jumla: "Aakhir mein dekhte hain project aage kahan ja sakta hai."

**Slide 21: Aage kya (30 sec)**

- Bolo: Neo4j, voice input, report export, collaboration, video aur audio. Ye abhi scope mein nahi. Pehle core ko gehra karo, phir width.
- Clicks: 1 Teesri aur chauthi seedhi, 2 Aakhri seedhi, 3 In simple words.
- Agla jumla: "Ab aap ke sawalon ka waqt."

**Slide 22: Any Questions?**

- Teen backup sawal slide par likhe hain: Slide 9, Slide 8, Slide 16. Jawab agle section mein hain.

**Slide 23: Thank You**

- Bolo: sunne ka shukriya. Sir Romat Ali Shah ka khaas shukriya jinhon ne rehnumai ki.

## Examiner ke aam sawal

| Sawal | Jawab | Slide |
| --- | --- | --- |
| AI kahan hai? | AI sirf language ke liye hai: file parhna aur jawab likhna. Sach database mein hai, aur jawab sirf stored evidence se aate hain. | 9 |
| Model kyun? | Ye world model hai: entities, evidence, conflicts aur timeline ka structured naqsha. ML model train nahi hota. | 8 |
| ChatGPT se kya farq? | Persistent evidence world, conflict pakadna, undo history aur safe what-if. | 16 |
| Ghalti se delete ho gaya to? | Delete hota hi nahi. Deactivate hota hai aur ek click mein wapas. | 11 |
| Free AI chal jaye ya limit lag jaye? | Router Gemini se Groq, phir Ollama par chala jata hai. | 9 |
| Abhi kya bana hai? | Setup, backend, login aur worlds bane hain. React screen chal raha hai. Baqi planned hai. | 18 |
| Faisla kaun karta hai? | User. System sirf evidence organise karta hai. | 15 |
