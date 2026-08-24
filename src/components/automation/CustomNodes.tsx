"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Zap,
  Send,
  Mail,
  Clock,
  CheckCircle2,
  UserCheck,
  GitBranch,
} from "lucide-react";

export const TriggerNode = memo(({ data }: NodeProps) => {
  const d = data as any;
  return (
    <div className="px-4 py-3 shadow-md rounded-xl bg-white border-2 border-indigo-500 w-64 dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-300">
          <Zap className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">WHEN (TRIGGER)</span>
      </div>
      <p className="text-xs font-bold text-slate-900 dark:text-white">{String(d.label || "Trigger Event")}</p>
      {d.description && (
        <p className="text-[11px] text-slate-400 mt-0.5">{String(d.description)}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-indigo-600" />
    </div>
  );
});
TriggerNode.displayName = "TriggerNode";

export const ActionNode = memo(({ data }: NodeProps) => {
  const d = data as any;
  const isWhatsApp = d.type === "action_whatsapp";
  const isEmail = d.type === "action_email";
  const isTask = d.type === "action_task";
  const isAssign = d.type === "action_assign";

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 w-64 dark:bg-slate-900 ${
        isWhatsApp
          ? "border-emerald-500"
          : isEmail
          ? "border-sky-500"
          : isTask
          ? "border-amber-500"
          : isAssign
          ? "border-purple-500"
          : "border-indigo-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400" />
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`h-6 w-6 rounded-lg flex items-center justify-center text-white ${
            isWhatsApp
              ? "bg-emerald-600"
              : isEmail
              ? "bg-sky-600"
              : isTask
              ? "bg-amber-600"
              : isAssign
              ? "bg-purple-600"
              : "bg-indigo-600"
          }`}
        >
          {isWhatsApp ? (
            <Send className="h-3.5 w-3.5" />
          ) : isEmail ? (
            <Mail className="h-3.5 w-3.5" />
          ) : isTask ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : isAssign ? (
            <UserCheck className="h-3.5 w-3.5" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">THEN (ACTION)</span>
      </div>
      <p className="text-xs font-bold text-slate-900 dark:text-white">{String(d.label || "Action Step")}</p>
      {d.description && (
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{String(d.description)}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-slate-400" />
    </div>
  );
});
ActionNode.displayName = "ActionNode";

export const DelayNode = memo(({ data }: NodeProps) => {
  const d = data as any;
  return (
    <div className="px-4 py-3 shadow-md rounded-xl bg-slate-50 border-2 border-slate-300 w-64 dark:bg-slate-900 dark:border-slate-700">
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400" />
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center dark:bg-slate-800 dark:text-slate-300">
          <Clock className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WAIT (DELAY)</span>
      </div>
      <p className="text-xs font-bold text-slate-900 dark:text-white">{String(d.label || "Wait Step")}</p>
      {d.description && (
        <p className="text-[11px] text-slate-400 mt-0.5">{String(d.description)}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-slate-400" />
    </div>
  );
});
DelayNode.displayName = "DelayNode";

export const ConditionNode = memo(({ data }: NodeProps) => {
  const d = data as any;
  return (
    <div className="px-4 py-3 shadow-md rounded-xl bg-amber-50/50 border-2 border-amber-500 w-64 dark:bg-slate-900">
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-amber-500" />
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center dark:bg-amber-950 dark:text-amber-300">
          <GitBranch className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">IF (BRANCH)</span>
      </div>
      <p className="text-xs font-bold text-slate-900 dark:text-white">{String(d.label || "Check Condition")}</p>
      <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
        <span className="text-emerald-600">YES ➔</span>
        <span className="text-rose-600">NO ➔</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%" }} className="w-2.5 h-2.5 bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%" }} className="w-2.5 h-2.5 bg-rose-500" />
    </div>
  );
});
ConditionNode.displayName = "ConditionNode";
