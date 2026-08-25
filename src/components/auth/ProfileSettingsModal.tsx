"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2,
  Key,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { currentUser, organization, updateUserProfile } = useFlowDesk();

  if (!currentUser || !organization) return null;

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    const res = updateUserProfile(currentUser.id, {
      name,
      phone,
      password: newPassword ? newPassword : undefined,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Profile & Security Settings</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage your personal profile information and change your password.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
          {/* Agency & Locked Role Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Organization:</span>
              <strong className="text-slate-800 text-xs dark:text-slate-200">{organization.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Agency ID:</span>
              <strong className="text-indigo-600 font-mono text-xs">{organization.joinCode}</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-[10px]">Assigned Role:</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="purple" className="text-[10px]">
                  {currentUser.role}
                </Badge>
                <span className="text-[10px] text-amber-600 font-bold dark:text-amber-400">
                  (Locked by Admin)
                </span>
              </div>
            </div>
          </div>

          {/* Profile Name & Phone */}
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Registered Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  disabled
                  value={currentUser.email}
                  className="pl-9 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Email is managed by your Main Admin.</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number (WhatsApp)</label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs dark:text-white flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-indigo-600" />
              <span>Change Password</span>
            </h4>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">New Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new permanent password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new permanent password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
