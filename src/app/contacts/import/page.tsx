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
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  FolderKanban,
  Zap,
  Image as ImageIcon,
  User,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import { LeadPhotoCapture } from "@/components/leads/LeadPhotoCapture";

export default function BulkImportPage() {
  const router = useRouter();
  const { bulkImportLeads } = useFlowDesk();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<"EXCEL" | "OCR">("EXCEL");

  const [fileName, setFileName] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<
    Array<{
      name: string;
      company?: string;
      email?: string;
      phone?: string;
      whatsApp?: string;
      source?: string;
      photoUrl?: string;
      photoType?: "card" | "person" | "document";
    }>
  >([]);

  // OCR state
  const [ocrPhotoUrl, setOcrPhotoUrl] = useState<string>("");
  const [ocrName, setOcrName] = useState("");
  const [ocrCompany, setOcrCompany] = useState("");
  const [ocrEmail, setOcrEmail] = useState("");
  const [ocrPhone, setOcrPhone] = useState("");
  const [ocrNotes, setOcrNotes] = useState("");
  const [ocrText, setOcrText] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const defaultFolderName =
      file.name.replace(/\.[^/.]+$/, "") + " — " + new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
    setFolderName(defaultFolderName);

    const isCsv = file.name.endsWith(".csv");
    if (isCsv) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          normalizeAndSetRows(results.data as any[]);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        normalizeAndSetRows(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const normalizeAndSetRows = (raw: any[]) => {
    const rows = raw
      .filter((r) => r && Object.keys(r).length > 0)
      .map((r, idx) => {
        const name = r.name || r.Name || r["Customer Name"] || r["Client Name"] || r["Full Name"] || `Contact ${idx + 1}`;
        const company = r.company || r.Company || r["Company Name"] || r.Firm || "";
        const email = r.email || r.Email || r["Mail ID"] || r["E-mail"] || "";
        const phone = String(r.phone || r.Phone || r.Mobile || r["Contact No"] || r["WhatsApp"] || "");
        const whatsApp = String(r.whatsApp || r.WhatsApp || phone || "");
        const source = r.source || r.Source || "Bulk Upload";
        const photoUrl = r.photoUrl || r.PhotoUrl || undefined;
        const photoType = r.photoType || (photoUrl ? "card" : undefined);

        return { name, company, email, phone, whatsApp, source, photoUrl, photoType };
      });

    setParsedRows(rows);
    setStep(2);
  };

  const loadPreset = (type: "facebook" | "exhibition") => {
    if (type === "facebook") {
      setFileName("Facebook_Leads_August_2026.xlsx");
      setFolderName("Facebook Leads - August 2026");
      normalizeAndSetRows([
        { Name: "John Smith", Company: "ABC Tech", Email: "john@abc.com", Phone: "+91 98765 43210", WhatsApp: "+91 98765 43210", Source: "Facebook Ads" },
        { Name: "Rahul Kumar", Company: "Apex Infra", Email: "rahul@apex.in", Phone: "+91 98112 34567", WhatsApp: "+91 98112 34567", Source: "Facebook Ads" },
        { Name: "Priya Patel", Company: "Patel Exports", Email: "priya@patelexports.com", Phone: "+91 98223 34455", WhatsApp: "+91 98223 34455", Source: "Facebook Ads" },
        { Name: "David Brown", Company: "Skyline Ventures", Email: "david@skyline.com", Phone: "+91 97123 45678", WhatsApp: "+91 97123 45678", Source: "Facebook Ads" },
        { Name: "Neha Gupta", Company: "Gupta Designs", Email: "neha@guptadesigns.in", Phone: "+91 98300 11223", WhatsApp: "+91 98300 11223", Source: "Facebook Ads" },
      ]);
    } else {
      setFileName("Exhibition_Leads_2026.csv");
      setFolderName("Exhibition Leads — Tech Expo 2026");
      normalizeAndSetRows([
        { Name: "Vikram Malhotra", Company: "Malhotra Logix", Email: "vikram@malhotra.com", Phone: "+91 98990 01122", WhatsApp: "+91 98990 01122", Source: "Tech Expo" },
        { Name: "Ananya Sen", Company: "Sen Dynamics", Email: "ananya@sendynamics.com", Phone: "+91 98771 22334", WhatsApp: "+91 98771 22334", Source: "Tech Expo" },
        { Name: "Rohan Varma", Company: "Varma Industries", Email: "rohan@varmaind.com", Phone: "+91 98662 33445", WhatsApp: "+91 98662 33445", Source: "Tech Expo" },
      ]);
    }
  };

  const handleAddCardToImport = () => {
    if (!ocrName.trim()) return;
    const newCardRow = {
      name: ocrName,
      company: ocrCompany,
      email: ocrEmail,
      phone: ocrPhone,
      whatsApp: ocrPhone,
      source: "Camera / Card Scan",
      photoUrl: ocrPhotoUrl || undefined,
      photoType: (ocrPhotoUrl ? "card" : undefined) as "card" | undefined,
    };

    setFolderName("Scanned Business Cards — " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    setParsedRows([newCardRow, ...parsedRows]);
    setStep(2);
  };

  const handleRunTextOCR = () => {
    if (!ocrText.trim()) return;
    const lines = ocrText.split("\n").map((l) => l.trim()).filter(Boolean);
    const name = lines[0] || "Scanned Contact";
    const company = lines[1] || "";
    let email = "";
    let phone = "";

    lines.forEach((line) => {
      if (line.includes("@") && !email) email = line;
      if (/[0-9]{8,}/.test(line.replace(/[^0-9]/g, "")) && !phone) phone = line;
    });

    setOcrName(name);
    setOcrCompany(company);
    if (email) setOcrEmail(email);
    if (phone) setOcrPhone(phone);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    bulkImportLeads(parsedRows, folderName || "Imported Leads");
    setStep(3);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bulk Lead & Card Import
            </h1>
            <Badge variant="purple" className="text-xs">Step {step} of 3</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload Excel/CSV spreadsheets or snap business cards directly with camera to create organized lead folders.
          </p>
        </div>
      </div>

      {/* STEP 1: Upload or Snap */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("EXCEL")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "EXCEL" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel & CSV Spreadsheet</span>
            </button>
            <button
              onClick={() => setActiveTab("OCR")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "OCR" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Snap Photo / Card Scan (Camera & OCR)</span>
            </button>
          </div>

          {activeTab === "EXCEL" && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 sm:p-10 text-center bg-white hover:bg-slate-50/70 hover:border-indigo-400 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-700">
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
                      Drop Excel / CSV here, or <span className="text-indigo-600 hover:underline">browse files</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Header columns: Name | Company | Email | Phone | WhatsApp
                    </p>
                  </div>
                </label>
              </div>

              {/* Instant Presets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 dark:bg-slate-900/50 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Try with 1-click sample lead lists:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loadPreset("facebook")}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs text-left transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-900 block dark:text-white">
                      Facebook Leads - August 2026.xlsx
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">5 Verified Inquiries</p>
                  </button>

                  <button
                    onClick={() => loadPreset("exhibition")}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs text-left transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-900 block dark:text-white">
                      Exhibition Leads 2026.csv
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">3 Event Registrations</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "OCR" && (
            <div className="space-y-6">
              <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/20 to-purple-50/20 dark:bg-slate-900">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    <span>Live Camera Capture & Business Card Scanner</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hold a business card to your camera, click capture or upload an image. Fields are automatically extracted for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Embedded Camera Component */}
                  <LeadPhotoCapture
                    currentPhotoUrl={ocrPhotoUrl}
                    onPhotoCaptured={(dataUrl, autoFields) => {
                      setOcrPhotoUrl(dataUrl);
                      if (autoFields) {
                        if (autoFields.name) setOcrName(autoFields.name);
                        if (autoFields.company) setOcrCompany(autoFields.company);
                        if (autoFields.phone) setOcrPhone(autoFields.phone);
                        if (autoFields.email) setOcrEmail(autoFields.email);
                      }
                    }}
                    onRemovePhoto={() => {
                      setOcrPhotoUrl("");
                    }}
                  />

                  {/* Extracted Details Form */}
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Contact Details (Extracted from Photo):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                        <Input
                          placeholder="e.g. Amit Sharma"
                          value={ocrName}
                          onChange={(e) => setOcrName(e.target.value)}
                          className="bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company</label>
                        <Input
                          placeholder="e.g. Apex Solutions"
                          value={ocrCompany}
                          onChange={(e) => setOcrCompany(e.target.value)}
                          className="bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone / WhatsApp</label>
                        <Input
                          placeholder="e.g. +91 98765 00000"
                          value={ocrPhone}
                          onChange={(e) => setOcrPhone(e.target.value)}
                          className="bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                        <Input
                          type="email"
                          placeholder="e.g. amit@apexsolutions.com"
                          value={ocrEmail}
                          onChange={(e) => setOcrEmail(e.target.value)}
                          className="bg-white dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        disabled={!ocrName.trim()}
                        onClick={handleAddCardToImport}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Add Scanned Contact & Continue</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Manual OCR Paste Alternative */}
                  <details className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <summary className="font-semibold text-slate-500 hover:text-slate-700 cursor-pointer py-1">
                      Or paste raw text from card / OCR screenshot
                    </summary>
                    <div className="space-y-2 pt-2">
                      <textarea
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                        placeholder="Amit Sharma&#10;Apex Solutions&#10;amit@apexsolutions.com&#10;+91 98765 00000"
                        className="w-full h-20 p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono dark:bg-slate-950 dark:border-slate-800"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRunTextOCR}
                        disabled={!ocrText.trim()}
                        className="text-xs"
                      >
                        Parse Pasted Text
                      </Button>
                    </div>
                  </details>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Preview & Bulk Folder Creation */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Folder Naming Card */}
          <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-slate-900">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-600" />
                <span>Bulk Folder Creation</span>
              </CardTitle>
              <CardDescription className="text-xs">
                When importing a batch of leads, automatically create a folder/list so team members understand lead origin.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Folder / List Name *</label>
              <Input
                required
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Facebook Leads - August 2026"
                className="bg-white max-w-md dark:bg-slate-950"
              />
            </CardContent>
          </Card>

          {/* Table Preview */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold">
                Preview Contacts to Import ({parsedRows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold dark:bg-slate-900 dark:border-slate-800">
                    <th className="p-3 pl-4">Contact</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone / WhatsApp</th>
                    <th className="p-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          {row.photoUrl ? (
                            <img
                              src={row.photoUrl}
                              alt={row.name}
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center justify-center text-slate-600 dark:text-slate-300">
                              {row.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{row.company || "—"}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{row.email || "—"}</td>
                      <td className="p-3 font-mono text-emerald-600 font-semibold">{row.whatsApp || row.phone || "—"}</td>
                      <td className="p-3 text-slate-500">{row.source || "Bulk"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md cursor-pointer"
            >
              <span>Save Leads into &apos;{folderName}&apos;</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <Card className="border-emerald-200 bg-emerald-50/20 text-center p-8 sm:p-10 space-y-4 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Successfully Imported {parsedRows.length} Leads! 🎉
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Created folder &apos;<strong>{folderName}</strong>&apos;. You can now select this entire list for an Email/WhatsApp campaign.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => router.push("/contacts")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5"
            >
              <User className="h-4 w-4" />
              <span>View All Leads</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/contacts/lists")}
              className="text-xs font-medium"
            >
              <FolderKanban className="h-4 w-4 text-indigo-600" />
              <span>View Lead Folders</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
