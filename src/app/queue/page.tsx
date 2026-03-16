"use client";

import { useEffect, useState } from "react";
import {
DndContext,
closestCenter
} from "@dnd-kit/core";

import {
SortableContext,
verticalListSortingStrategy,
arrayMove,
useSortable
} from "@dnd-kit/sortable";

import {CSS} from "@dnd-kit/utilities";

type Draft = {
id:number;
tweet_text:string;
status:string;
media_url?:string|null;
};

export default function QueuePage(){

const [tweets,setTweets]=useState<Draft[]>([]);
const [selected,setSelected]=useState<number[]>([]);
const [error,setError]=useState("");

const [loading,setLoading]=useState(false);

const [minDelay,setMinDelay]=useState(35);
const [maxDelay,setMaxDelay]=useState(55);

const [startTime,setStartTime]=useState("");

const [showPreset,setShowPreset]=useState(false);
const [showSchedule,setShowSchedule]=useState(false);

useEffect(()=>{

loadQueue();
loadPreset();

},[]);

async function loadQueue(){

const res=await fetch("/api/drafts");
const data=await res.json();

const approved=(data.drafts||[]).filter(
(d:Draft)=>d.status==="approved"
);

setTweets(approved);

}

async function loadPreset(){

try{

const res=await fetch("/api/scheduler-settings");
const data=await res.json();

if(data.settings){

setMinDelay(data.settings.min_delay_minutes);
setMaxDelay(data.settings.max_delay_minutes);

}

}catch{}

}

async function savePreset(){

await fetch("/api/scheduler-settings",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

min_delay:minDelay,
max_delay:maxDelay

})

});

}

function toggle(id:number){

if(selected.includes(id)){

setSelected(selected.filter(t=>t!==id));

}else{

setSelected([...selected,id]);

}

}

function selectAll(){

if(selected.length===tweets.length){

setSelected([]);

}else{

setSelected(tweets.map(t=>t.id));

}

}

function handleDragEnd(event:any){

const {active,over}=event;

if(!over)return;

if(active.id!==over.id){

const oldIndex=tweets.findIndex(t=>t.id===active.id);
const newIndex=tweets.findIndex(t=>t.id===over.id);

setTweets(arrayMove(tweets,oldIndex,newIndex));

}

}

function previewSchedule(){

if(!startTime)return[];

let schedule:Date=new Date(startTime);

const result=[];

for(let i=0;i<selected.length;i++){

result.push(new Date(schedule));

const delay=
Math.floor(
Math.random()*(maxDelay-minDelay)+minDelay
);

schedule=new Date(
schedule.getTime()+delay*60000
);

}

return result;

}

async function scheduleTweets(){

if(!startTime)return;

if(selected.length===0){

setError("Select tweets first");
return;

}

setLoading(true);

const orderedIds=tweets
.filter(t=>selected.includes(t.id))
.map(t=>t.id);

await fetch("/api/schedule",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

tweet_ids:orderedIds,
start_time:startTime

})

});

setSelected([]);
setLoading(false);

loadQueue();

}

async function deleteDraft(id:number){

await fetch("/api/drafts/delete",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({draftId:id})

});

loadQueue();

}

