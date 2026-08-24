"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import {
  ArrowLeft,
  Sparkles,
  Play,
  Save,
  Plus,
  Send,
  Mail,
  Clock,
  GitBranch,
  CheckCircle2,
  UserCheck,
  Bot,
  Zap,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TriggerNode, ActionNode, DelayNode, ConditionNode } from "@/components/automation/CustomNodes";
import { useFlowDesk } from "@/lib/store";
import { explainAutomationFlow } from "@/lib/ai/flowExplainer";

export default function AutomationCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const autoId = params.id as string;
  const { automations, updateAutomation, triggerAutomationTest } = useFlowDesk();

  const automation = automations.find((a) => a.id === autoId) || automations[0];

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (automation?.flowDefinition?.nodes as unknown as Node[]) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (automation?.flowDefinition?.edges as Edge[]) || []
  );

  const [isActive, setIsActive] = useState(automation?.status === "ACTIVE");
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isTestRunModalOpen, setIsTestRunModalOpen] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action_whatsapp: ActionNode,
      action_email: ActionNode,
      action_task: ActionNode,
      action_assign: ActionNode,
      delay: DelayNode,
      condition: ConditionNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Add block to canvas
  const handleAddBlock = (type: string, label: string, config: any = {}) => {
    const newId = `node-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newY = lastNode ? lastNode.position.y + 130 : 150;

    const newNode: Node = {
      id: newId,
      type: type,
      position: { x: 250, y: newY },
      data: {
        label,
        type,
        config,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    if (lastNode) {
      setEdges((eds) => [...eds, { id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }]);
    }
  };

  const handleSave = () => {
    updateAutomation(automation.id, {
      flowDefinition: {
        nodes: nodes as any,
        edges: edges as any,
      },
      status: isActive ? "ACTIVE" : "PAUSED",
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunSimulation = async () => {
    setIsTesting(true);
    setIsTestRunModalOpen(true);
    setTestLogs(["Initializing FlowDesk Automation Execution Engine..."]);

    const res = await triggerAutomationTest(automation.id);
    setTestLogs(res.log);
    setIsTesting(false);
  };

  const explanationText = useMemo(
    () => explainAutomationFlow(nodes as any, edges as any),
    [nodes, edges]
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* Top Canvas Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/automations"
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2 dark:text-white">
              <span>{automation?.name || "Visual Automation Flow"}</span>
              <Badge variant={isActive ? "success" : "secondary"} className="text-[10px]">
                {isActive ? "LIVE" : "PAUSED"}
              </Badge>
            </h1>
            <p className="text-[11px] text-slate-400">WHEN ➔ IF ➔ THEN Visual Flow Builder</p>
          </div>
        </div>

        {/* Right Canvas Actions */}
        <div className="flex items-center gap-2.5">
          {/* AI Explainer */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExplainModalOpen(true)}
            className="text-xs font-semibold gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Explain This Automation</span>
          </Button>

          {/* Test Runner */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunSimulation}
            className="text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            <Play className="h-3.5 w-3.5 fill-emerald-600" />
            <span>Test Flow</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          {/* Status Toggle */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>{isActive ? "Active" : "Paused"}</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saveSuccess ? "Saved!" : "Save Flow"}</span>
          </Button>
        </div>
      </div>

      {/* Main Flow Canvas & Block Library Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Block Library */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-4 shrink-0 dark:bg-slate-900/60 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Block Library
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Click to add step to your flowchart.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleAddBlock("action_whatsapp", "Send WhatsApp Message", { templateName: "welcome_intro" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Send className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold group-hover:text-emerald-600">Send WhatsApp</p>
                <p className="text-[10px] text-slate-400 font-normal">Official Cloud API template</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("action_email", "Send Tracked Email", { subject: "FlowDesk Follow-up" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold group-hover:text-sky-600">Send Email</p>
                <p className="text-[10px] text-slate-400 font-normal">Open & link tracking</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("delay", "Wait 2 Days", { duration: 2, unit: "days" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 dark:bg-slate-700 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold">Smart Delay</p>
                <p className="text-[10px] text-slate-400 font-normal">Wait hours / days</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("condition", "Check Lead Score > 70", { field: "leadScore", operator: ">", value: "70" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <GitBranch className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold group-hover:text-amber-600">IF Condition</p>
                <p className="text-[10px] text-slate-400 font-normal">Branch YES / NO</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("action_task", "Create Follow-up Task", { title: "Call customer", priority: "HIGH" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold group-hover:text-amber-600">Create Task</p>
                <p className="text-[10px] text-slate-400 font-normal">Assign sales action item</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("action_assign", "Assign Lead (Round-Robin)", { method: "Round-Robin" })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-xs text-left transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-800 group dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold group-hover:text-purple-600">Assign Rep</p>
                <p className="text-[10px] text-slate-400 font-normal">Round-robin / territory</p>
              </div>
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 h-full bg-slate-100/60 dark:bg-slate-950 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="h-full w-full"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#94a3b8" />
            <Controls className="bg-white border border-slate-200 shadow-sm rounded-lg dark:bg-slate-900 dark:border-slate-800" />
          </ReactFlow>
        </div>
      </div>

      {/* Modal: AI "Explain This Automation" */}
      <Dialog open={isExplainModalOpen} onOpenChange={setIsExplainModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Explain This Automation</DialogTitle>
                <DialogDescription className="text-xs">Plain-English summary for non-technical users</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
            {explanationText}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Test Run Simulation Logs */}
      <Dialog open={isTestRunModalOpen} onOpenChange={setIsTestRunModalOpen}>
        <DialogContent className="max-w-lg bg-slate-900 text-slate-100 border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Live Automation Test Runner</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">Step-by-step queue execution trace</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-3 bg-black/60 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 h-64 overflow-y-auto">
            {testLogs.map((log, idx) => (
              <div key={idx} className="text-emerald-400 flex items-start gap-1.5">
                <span className="text-slate-500 shrink-0">➔</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
