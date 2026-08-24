"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Flame,
  Calendar,
  Mail,
  ShoppingCart,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_AUTOMATION_TEMPLATES } from "@/lib/mockData";
import { useFlowDesk } from "@/lib/store";

export default function AutomationTemplatesPage() {
  const router = useRouter();
  const { createAutomation } = useFlowDesk();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "SALES", "MARKETING", "EVENTS", "ECOMMERCE"];

  const handleUseTemplate = (template: any) => {
    const newAuto = createAutomation({
      name: template.name,
      description: template.description,
      category: template.category,
      triggerType: "CONTACT_CREATED",
      flowDefinition: {
        nodes: [
          {
            id: "node-1",
            type: "trigger",
            position: { x: 250, y: 50 },
            data: { label: "Trigger: " + template.name, type: "trigger", config: {} },
          },
          {
            id: "node-2",
            type: "action_whatsapp",
            position: { x: 250, y: 180 },
            data: { label: "Send Automated WhatsApp", type: "action_whatsapp", config: { templateName: "welcome_intro" } },
          },
          {
            id: "node-3",
            type: "delay",
            position: { x: 250, y: 310 },
            data: { label: "Wait 1 Day", type: "delay", config: { duration: 1, unit: "days" } },
          },
          {
            id: "node-4",
            type: "action_task",
            position: { x: 250, y: 440 },
            data: { label: "Create Rep Follow-up Task", type: "action_task", config: { title: "Follow up with customer" } },
          },
        ],
        edges: [
          { id: "e1-2", source: "node-1", target: "node-2", animated: true },
          { id: "e2-3", source: "node-2", target: "node-3", animated: true },
          { id: "e3-4", source: "node-3", target: "node-4", animated: true },
        ],
      },
    });

    router.push(`/automations/${newAuto.id}`);
  };

  const filteredTemplates = MOCK_AUTOMATION_TEMPLATES.filter(
    (t) => selectedCategory === "ALL" || t.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/automations"
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Automations</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Ready-to-Use Workflow Recipes</span>
            <Badge variant="purple" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> 1-Click Launch
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured best practices for sales follow-ups, webinar reminders, re-engagement, and abandoned carts.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            {cat === "ALL" ? "All Recipes" : cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
                  {template.icon === "Flame" ? (
                    <Flame className="h-4 w-4 text-rose-500" />
                  ) : template.icon === "Calendar" ? (
                    <Calendar className="h-4 w-4 text-indigo-500" />
                  ) : template.icon === "Mail" ? (
                    <Mail className="h-4 w-4 text-sky-500" />
                  ) : template.icon === "ShoppingCart" ? (
                    <ShoppingCart className="h-4 w-4 text-amber-500" />
                  ) : template.icon === "PhoneCall" ? (
                    <PhoneCall className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Zap className="h-4 w-4 text-indigo-500" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {template.recommended && (
                    <Badge variant="success" className="text-[10px]">
                      Popular
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {template.category}
                  </Badge>
                </div>
              </div>

              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {template.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0">
              <Button
                onClick={() => handleUseTemplate(template)}
                size="sm"
                className="w-full bg-indigo-50 text-indigo-900 hover:bg-indigo-600 hover:text-white border border-indigo-200/70 font-semibold text-xs transition-colors gap-1.5 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800"
              >
                <span>Use This Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
