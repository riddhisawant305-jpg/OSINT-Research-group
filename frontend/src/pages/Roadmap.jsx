import React, { useState } from "react";
import { CheckCircle2, Circle, Map, PlayCircle } from "lucide-react";
import { roadmap } from "../data/dummyData";
import "./Roadmap.css";

function Roadmap() {
  const [done, setDone] = useState({});

  const toggle = (week, task) =>
    setDone((d) => {
      const key = `${week}-${task}`;
      const nd = { ...d };
      if (nd[key]) delete nd[key];
      else nd[key] = true;
      return nd;
    });

  const totalTasks = roadmap.weeks.reduce((s, w) => s + w.tasks.length, 0);
  const doneCount = Object.keys(done).length;
  const pct = Math.round((doneCount / totalTasks) * 100);

  return (
    <div className="roadmap-page">
      <div className="roadmap-head card">
        <div className="roadmap-title">
          <span className="rm-icon"><Map size={24} /></span>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>Learning Roadmap</h1>
            <p>Your personalized 4-week path to become a confident Frontend Developer</p>
          </div>
        </div>
        <div className="roadmap-progress">
          <div className="progress-bar rm-bar">
            <div className="progress-fill" style={{ width: pct + "%" }}></div>
          </div>
          <span>{doneCount}/{totalTasks} tasks · {pct}% complete</span>
        </div>
      </div>

      <div className="roadmap-weeks">
        {roadmap.weeks.map((w) => (
          <div key={w.week} className="roadmap-week">
            <div className="week-label">
              <span className="week-num">Week {w.week}</span>
              <span className="week-track"><PlayCircle size={16} /> {w.title}</span>
            </div>
            <div className="week-tasks card">
              {w.tasks.map((t) => {
                const key = `${w.week}-${t}`;
                const isDone = !!done[key];
                return (
                  <div
                    key={t}
                    className={"task-row" + (isDone ? " done" : "")}
                    onClick={() => toggle(w.week, t)}
                  >
                    {isDone ? <CheckCircle2 size={20} className="task-check done" /> : <Circle size={20} className="task-check" />}
                    <span>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Roadmap;
