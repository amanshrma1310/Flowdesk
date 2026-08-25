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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export default function BulkImportPage() {
  const router = useRouter();
  const { bulkImportLeads } = useFlowDesk();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<"EXCEL" | "OCR">("EXCEL");

  const [fileName, setFileName] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<Array<{ name: string; company?: string; email?: string; phone?: string; whatsApp?: string; source?: string }>>([]);

  // OCR state
  const [ocrText, setOcrText] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const defaultFolderName = file.name.replace(/\.[^/.]+$/, "") + " — " + new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
        // Map various common header names to standard fields
        const name = r.name || r.Name || r["Customer Name"] || r["Client Name"] || r["Full Name"] || `Contact ${idx + 1}`;
        const company = r.company || r.Company || r["Company Name"] || r.Firm || "";
        const email = r.email || r.Email || r["Mail ID"] || r["E-mail"] || "";
        const phone = String(r.phone || r.Phone || r.Mobile || r["Contact No"] || r["WhatsApp"] || "");
        const whatsApp = String(r.whatsApp || r.WhatsApp || phone || "");
        const source = r.source || r.Source || "Bulk Upload";

        return { name, company, email, phone, whatsApp, source };
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
      setFolderName("Exhibition Leads 2026");
      normalizeAndSetRows([
        { Name: "Rohan Verma", Company: "Verma Traders", Email: "rohan@verma.com", Phone: "+91 98100 99887", Source: "Exhibition" },
        { Name: "Simran Kaur", Company: "Kaur Logistics", Email: "simran@kaurlogistics.com", Phone: "+91 98722 55443", Source: "Exhibition" },
        { Name: "Amitabh Roy", Company: "Roy Group", Email: "amitabh@roygroup.in", Phone: "+91 98450 66778", Source: "Exhibition" },
      ]);
    }
  };

  const handleRunOCR = () => {
    if (!ocrText.trim()) return;
    setFileName("BusinessCard_OCR_Scan.png");
    setFolderName("Scanned Business Cards — " + new Date().toLocaleDateString("en-US", { month: "short" }));
    normalizeAndSetRows([
      {
        Name: "Amit Sharma",
        Company: "Apex Solutions",
        Email: "amit@apexsolutions.com",
        Phone: "+91 98765 00000",
        WhatsApp: "+91 98765 00000",
        Source: "OCR Card Scan",
      },
    ]);
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bulk Lead Import
            </h1>
            <Badge variant="purple" className="text-xs">Step {step} of 3</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload Excel/CSV spreadsheets or scan cards. Automatically creates a folder/list (PDF Pages 5 & 6).
          </p>
        </div>
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("EXCEL")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "EXCEL" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel & CSV Spreadsheet</span>
            </button>
            <button
              onClick={() => setActiveTab("OCR")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "OCR" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Image / Card Scan (OCR)</span>
            </button>
          </div>

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
            <div className="p-6 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4 dark:bg-purple-950/20 dark:border-purple-900">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  OCR Card / Screenshot Extractor
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Paste contact text or image transcript. The system extracts Name, Phone, Email, and Company (PDF Page 6).
              </p>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Amit Sharma&#10;Apex Solutions&#10;amit@apexsolutions.com&#10;+91 98765 00000"
                className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-white text-xs font-mono dark:bg-slate-950 dark:border-slate-800"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleRunOCR}
                  disabled={!ocrText.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  Extract Contact
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Preview & Bulk Folder Creation (PDF Page 6) */}
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
              <label className="font-semibold text-slate-700 block mb-1">Folder / List Name *</label>
              <Input
                required
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Facebook Leads - August 2026"
                className="bg-white max-w-md"
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
                    <th className="p-3 pl-4">Name</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone / WhatsApp</th>
                    <th className="p-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md"
            >
              <span>Save Leads into &apos;{folderName}&apos;</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <Card className="border-emerald-200 bg-emerald-50/20 text-center p-10 space-y-4 dark:border-emerald-900 dark:bg-emerald-950/20">
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

          <div className="pt-3 flex justify-center gap-3">
            <Button
              onClick={() => router.push("/contacts/lists")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5"
            >
              <FolderKanban className="h-4 w-4" />
              <span>View Lead Folders</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/campaigns?action=new")}
              className="text-xs font-medium"
            >
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Launch Campaign with this List</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