return(

<div>

<div style={header}>

<div>
<h1 style={title}>Queue</h1>
<p style={subtitle}>
Drag tweets to control posting order
</p>
</div>

<div style={{display:"flex",gap:10}}>

<button
onClick={()=>setShowPreset(true)}
style={softButton}
>
Edit Preset
</button>

<button
onClick={()=>setShowSchedule(true)}
style={brandButton}
>
Schedule
</button>

<button
onClick={selectAll}
style={softButton}
>
Select All
</button>

</div>

</div>

{error&&(
<div style={errorBox}>{error}</div>
)}

<DndContext
collisionDetection={closestCenter}
onDragEnd={handleDragEnd}
>

<SortableContext
items={tweets.map(t=>t.id)}
strategy={verticalListSortingStrategy}
>

<div style={queue}>

{tweets.map(tweet=>(
<Row
key={tweet.id}
tweet={tweet}
selected={selected.includes(tweet.id)}
toggle={()=>toggle(tweet.id)}
deleteDraft={deleteDraft}
/>
))}

</div>

</SortableContext>

</DndContext>

{/* PRESET */}

{showPreset&&(

<div style={overlay}>

<div style={modal}>

<h3>Schedule Preset</h3>

<label style={label}>Min delay</label>

<input
type="number"
value={minDelay}
onChange={e=>setMinDelay(Number(e.target.value))}
style={input}
/>

<label style={{...label,marginTop:10}}>
Max delay
</label>

<input
type="number"
value={maxDelay}
onChange={e=>setMaxDelay(Number(e.target.value))}
style={input}
/>

<div style={modalButtons}>

<button
onClick={()=>{
savePreset();
setShowPreset(false);
}}
style={brandButton}
>
Save
</button>

<button
onClick={()=>setShowPreset(false)}
style={softButton}
>
Cancel
</button>

</div>

</div>

</div>

)}

{/* SCHEDULE */}

{showSchedule&&(

<div style={overlay}>

<div style={modal}>

<h3>Schedule Tweets</h3>

<label style={label}>Start time</label>

<input
type="datetime-local"
value={startTime}
onChange={e=>setStartTime(e.target.value)}
style={input}
/>

<div style={{marginTop:14}}>

{previewSchedule().map((t,i)=>(
<div key={i} style={timelineRow}>
Tweet {i+1} → {t.toLocaleTimeString()}
</div>
))}

</div>

<div style={modalButtons}>

<button
onClick={()=>{
scheduleTweets();
setShowSchedule(false);
}}
style={brandButton}
>
{loading?"Scheduling":"Schedule"}
</button>

<button
onClick={()=>setShowSchedule(false)}
style={softButton}
>
Cancel
</button>

</div>

</div>

</div>

)}

</div>

)

}

function Row({tweet,selected,toggle,deleteDraft}:any){

const{
attributes,
listeners,
setNodeRef,
transform,
transition
}=useSortable({id:tweet.id});

const style={
transform:CSS.Transform.toString(transform),
transition
};

return(

<div
ref={setNodeRef}
style={{...row,...style}}
>

<input
type="checkbox"
checked={selected}
onChange={toggle}
style={checkbox}
/>

<div
{...attributes}
{...listeners}
style={drag}
>
⋮⋮
</div>

<div style={text}>
{tweet.tweet_text}
</div>

{tweet.media_url&&(
<img
src={tweet.media_url}
style={media}
/>
)}

<button
onClick={()=>deleteDraft(tweet.id)}
style={deleteBtn}
>
🗑
</button>

</div>

)

}

/* STYLES */

const header={display:"flex",justifyContent:"space-between",marginBottom:24};

const title={margin:0,fontSize:34,color:"#FCFCFC"};

const subtitle={margin:0,color:"#B9B9C8"};

const queue: React.CSSProperties = {
display: "flex",
flexDirection: "column",
gap: 8,
maxHeight: "70vh",
overflowY: "auto"
};

const row={
display:"flex",
alignItems:"center",
gap:12,
background:"#18181F",
border:"1px solid #22242D",
borderRadius:14,
padding:"12px 14px",
transition:"all .15s ease"
};

const text={
flex:1,
color:"#FCFCFC",
whiteSpace:"pre-wrap"
};

const checkbox={width:18,height:18,accentColor:"#6D8CFF"};

const drag={cursor:"grab",color:"#888"};

const media={
width:46,
height:46,
borderRadius:10,
objectFit:"cover"
};

const deleteBtn={
background:"rgba(175,18,60,0.16)",
border:"1px solid rgba(175,18,60,0.3)",
borderRadius:10,
width:36,
height:36,
color:"#FCFCFC",
cursor:"pointer"
};

const brandButton={
background:"#6D8CFF",
color:"#fff",
border:"none",
borderRadius:9999,
padding:"10px 18px",
cursor:"pointer"
};

const softButton={
background:"#22242D",
color:"#FCFCFC",
border:"none",
borderRadius:9999,
padding:"10px 18px",
cursor:"pointer"
};

const overlay={
position:"fixed",
inset:0,
background:"rgba(0,0,0,0.6)",
display:"flex",
alignItems:"center",
justifyContent:"center"
};

const modal={
background:"#18181F",
border:"1px solid #22242D",
borderRadius:18,
padding:24,
width:380
};

const modalButtons={display:"flex",gap:10,marginTop:18};

const input={
width:"100%",
padding:10,
borderRadius:10,
border:"1px solid #2A2D38",
background:"#101114",
color:"#FCFCFC"
};

const label={fontSize:13,color:"#787A8D"};

const timelineRow={
fontSize:13,
color:"#B9B9C8"
};

const errorBox={
marginBottom:20,
padding:12,
borderRadius:12,
background:"rgba(175,18,60,0.14)",
border:"1px solid rgba(175,18,60,0.35)",
color:"#FCFCFC"
};