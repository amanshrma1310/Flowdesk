"use client";

import React, { useState, useEffect, use } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import { LeadForm } from "@/lib/types";

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const { forms, submitLeadForm, organization } = useFlowDesk();

  const [targetForm, setTargetForm] = useState<LeadForm | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    const found = forms.find((f) => f.id === formId);
    if (found) {
      setTargetForm(found);
    } else {
      // Fallback starter form
      setTargetForm({
        id: formId,
        agencyId: organization?.id || "org-1",
        title: "Website Consultation & Inquiry Form",
        description: "Submit your details below to request a personalized quote and consultation.",
        submitButtonText: "Submit Inquiry",
        successMessage: "Thank you! Our marketing team has received your request and will contact you via WhatsApp / Email shortly.",
        fields: [
          { id: "f-name", label: "Full Name", name: "name", type: "text", required: true, placeholder: "John Doe" },
          { id: "f-phone", label: "WhatsApp / Phone Number", name: "phone", type: "tel", required: true, placeholder: "+91 98765 43210" },
          { id: "f-email", label: "Work Email", name: "email", type: "email", required: true, placeholder: "john@company.com" },
          { id: "f-comp", label: "Company Name", name: "company", type: "text", required: false, placeholder: "Acme Corp" },
          { id: "f-notes", label: "Project Details / Notes", name: "notes", type: "textarea", required: false, placeholder: "How can we help your business?" },
        ],
        submissionCount: 0,
        isActive: true,
        createdById: "admin",
        createdByName: "Admin",
        createdAt: new Date().toLocaleDateString(),
      });
    }
  }, [formId, forms, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.phone.trim() && !formData.email.trim())) {
      alert("Please provide your name and phone number or email.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitLeadForm(formId, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      notes: formData.notes,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      setResponseMsg(res.message || targetForm?.successMessage || "Thank you! Your submission was received.");
    }
  };

  if (!targetForm) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/30 text-white mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{targetForm.title}</h1>
          {targetForm.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{targetForm.description}</p>
          )}
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-xl text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm text-white">Inquiry Submitted!</h3>
            <p className="text-xs text-emerald-300/90 leading-relaxed">{responseMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {targetForm.fields.map((field) => (
              <div key={field.id}>
                <label className="font-semibold text-slate-300 block mb-1">
                  {field.label} {field.required && <span className="text-indigo-400">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-sans"
                  />
                ) : (
                  <div className="relative">
                    {field.name === "name" && <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name === "phone" && <Phone className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name === "email" && <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name === "company" && <Building2 className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}

                    <Input
                      required={field.required}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>{targetForm.submitButtonText || "Submit Inquiry"}</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <p className="text-[10px] text-center text-slate-500 pt-1">
              Protected by FlowDesk AI Lead Intelligence.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
