'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Minus, Plus, Scissors, RotateCcw } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n);
export default function Home() {
  const [value, setValue] = useState('15');
  const [people, setPeople] = useState(15);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    type Tool = {name:string; title:string; description:string; inputSchema:object; annotations:object; execute:(input:unknown)=>unknown};
    const context = (document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name:'calculate_pizza_cuts', title:'Разделить пиццу поровну',
        description:'Set the guest count and display equal pizza slices and cutting instructions.',
        inputSchema:{type:'object',properties:{people:{type:'integer',minimum:1,maximum:100}},required:['people'],additionalProperties:false},
        annotations:{readOnlyHint:false,untrustedContentHint:false},
        execute(input) {
          const n = (input as {people?:unknown})?.people;
          if(typeof n !== 'number'||!Number.isInteger(n)||n<1||n>100) throw new Error('Guest count must be an integer from 1 to 100');
          flushSync(()=>{setPeople(n);setValue(String(n));setCut(false)});
          return {people:n,angle:360/n,cuts:n===1?0:n%2===0?n/2:n,method:n===1?'none':n%2===0?'diameter':'center_to_edge'};
        }
      },{signal:lifecycle.signal})).catch(()=>{});
    } catch {}
    return ()=>lifecycle.abort();
  }, []);
  const valid = /^\d+$/.test(value) && +value >= 1 && +value <= 100;
  const angle = 360 / people;
  const cuts = people === 1 ? 0 : people % 2 === 0 ? people / 2 : people;
  const update = (n: number) => { const next = Math.max(1, Math.min(100,n)); setValue(String(next)); setPeople(next); setCut(false); };
  return <div className="site-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Пицца поровну — главная"><span className="brand-icon">✳</span> ПИЦЦА ПОРОВНУ<span className="version">v.1.0</span></a><span className="top-note">МАТЕМАТИКА, КОТОРУЮ МОЖНО СЪЕСТЬ</span></header>
    <main>
      <div className="intro"><span className="eyebrow"><span className="status-dot"/> АНТИКОНФЛИКТНЫЙ КАЛЬКУЛЯТОР</span><h1>Дружба дружбой.<br/><span>А пиццу — поровну.</span></h1></div>
      <section className="calculator" aria-label="Калькулятор разреза пиццы">
        <div className="controls">
          <div className="step-label"><span>01</span> СОБЕРИ СВОИХ</div>
          <label className="input-label" htmlFor="people">Сколько голодных?</label>
          <div className="counter"><button aria-label="На одного меньше" disabled={people <= 1} onClick={()=>update(people-1)}><Minus/></button><input id="people" type="text" inputMode="numeric" value={value} aria-invalid={!valid} aria-describedby="input-help" onChange={e=>{setValue(e.target.value);if(/^\d+$/.test(e.target.value)&&+e.target.value>=1&&+e.target.value<=100){setPeople(+e.target.value);setCut(true);}}}/><button aria-label="На одного больше" disabled={people >= 100} onClick={()=>update(people+1)}><Plus/></button></div>
          <p id="input-help" className={valid?'input-help':'input-help error'}>{valid?'Человек. Того, кто «только кусочек», тоже считаем.':'Введи целое число от 1 до 100.'}</p>
          <button className="cut-button" disabled={!valid} onClick={()=>setCut(!cut)}>{cut?<RotateCcw size={20}/>:<Scissors size={20}/>} {cut?'Убрать разметку':'Разрезать по-братски'}<span>↗</span></button>
          <div className="receipt" aria-live="polite" aria-atomic="true"><div className="receipt-heading">ЧЕК СПРАВЕДЛИВОСТИ <span>✓</span></div><div className="stats"><div><strong>{cuts}</strong><span>{people===1?'разрезов':people%2===0?'сквозных разрезов':'надрезов от центра'}</span></div><div><strong>{fmt(angle)}<i>°</i></strong><span>угол кусочка</span></div></div><div className="receipt-bottom">{people===1?'Вся пицца твоя. И никаких переговоров.':people>20?'Это уже дегустация. Но зато честная.':'Никто не обделён.'}<span>☺</span></div></div>
        </div>
        <div className="visual-panel"><div className="visual-top"><span><span className="status-dot"/> {cut?'ПЛАН РАЗРЕЗА':'ПИЦЦА В ЦЕЛОСТИ'}</span><span>ВИД СВЕРХУ ↙</span></div>
          <div className="pizza-stage"><div className="pizza-wrap"><img src="/pizza.png" alt="Пиксельная пицца с пепперони, вид сверху"/><svg viewBox="0 0 400 400" role="img" aria-label={`Схема: ${people} равных частей, угол ${fmt(angle)} градуса`}>
            {cut&&people>1&&Array.from({length:people},(_,i)=>{const a=(i*angle-90)*Math.PI/180;return <line key={`${people}-${i}`} className="cut-line" x1="200" y1="200" x2={200+195*Math.cos(a)} y2={200+195*Math.sin(a)} style={{animationDelay:`${Math.min(i*25,600)}ms`}}/>;})}
            {cut&&people>1&&<><circle cx="200" cy="200" r="5" fill="#fff8dc" stroke="#5b2523" strokeWidth="2"/><path d={`M 200 152 A 48 48 0 ${angle>180?1:0} 1 ${200+48*Math.sin(angle*Math.PI/180)} ${200-48*Math.cos(angle*Math.PI/180)}`} fill="none" stroke="#fff8dc" strokeWidth="2"/></>}
          </svg></div><span className="pizza-sticker">{people===1?'МОЯ. ВСЯ.':`${people} КУСОЧКОВ`}<small>{people===1?'имеешь право':'0 ПОВОДОВ ДЛЯ ДРАК'}</small></span></div>
          <div className="visual-caption"><span className="legend-line"/>{cut?'Пунктир — здесь режем': 'Нажми «Разрезать по-братски»'}<span className="angle-badge">{fmt(angle)}° / кусочек</span></div>
        </div>
      </section>
      <section className="instruction"><span className="instruction-icon"><Scissors size={24}/></span><div><h2>{people===1?'Нож сегодня отдыхает.':people%2===0?'Через центр. От края до края.':'От центра к краю. И так по кругу.'}</h2><p>{people===1?'Один человек, одна пицца. Идеальные отношения.':people%2===0?`Сделай ${cuts} сквозных разрезов через центр, поворачивая нож на ${fmt(angle)}°. Получится ${people} равных кусочков.`:`Сделай ${cuts} надрезов от центра к корочке с шагом ${fmt(angle)}°. Не режь насквозь: получится вдвое больше кусочков.`}</p></div><span className="instruction-note">РОВНО — ЭТО ЛЮБОВЬ ♡</span></section>
    </main><footer><span>© ПИЦЦА ПОРОВНУ</span><span>СДЕЛАНО С ГОЛОДОМ <span className="heart">♥</span></span><span>360° СПРАВЕДЛИВОСТИ</span></footer>
  </div>;
}
