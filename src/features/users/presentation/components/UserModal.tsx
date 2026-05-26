"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { Role } from "@/types/auth";
import { User, UserFormState } from "@/types/user";
import { getRoleLabel } from "@/lib/role-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserModalProps {
  open: boolean;
  isEditing: boolean;
  currentUser: UserFormState;
  onClose: () => void;
  onSave: () => void;
  onSavePassword: () => void;
  onFormChange: (name: string, value: string | Role | boolean) => void;
  seoDevs: User[];
  isSeoDevView?: boolean;
}

const NONE_SEO_DEV = "__none__";

export const UserModal: React.FC<UserModalProps> = ({
  open,
  isEditing,
  currentUser,
  onClose,
  onSave,
  onSavePassword,
  onFormChange,
  seoDevs,
  isSeoDevView = false,
}) => {
  const { data: session } = useSession();
  const canEditRole = session?.user?.role === Role.ADMIN;
  const isOwnProfile = session?.user?.id === currentUser.id;

  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordEdit = () => {
    setIsPasswordEditing((prev) => {
      if (prev) {
        onFormChange("currentPassword", "");
        onFormChange("newPassword", "");
        onFormChange("confirmPassword", "");
      }
      return !prev;
    });
  };

  const handleCloseModal = () => {
    setIsPasswordEditing(false);
    setShowPassword(false);
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    onFormChange(name, type === "checkbox" ? checked : value);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[min(92vw,640px)]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "แก้ไขข้อมูลผู้ใช้งานในระบบ"
              : "กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่"}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label htmlFor="user-name">ชื่อผู้ใช้</Label>
            <Input
              id="user-name"
              name="name"
              value={currentUser.name || ""}
              onChange={handleInputChange}
            />
          </Field>

          <Field>
            <Label htmlFor="user-email">อีเมล</Label>
            <Input
              id="user-email"
              name="email"
              type="email"
              value={currentUser.email || ""}
              onChange={handleInputChange}
            />
          </Field>

          {!isEditing && (
            <Field>
              <Label htmlFor="user-password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="user-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={handleInputChange}
                  className="pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                  }
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </Field>
          )}

          <Field>
            <Label htmlFor="user-role">บทบาท</Label>
            <Select
              value={currentUser.role || ""}
              onValueChange={(v) => onFormChange("role", v as Role)}
              disabled={isSeoDevView && !canEditRole}
            >
              <SelectTrigger id="user-role">
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    disabled={isSeoDevView && role !== Role.CUSTOMER}
                  >
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {currentUser.role === Role.CUSTOMER && (
            <div className="rounded-lg border border-info/20 bg-info/5 p-4">
              <p className="mb-3 text-sm font-semibold text-info">
                ข้อมูลบริษัท
              </p>
              <FieldGroup>
                <Field>
                  <Label htmlFor="customer-company">ชื่อบริษัท</Label>
                  <Input
                    id="customer-company"
                    name="companyName"
                    value={currentUser.companyName || ""}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                </Field>

                <Field>
                  <Label htmlFor="customer-domain">
                    โดเมน (เช่น example.com)
                  </Label>
                  <Input
                    id="customer-domain"
                    name="domain"
                    value={currentUser.domain || ""}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                </Field>

                <Field>
                  <Label htmlFor="customer-contactName">ชื่อผู้ติดต่อ</Label>
                  <Input
                    id="customer-contactName"
                    name="contactName"
                    value={currentUser.contactName || ""}
                    onChange={handleInputChange}
                    placeholder="ชื่อ-นามสกุล ผู้ติดต่อ"
                  />
                </Field>

                <Field>
                  <Label htmlFor="customer-address">
                    ที่อยู่ (สำหรับออกเอกสาร)
                  </Label>
                  <Textarea
                    id="customer-address"
                    name="address"
                    value={currentUser.address || ""}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="ที่อยู่สำหรับออกใบแจ้งหนี้ / ใบเสร็จ"
                  />
                </Field>

                <Field>
                  <Label htmlFor="customer-taxId">เลขผู้เสียภาษี</Label>
                  <Input
                    id="customer-taxId"
                    name="taxId"
                    value={currentUser.taxId || ""}
                    onChange={handleInputChange}
                    placeholder="0000000000000"
                    maxLength={13}
                  />
                </Field>

                {!isSeoDevView && (
                  <Field>
                    <Label htmlFor="customer-seodev">ผู้ดูแล (SEO Dev)</Label>
                    <Select
                      value={currentUser.seoDevId || NONE_SEO_DEV}
                      onValueChange={(v) =>
                        onFormChange("seoDevId", v === NONE_SEO_DEV ? "" : v)
                      }
                    >
                      <SelectTrigger id="customer-seodev">
                        <SelectValue placeholder="-- ไม่กำหนด --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_SEO_DEV}>
                          -- ไม่กำหนด --
                        </SelectItem>
                        {seoDevs.map((dev) => (
                          <SelectItem key={dev.id} value={dev.id}>
                            {dev.name || dev.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </FieldGroup>
            </div>
          )}

          {isEditing && (
            <div>
              <div className="my-3 flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                  Change Password
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleTogglePasswordEdit}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPasswordEditing ? "ยกเลิก" : "แก้ไขรหัสผ่าน"}
                  </TooltipContent>
                </Tooltip>
                <Separator className="flex-1" />
              </div>

              {isPasswordEditing && (
                <FieldGroup>
                  {isOwnProfile && !canEditRole && (
                    <Field>
                      <Label htmlFor="user-current-password">
                        Current Password
                      </Label>
                      <Input
                        id="user-current-password"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        onChange={handleInputChange}
                      />
                    </Field>
                  )}

                  <Field>
                    <Label htmlFor="user-new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="user-new-password"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        onChange={handleInputChange}
                        disabled={isSeoDevView && !isOwnProfile}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={isSeoDevView && !isOwnProfile}
                        className="absolute top-1/2 right-1 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </Field>

                  <Field>
                    <Label htmlFor="user-confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="user-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      onChange={handleInputChange}
                      disabled={isSeoDevView && !isOwnProfile}
                    />
                  </Field>

                  <Button
                    type="button"
                    onClick={onSavePassword}
                    disabled={
                      !currentUser.newPassword ||
                      !currentUser.confirmPassword ||
                      (isOwnProfile &&
                        !canEditRole &&
                        !currentUser.currentPassword)
                    }
                    className="w-full bg-info text-info-foreground hover:bg-info/90"
                    size="lg"
                  >
                    Save Password
                  </Button>
                </FieldGroup>
              )}
            </div>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" size="lg" onClick={handleCloseModal}>
            ยกเลิก
          </Button>
          <Button
            size="lg"
            onClick={onSave}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างผู้ใช้งาน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
