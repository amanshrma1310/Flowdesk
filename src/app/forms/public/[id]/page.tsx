"use client";

import React, { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
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
  ChevronDown,
  Hash,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadForm } from "@/lib/types";

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const searchParams = useSearchParams();
  const isSubmittedFromUrl = searchParams.get("submitted") === "true";

  const [targetForm, setTargetForm] = useState<LeadForm | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmittedFromUrl);
  const [responseMsg, setResponseMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Fetch form configuration from server API
    fetch(`/api/v1/agencies`)
      .then((res) => res.json())
      .then((data) => {
        if (data.agencies && Array.isArray(data.agencies)) {
          for (const agency of data.agencies) {
            const formMatch = agency.forms?.find((f: LeadForm) => f.id === formId);
            if (formMatch) {
              setTargetForm(formMatch);
              return;
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        // Fallback default form if not yet created on server
        setTargetForm((current) => {
          if (current) return current;
          return {
            id: formId,
            agencyId: "org-1",
            title: "Website Consultation & Inquiry Form",
            description: "Submit your details below to request a personalized consultation.",
            submitButtonText: "Submit Inquiry",
            successMessage: "Thank you! We have received your inquiry. Our team will contact you shortly.",
            fields: [
              { id: "f-name", label: "Full Name", name: "name", type: "text", required: true, placeholder: "e.g. John Doe" },
              { id: "f-phone", label: "WhatsApp / Phone Number", name: "phone", type: "tel", required: true, placeholder: "e.g. +91 98765 43210" },
              { id: "f-email", label: "Work Email", name: "email", type: "email", required: true, placeholder: "e.g. john@company.com" },
              { id: "f-comp", label: "Company Name", name: "company", type: "text", required: false, placeholder: "e.g. Acme Corp" },
              { id: "f-notes", label: "Requirements / Notes", name: "notes", type: "textarea", required: false, placeholder: "Tell us about your needs..." },
            ],
            submissionCount: 0,
            isActive: true,
            createdById: "admin",
            createdByName: "Admin",
            createdAt: new Date().toLocaleDateString(),
          };
        });
      });
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name && !formData.phone && !formData.email) {
      setErrorMsg("Please provide at least your name and phone number or email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (json.success) {
        const destinationUrl = json.redirectUrl || targetForm?.redirectUrl;

        // Only redirect if custom external URL was configured
        if (destinationUrl && destinationUrl.startsWith("http")) {
          setRedirecting(true);
          setSubmitted(true);
          setResponseMsg(`Thank you! Redirecting to welcome page...`);
          setTimeout(() => {
            window.location.href = destinationUrl;
          }, 1000);
        } else {
          // Show on-screen confirmation card
          setSubmitted(true);
          setResponseMsg(json.message || targetForm?.successMessage || "Thank you! Your submission was received.");
        }
      } else {
        setErrorMsg(json.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg("Network error submitting form. Please try again.");
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({});
    setResponseMsg("");
    setErrorMsg(null);
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
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-3 sm:p-6 text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Form Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/30 text-white mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{targetForm.title}</h1>
          {targetForm.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{targetForm.description}</p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* THANK YOU / CONFIRMATION VIEW */}
        {submitted ? (
          <div className="p-6 sm:p-8 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-950/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-white">
                {redirecting ? "Redirecting..." : "Inquiry Submitted Successfully!"}
              </h3>
              <p className="text-xs text-emerald-300/90 leading-relaxed max-w-sm mx-auto">
                {responseMsg || targetForm.successMessage || "Thank you! We have received your request and our team will contact you shortly."}
              </p>
            </div>

            {!redirecting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetForm}
                className="mt-2 text-xs border-emerald-700 text-emerald-300 hover:bg-emerald-900/50 gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Submit Another Request</span>
              </Button>
            )}
          </div>
        ) : (
          /* LIVE LEAD CAPTURE FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {targetForm.fields.map((field) => (
              <div key={field.id}>
                <label className="font-semibold text-slate-300 block mb-1 text-[11px]">
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
                ) : field.type === "select" && field.options ? (
                  <div className="relative">
                    <select
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 px-3 text-xs focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">-- Select {field.label} --</option>
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                  </div>
                ) : (
                  <div className="relative">
                    {field.name.includes("name") && <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name.includes("phone") && <Phone className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name.includes("email") && <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.name.includes("company") && <Building2 className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}
                    {field.type === "number" && <Hash className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />}

                    <Input
                      required={field.required}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className={`bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 ${
                        field.name.includes("name") ||
                        field.name.includes("phone") ||
                        field.name.includes("email") ||
                        field.name.includes("company") ||
                        field.type === "number"
                          ? "pl-9"
                          : "px-3"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer mt-1"
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

            <p className="text-[10px] text-center text-slate-500 pt-0.5">
              Protected by FlowDesk AI Lead Intelligence.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
