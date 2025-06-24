import { useState } from 'react';

export default function Home() {
  const emojis = ['😄','😊','😌','😐','😶','😞','😢','😰','😫','😤','😟','🫣'];
  const reasons = ['Family','Friends','Partner','Loneliness','Job','Finances','Burnout','Body Image','Health','Addiction','Safety','Overthinking'];
  const [emoji, setEmoji] = useState(null);
  const [selected, setSelected] = useState([]);
  const [resp, setResp] = useState(null);

  const toggle = (r) => setSelected(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev,r]);

  const submit = async () => {
    if(!emoji) return alert("Pick a mood");
    const res = await fetch('/api/gpt-checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mood:emoji,reasons:selected})});
    const data = await res.json();
    setResp(data);
  };

  return (
    <div style={{padding:20}}>
      <h1>GroupPulse</h1>
      <div>{emojis.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{margin:2,background:emoji===e?'#d0f0fd':'#fff'}}>{e}</button>)}</div>
      <div style={{marginTop:10}}>{reasons.map(r=><button key={r} onClick={()=>toggle(r)} style={{margin:2,background:selected.includes(r)?'#d0f0fd':'#fff'}}>{r}</button>)}</div>
      <button onClick={submit} style={{marginTop:10}}>Submit</button>
      {resp && <div><p>{resp.aiMessage}</p><p>{resp.aiSuggestion}</p><p>{resp.aiAffirmation}</p></div>}
    </div>
  );
}
