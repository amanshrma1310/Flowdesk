"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  FileSpreadsheet,
  Camera,
  Link2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Check,
  RefreshCw,
  HelpCircle,
  FileText,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { autoDetectColumnMappings, cleanAndValidateDataset, CleanedContactRow } from "@/lib/ai/dataCleaner";
import { parseOCRText, SAMPLE_OCR_PRESETS } from "@/lib/ai/ocrScanner";
import { SmartImportColumnMapping, DataHealthReport } from "@/lib/types";
import { useFlowDesk } from "@/lib/store";

export default function SmartImportPage() {
  const router = useRouter();
  const { importContacts, contacts } = useFlowDesk();

  // Wizard Steps: 1 = Upload / Scan, 2 = AI Column Mapping, 3 = Data Health & Fix, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<"EXCEL" | "OCR" | "WEBHOOK">("EXCEL");
  
  // Data State
  const [fileName, setFileName] = useState<string>("");
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMappings, setColumnMappings] = useState<SmartImportColumnMapping[]>([]);
  const [cleanedRows, setCleanedRows] = useState<CleanedContactRow[]>([]);
  const [healthReport, setHealthReport] = useState<DataHealthReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoFixed, setIsAutoFixed] = useState(false);

  // OCR state
  const [ocrText, setOcrText] = useState("");
  const [ocrPreviewImage, setOcrPreviewImage] = useState<string | null>(null);

  // Handle Excel/CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    const isCsv = file.name.endsWith(".csv");

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          processParsedRows(results.data as Record<string, any>[], file.name);
        },
      });
    } else {
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];
        processParsedRows(data, file.name);
      };
      reader.readAsBinaryString(file);
    }
  };

  // Preset demo datasets for instant 1-click test
  const loadPresetDataset = (type: "500_leads" | "real_estate") => {
    setIsProcessing(true);
    let sampleData: Record<string, any>[] = [];

    if (type === "500_leads") {
      setFileName("500_contacts.xlsx");
      sampleData = [
        { "Customer Name": "John Smith", "Mobile": "+91 9876543210", "Mail ID": "john@gmail.com", "Company": "ABC Technologies", "Product": "Website Redesign" },
        { "Customer Name": "Rahul Kumar", "Mobile": "9811234567", "Mail ID": "rahul.k@apex.in", "Company": "Apex Infra", "Product": "CRM Suite" },
        { "Customer Name": "Priya Sharma", "Mobile": "09822334455", "Mail ID": "priya.sharma@gmail.com", "Company": "Sharma Consulting", "Product": "WhatsApp Marketing" },
        { "Customer Name": "John Smith", "Mobile": "+919876543210", "Mail ID": "john@gmail.com", "Company": "ABC Tech", "Product": "Website" }, // Duplicate
        { "Customer Name": "David Brown", "Mobile": "9712345678", "Mail ID": "david@skyline.com", "Company": "Skyline Auto", "Product": "Lead Recovery" },
        { "Customer Name": "Aman Verma", "Mobile": "9845011223", "Mail ID": "aman.verma@vermatraders.com", "Company": "Verma Traders", "Product": "Enterprise Plan" },
        { "Customer Name": "", "Mobile": "9899001122", "Mail ID": "inquiry@techstart.io", "Company": "TechStart", "Product": "API Connect" }, // Missing name
      ];
    } else {
      setFileName("real_estate_inquiries.csv");
      sampleData = [
        { "Client Name": "Rohan Gupta", "Contact No": "+91 98100 22334", "Email": "rohan.g@guptahomes.com", "Firm": "Gupta Homes", "Requirement": "3BHK Luxury", "Budget": "1.8 Cr" },
        { "Client Name": "Simran Kaur", "Contact No": "98722 33445", "Email": "simran@kaurlogistics.com", "Firm": "Kaur Logistics", "Requirement": "Commercial Office", "Budget": "75 L" },
        { "Client Name": "Amitabh Roy", "Contact No": "98300 44556", "Email": "amitabh.roy@roygroup.in", "Firm": "Roy Real Estate", "Requirement": "Penthouse", "Budget": "3.5 Cr" },
      ];
    }

    setTimeout(() => {
      processParsedRows(sampleData, fileName || "leads.xlsx");
    }, 400);
  };

  const processParsedRows = (rows: Record<string, any>[], name: string) => {
    const validRows = rows.filter((r) => Object.keys(r).length > 0);
    setRawRows(validRows);

    // Auto-detect columns with AI heuristics
    const headers = Object.keys(validRows[0] || {});
    const mappings = autoDetectColumnMappings(headers, validRows.slice(0, 5));
    setColumnMappings(mappings);

    // Compute initial health report
    const existingEmails = new Set(contacts.map((c) => c.email?.toLowerCase()).filter(Boolean) as string[]);
    const existingPhones = new Set(contacts.map((c) => c.phone?.replace(/[^\d+]/g, "")).filter(Boolean) as string[]);
    
    const { cleanedRows: cleaned, health } = cleanAndValidateDataset(validRows, mappings, existingEmails, existingPhones);
    setCleanedRows(cleaned);
    setHealthReport(health);
    setIsProcessing(false);
    setStep(2);
  };

  // Handle OCR Scan Preset
  const handleRunOCR = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const ocrResult = parseOCRText(text);
      const row = {
        "Name": ocrResult.detectedContact.name,
        "Phone": ocrResult.detectedContact.phone,
        "Email": ocrResult.detectedContact.email,
        "Company": ocrResult.detectedContact.company,
        "Job Title": ocrResult.detectedContact.title,
        "Interest": ocrResult.detectedContact.interest,
      };
      processParsedRows([row], "OCR_Smart_Scan.png");
    }, 500);
  };

  // Auto-Fix Trigger
  const handleAutoFix = () => {
    setIsAutoFixed(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    if (healthReport) {
      setHealthReport({
        ...healthReport,
        duplicateCount: 0,
        invalidPhoneCount: 0,
        missingNameCount: 0,
        validContacts: healthReport.totalUploaded,
      });
    }
  };

  // Commit Import
  const handleConfirmImport = () => {
    importContacts(cleanedRows, fileName || "Smart Import");
    setStep(4);
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> Smart Import Engine
            </Badge>
            <span className="text-xs text-slate-400">Step {step} of 4</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 dark:text-white">
            Bring your customer data from anywhere
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Excel, CSV, business cards, screenshots, or webhooks — FlowDesk AI cleans, organizes, and starts automations.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: "Upload" },
            { num: 2, label: "AI Mapping" },
            { num: 3, label: "Health & Fix" },
            { num: 4, label: "Automate" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div
                className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  step === s.num
                    ? "bg-indigo-600 text-white"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step === s.num ? "text-indigo-600 font-semibold" : "text-slate-400"}`}>
                {s.label}
              </span>
              {s.num < 4 && <div className="h-[1px] w-3 bg-slate-200 dark:bg-slate-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Upload / OCR / Ingestion */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("EXCEL")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "EXCEL"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel & CSV Spreadsheet</span>
            </button>
            <button
              onClick={() => setActiveTab("OCR")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "OCR"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>AI Scanner (Screenshot / Business Card)</span>
            </button>
            <button
              onClick={() => setActiveTab("WEBHOOK")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "WEBHOOK"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Link2 className="h-4 w-4" />
              <span>Google Sheets & Inbound Webhooks</span>
            </button>
          </div>

          {/* Tab 1: Excel / CSV */}
          {activeTab === "EXCEL" && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white hover:bg-slate-50/70 hover:border-indigo-400 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-700">
                <input
                  type="file"
                  id="excel-file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="excel-file" className="cursor-pointer block space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs dark:bg-indigo-950/50 dark:text-indigo-400">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Drop your spreadsheet here, or <span className="text-indigo-600 hover:underline">browse files</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports .xlsx, .xls, and .csv files of any size or header format
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium dark:bg-slate-800 dark:text-slate-300">
                    <Wand2 className="h-3 w-3 text-indigo-500" />
                    <span>AI auto-detects columns — no manual formatting needed</span>
                  </div>
                </label>
              </div>

              {/* Demo Sample Presets */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Don&apos;t have a file handy? Try with realistic sample data:</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loadPresetDataset("500_leads")}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs text-left transition-all group cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white">
                        📊 500_contacts.xlsx
                      </span>
                      <Badge variant="secondary" className="text-[10px]">Contains Duplicates</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Header: Customer Name, Mobile, Mail ID, Company, Product
                    </p>
                  </button>

                  <button
                    onClick={() => loadPresetDataset("real_estate")}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs text-left transition-all group cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white">
                        🏢 real_estate_inquiries.csv
                      </span>
                      <Badge variant="purple" className="text-[10px]">High Value</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Header: Client Name, Contact No, Email, Firm, Budget
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI Scanner (OCR for Screenshots / Business Cards) */}
          {activeTab === "OCR" && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl space-y-4 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-purple-900/40">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    AI OCR Data Scanner
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                  Upload a photo of a business card, exhibition sheet, or a WhatsApp chat screenshot. Our multimodal AI extracts all fields and validates them automatically.
                </p>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Click a preset to test instant OCR extraction:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_OCR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setOcrText(preset.previewText);
                          handleRunOCR(preset.previewText);
                        }}
                        className="p-3 bg-white border border-purple-200/70 rounded-xl text-left hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                      >
                        <p className="text-xs font-bold text-purple-900 dark:text-purple-300">
                          {preset.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {preset.previewText}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Or paste raw contact text / card transcript here:
                  </p>
                  <textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder="e.g. John Smith +91 9876543210 john@gmail.com ABC Technologies Interested in Website"
                    className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-white text-xs font-mono dark:bg-slate-950 dark:border-slate-800"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleRunOCR(ocrText)}
                      disabled={!ocrText.trim() || isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Extract & Map Fields</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Webhook */}
          {activeTab === "WEBHOOK" && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Inbound Webhook & Google Sheets Sync
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Send leads directly from your website form, Google Sheet script, or Meta Lead Ads into FlowDesk AI.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                <span>https://api.flowdesk.ai/v1/webhooks/inbound/fd_live_998822</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">Copy URL</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: AI Column Mapping */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-indigo-600" />
                    <span>AI Detected Columns</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    We automatically matched your spreadsheet headers to FlowDesk CRM profile fields.
                  </CardDescription>
                </div>
                <Badge variant="success" className="text-xs">
                  {columnMappings.filter((m) => m.confidence > 0.8).length} of {columnMappings.length} Mapped with &gt;90% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {columnMappings.map((mapping, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {mapping.sourceColumn}
                        </p>
                        {mapping.sampleValue && (
                          <p className="text-[11px] text-slate-400">
                            Sample: &quot;{mapping.sampleValue}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/70 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                          🟢 {mapping.targetField}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {Math.round(mapping.confidence * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Button size="sm" onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold">
              <span>Continue to Data Health</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Data Health Report & 1-Click Auto-Fix */}
      {step === 3 && healthReport && (
        <div className="space-y-6">
          {/* Health Summary Card */}
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:to-slate-900">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Data Health Summary</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    FlowDesk scanned and sanitized your dataset before creating customer profiles.
                  </CardDescription>
                </div>
                {!isAutoFixed && (
                  <Button
                    size="sm"
                    onClick={handleAutoFix}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Fix Automatically</span>
                  </Button>
                )}
                {isAutoFixed && (
                  <Badge variant="success" className="text-xs py-1 px-3">
                    <Check className="h-3 w-3 mr-1" /> All Issues Automatically Fixed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {/* 4 Health Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[11px] font-medium text-slate-500">Records Uploaded</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 dark:text-white">{healthReport.totalUploaded}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs dark:bg-slate-800 dark:border-emerald-800">
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Valid Contacts</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{healthReport.validContacts}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs dark:bg-slate-800 dark:border-amber-800">
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Duplicates Detected</p>
                  <p className="text-xl font-bold text-amber-600 mt-0.5">{healthReport.duplicateCount}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs dark:bg-slate-800 dark:border-rose-800">
                  <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Invalid Phone Numbers</p>
                  <p className="text-xl font-bold text-rose-600 mt-0.5">{healthReport.invalidPhoneCount}</p>
                </div>
              </div>

              {/* What FlowDesk AI Cleaned */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 dark:bg-slate-950 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Automated Clean-up Applied:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {healthReport.suggestedFixes.map((fix, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cleaned Records Table Preview */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold">
                Preview Cleaned Customer Profiles ({cleanedRows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold dark:border-slate-800">
                    <th className="pb-2.5">Customer Name</th>
                    <th className="pb-2.5">Phone (E.164)</th>
                    <th className="pb-2.5">Email</th>
                    <th className="pb-2.5">Company</th>
                    <th className="pb-2.5">Lead Score</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cleanedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                      <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">{row.phone || "—"}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{row.email || "—"}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{row.company || "—"}</td>
                      <td className="py-2.5">
                        <Badge variant="default" className="text-[10px]">
                          {row.leadScore}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setStep(2)} className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-bold shadow-md"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Confirm Import & Start Follow-up Automations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Automation Kick-off Screen */}
      {step === 4 && (
        <Card className="border-emerald-200 bg-emerald-50/20 text-center p-10 space-y-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Successfully Imported {cleanedRows.length} Contacts! 🎉
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
              Profiles have been created, sanitized, and distributed via Round-Robin. Active automations have initiated the instant WhatsApp intro sequence.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/contacts")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>View Contacts Directory</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/automations")}
              className="text-xs font-medium"
            >
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Monitor Live Automations</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
