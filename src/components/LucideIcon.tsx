/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Tent,
  Backpack,
  Flame,
  Zap,
  Sparkles,
  Layers,
  Compass,
  Coffee,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  Users,
  Plus,
  Trash2,
  LogOut,
  Menu,
  X,
  CreditCard,
  Shield,
  Eye,
  FileText,
  User,
  History,
  UploadCloud,
  ChevronRight,
  Info
} from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const LucideIcon: React.FC<IconProps> = ({ name, className, size = 20, color }) => {
  const lib: Record<string, React.ComponentType<any>> = {
    Tent,
    Backpack,
    Flame,
    Zap,
    Sparkles,
    Layers,
    Compass,
    Coffee,
    AlertTriangle,
    Clock,
    Calendar,
    CheckCircle,
    HelpCircle,
    TrendingUp,
    DollarSign,
    Package,
    Activity,
    Users,
    Plus,
    Trash2,
    LogOut,
    Menu,
    X,
    CreditCard,
    Shield,
    Eye,
    FileText,
    User,
    History,
    UploadCloud,
    ChevronRight,
    Info
  };

  const Component = lib[name] || HelpCircle;
  return <Component className={className} size={size} color={color} style={{ flexShrink: 0 }} />;
};
export default LucideIcon;
