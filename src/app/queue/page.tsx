"use client";

import { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  media_url?: string | null;
  media_type?: string | null;
};

export default function QueuePage() {
  const [tweets, setTweets] = useState<Draft[]>([]);
  const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [minDelay, setMinDelay] = useState(35);
  const [maxDelay, setMaxDelay] = useState(55);
  const [startTime, setStartTime] = useState("");

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  async function loadQueue() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();

      const approved = (data.drafts || []).filter(
        (d: Draft) => d.status === "approved"
      );

      setTweets(approved);
    } catch {
      setError("Failed to load queue.");
    }
  }

  async function loadPreset() {
    try {
      const res = await fetch("/api/scheduler-settings");
      const data = await res.json();

      if (data.settings) {
        setMinDelay(data.settings.min_delay_minutes);
        setMaxDelay(data.settings.max_delay_minutes);
      }
    } catch {}
  }

  async function savePreset() {
    await fetch("/api/scheduler-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        min_delay: minDelay,
        max_delay: maxDelay,
      }),
    });
  }

  useEffect(() => {
    loadQueue();
    loadPreset();
  }, []);

  function toggleTweet(id: number) {
    if (selectedTweets.includes(id)) {
      setSelectedTweets(selectedTweets.filter((t) => t !== id));
    } else {
      setSelectedTweets([...selectedTweets, id]);
    }
  }

  function selectAll() {
    if (selectedTweets.length === tweets.length) {
      setSelectedTweets([]);
    } else {
      setSelectedTweets(tweets.map((t) => t.id));
    }
  }

  async function scheduleSelectedTweets() {
    if (!startTime) {
      setError("Select start time.");
      return;
    }

    if (selectedTweets.length === 0) {
      setError("Select tweets first.");
      return;
    }

    setLoading(true);

    try {
      const orderedIds = tweets
        .filter((t) => selectedTweets.includes(t.id))
        .map((t) => t.id);

      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_ids: orderedIds,
          start_time: startTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scheduling failed.");
        return;
      }

      setSelectedTweets([]);
      await loadQueue();
    } catch {
      setError("Scheduling failed.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDraft(id: number) {
    await fetch("/api/drafts/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId: id }),
    });

    await loadQueue();
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = tweets.findIndex((t) => t.id === active.id);
      const newIndex = tweets.findIndex((t) => t.id === over.id);

      setTweets(arrayMove(tweets, oldIndex, newIndex));
    }
  }

  return (
    <div>

      <div style={headerRow}>
        <div>
          <h1 style={title}>Queue</h1>
          <p style={subtitle}>
            Select tweets and schedule them with interval presets.
          </p>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={() => setShowPresetModal(true)} style={softButton}>
            Edit Preset
          </button>

          <button onClick={() => setShowScheduleModal(true)} style={brandButton}>
            Schedule
          </button>

          <button onClick={selectAll} style={softButton}>
            Select All
          </button>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >

        <SortableContext
          items={tweets.map((t)=>t.id)}
          strategy={verticalListSortingStrategy}
        >

        <div style={queueContainer}>
          {tweets.map((tweet) => (
            <SortableTweetRow
              key={tweet.id}
              tweet={tweet}
              selected={selectedTweets.includes(tweet.id)}
              toggle={()=>toggleTweet(tweet.id)}
              deleteDraft={deleteDraft}
            />
          ))}
        </div>

        </SortableContext>

      </DndContext>

      {/* PRESET MODAL */}

      {showPresetModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Scheduling Preset</h3>

            <label style={label}>Min Delay</label>
            <input
              type="number"
              value={minDelay}
              onChange={(e)=>setMinDelay(Number(e.target.value))}
              style={input}
            />

            <label style={{...label,marginTop:12}}>Max Delay</label>
            <input
              type="number"
              value={maxDelay}
              onChange={(e)=>setMaxDelay(Number(e.target.value))}
              style={input}
            />

            <div style={modalButtons}>
              <button
                onClick={()=>{
                  savePreset();
                  setShowPresetModal(false);
                }}
                style={brandButton}
              >
                Save
              </button>

              <button
                onClick={()=>setShowPresetModal(false)}
                style={softButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}

      {showScheduleModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Schedule Tweets</h3>

            <label style={label}>Start Time</label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e)=>setStartTime(e.target.value)}
              style={input}
            />

            <div style={modalButtons}>
              <button
                onClick={()=>{
                  scheduleSelectedTweets();
                  setShowScheduleModal(false);
                }}
                style={brandButton}
              >
                {loading ? "Scheduling..." : "Schedule Selected"}
              </button>

              <button
                onClick={()=>setShowScheduleModal(false)}
                style={softButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* DRAG ROW COMPONENT */

function SortableTweetRow({tweet,selected,toggle,deleteDraft}:any){

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tweet.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return(

    <div ref={setNodeRef} style={{...tweetRow,...style}}>

      <input
        type="checkbox"
        checked={selected}
        onChange={toggle}
        style={checkbox}
      />

      <div {...attributes} {...listeners} style={dragHandle}>
        ⋮⋮
      </div>

      <div style={tweetPreview}>
        {tweet.tweet_text.slice(0,120)}
        {tweet.tweet_text.length > 120 && "..."}
      </div>

      {tweet.media_url && (
        <img src={tweet.media_url} style={mediaThumb}/>
      )}

      <button
        onClick={() => deleteDraft(tweet.id)}
        style={deleteButton}
      >
        🗑
      </button>

    </div>

  );

}

/* ---------- STYLES ---------- */

const dragHandle:React.CSSProperties={
cursor:"grab",
color:"#888",
padding:"4px 6px"
};

const headerRow:React.CSSProperties={
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start",
marginBottom:24
};

const title:React.CSSProperties={
margin:0,
fontSize:34,
color:"#FCFCFC"
};

const subtitle:React.CSSProperties={
margin:0,
color:"#B9B9C8"
};

const queueContainer:React.CSSProperties={
display:"flex",
flexDirection:"column",
gap:8,
maxHeight:"70vh",
overflowY:"auto"
};

const tweetRow:React.CSSProperties={
display:"flex",
alignItems:"center",
gap:14,
background:"#18181F",
border:"1px solid #22242D",
borderRadius:14,
padding:"12px 14px",
transition:"all .15s ease"
};

const tweetPreview:React.CSSProperties={
flex:1,
color:"#FCFCFC",
fontSize:14
};

const checkbox:React.CSSProperties={
width:18,
height:18,
accentColor:"#6D8CFF"
};

const mediaThumb:React.CSSProperties={
width:42,
height:42,
objectFit:"cover",
borderRadius:8
};

const deleteButton:React.CSSProperties={
background:"rgba(175,18,60,0.16)",
border:"1px solid rgba(175,18,60,0.3)",
color:"#FCFCFC",
borderRadius:10,
width:36,
height:36,
cursor:"pointer"
};

const brandButton:React.CSSProperties={
background:"#6D8CFF",
color:"#FCFCFC",
border:"none",
borderRadius:9999,
padding:"10px 18px",
cursor:"pointer",
fontWeight:700
};

const softButton:React.CSSProperties={
background:"#22242D",
color:"#FCFCFC",
border:"none",
borderRadius:9999,
padding:"10px 18px",
cursor:"pointer"
};

const modalOverlay:React.CSSProperties={
position:"fixed",
inset:0,
background:"rgba(0,0,0,0.6)",
display:"flex",
alignItems:"center",
justifyContent:"center",
zIndex:1000
};

const modalBox:React.CSSProperties={
background:"#18181F",
border:"1px solid #22242D",
borderRadius:18,
padding:24,
width:360
};

const modalButtons:React.CSSProperties={
display:"flex",
gap:10,
marginTop:18
};

const input:React.CSSProperties={
width:"100%",
padding:10,
borderRadius:10,
border:"1px solid #2A2D38",
background:"#101114",
color:"#FCFCFC"
};

const label:React.CSSProperties={
fontSize:13,
color:"#787A8D"
};

const errorBox:React.CSSProperties={
marginBottom:20,
padding:12,
borderRadius:12,
background:"rgba(175,18,60,0.14)",
border:"1px solid rgba(175,18,60,0.35)",
color:"#FCFCFC"
};