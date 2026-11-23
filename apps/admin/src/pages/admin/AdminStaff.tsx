import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  Mail,
  Key,
  Building2,
  CheckCircle2,
  X,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Edit2,
  Search,
  Check,
  Layers,
  History,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  fetchStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  type AdminUser,
  type CreateStaffPayload,
} from "@/lib/api";

export const MUNICIPAL_DEPARTMENTS = [
  { value: "पाणी पुरवठा विभाग", labelMr: "पाणी पुरवठा विभाग", labelEn: "Water Supply Dept." },
  { value: "आरोग्य व स्वच्छता विभाग", labelMr: "आरोग्य व स्वच्छता विभाग", labelEn: "Health & Sanitation Dept." },
  { value: "रस्ते व बांधकाम विभाग", labelMr: "रस्ते व बांधकाम विभाग", labelEn: "Roads & Civil Works Dept." },
  { value: "दिवाबत्ती व विद्युत विभाग", labelMr: "दिवाबत्ती व विद्युत विभाग", labelEn: "Street Lights & Electrical" },
  { value: "सांडपाणी व गटार व्यवस्था", labelMr: "सांडपाणी व गटार व्यवस्था", labelEn: "Drainage & Sewerage Dept." },
  { value: "कर व मूल्यांकन विभाग", labelMr: "कर व मूल्यांकन विभाग", labelEn: "Property Tax & Assessment" },
  { value: "लोकसेवा हक्क व दाखले कक्ष", labelMr: "लोकसेवा हक्क व दाखले कक्ष", labelEn: "Public Service & Certificates" },
  { value: "जन्म-मृत्यू नोंदणी विभाग", labelMr: "जन्म-मृत्यू नोंदणी विभाग", labelEn: "Birth & Death Registration" },
  { value: "अतिक्रमण निर्मूलन विभाग", labelMr: "अतिक्रमण निर्मूलन विभाग", labelEn: "Encroachment Removal Dept." },
  { value: "नगररचना विभाग", labelMr: "नगररचना विभाग", labelEn: "Town Planning Dept." },
  { value: "अग्निशमन विभाग", labelMr: "अग्निशमन विभाग", labelEn: "Fire & Emergency Services" },
  { value: "सामान्य प्रशासन", labelMr: "सामान्य प्रशासन", labelEn: "General Administration" },
];

export const MUNICIPAL_APPLICATIONS = [
  // १. नागरी सेवा व दाखले अर्ज (Civil Services & Certificates)
  { value: "जन्म दाखला अर्ज", labelMr: "जन्म दाखला अर्ज", labelEn: "Birth Certificate", category: "service" },
  { value: "मृत्यू दाखला अर्ज", labelMr: "मृत्यू दाखला अर्ज", labelEn: "Death Certificate", category: "service" },
  { value: "विवाह नोंदणी दाखला", labelMr: "विवाह नोंदणी दाखला", labelEn: "Marriage Certificate", category: "service" },
  { value: "नवीन पाणी नळ जोडणी", labelMr: "नवीन पाणी नळ जोडणी व बिल सेवा", labelEn: "New Tap Connection & Billing", category: "service" },
  { value: "मालमत्ता कर नोंदणी व फेरफार", labelMr: "मालमत्ता कर नोंदणी व फेरफार", labelEn: "Property Tax & Mutation", category: "service" },
  { value: "बांधकाम परवानगी व नकाशा मंजुरी", labelMr: "बांधकाम परवानगी व नकाशा", labelEn: "Building Permit & Plan", category: "service" },
  { value: "व्यवसाय परवाना अर्ज", labelMr: "व्यवसाय परवाना (Trade License)", labelEn: "Trade License", category: "service" },
  { value: "ना हरकत प्रमाणपत्र (NOC)", labelMr: "ना हरकत प्रमाणपत्र (NOC)", labelEn: "No Objection Certificate", category: "service" },
  { value: "अग्निशमन परवाना (Fire NOC)", labelMr: "अग्निशमन परवाना (Fire NOC)", labelEn: "Fire NOC", category: "service" },
  { value: "रस्ता खोदाई परवानगी अर्ज", labelMr: "रस्ता खोदाई परवानगी", labelEn: "Road Excavation Permit", category: "service" },

  // २. शासकीय व नागरी कल्याण योजना (Government Welfare Schemes & Yojna)
  { value: "प्रधानमंत्री आवास योजना (PMAY)", labelMr: "प्रधानमंत्री आवास योजना (PMAY)", labelEn: "PMAY Housing Scheme", category: "scheme" },
  { value: "स्वच्छ भारत अभियान (शौचालय अनुदान)", labelMr: "स्वच्छ भारत (शौचालय अनुदान)", labelEn: "Swachh Bharat Toilet Scheme", category: "scheme" },
  { value: "अमृत योजना (AMRUT 2.0)", labelMr: "अमृत योजना (AMRUT 2.0)", labelEn: "AMRUT 2.0 Mission", category: "scheme" },
  { value: "संजय गांधी निराधार योजना", labelMr: "संजय गांधी निराधार योजना", labelEn: "Sanjay Gandhi Niradhar Yojna", category: "scheme" },
  { value: "श्रावणबाळ सेवा राज्य निवृत्तीवेतन", labelMr: "श्रावणबाळ सेवा निवृत्तीवेतन", labelEn: "Shravanbal Pension Scheme", category: "scheme" },
  { value: "दिव्यांग कल्याण योजना", labelMr: "दिव्यांग कल्याण योजना", labelEn: "Disability Welfare Scheme", category: "scheme" },
  { value: "महिला व बालकल्याण योजना", labelMr: "महिला व बालकल्याण योजना", labelEn: "Women & Child Welfare Scheme", category: "scheme" },
  { value: "पीएम स्वनिधी योजना (फेरीवाला कर्ज)", labelMr: "पीएम स्वनिधी (फेरीवाला कर्ज)", labelEn: "PM SVANidhi Scheme", category: "scheme" },
];

export default function AdminStaff() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // Add / Edit Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([MUNICIPAL_DEPARTMENTS[0].value]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [role, setRole] = useState<"DEPT_OFFICER" | "SUPER_ADMIN">("DEPT_OFFICER");
  const [accessScope, setAccessScope] = useState<"all" | "complaints" | "applications">("all");

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await fetchStaffUsers();
      setStaffList(data || []);
    } catch (err: any) {
      console.warn("Error fetching staff:", err);
      toast({
        title: t("त्रुटी", "Error"),
        description: err.message || t("कर्मचारी यादी लोड करता आली नाही.", "Failed to load staff list."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedDepts([MUNICIPAL_DEPARTMENTS[0].value]);
    setSelectedApps(MUNICIPAL_APPLICATIONS.map((a) => a.value));
    setRole("DEPT_OFFICER");
    setAccessScope("all");
    setShowAddForm(true);
  };

  const openEditModal = (staff: AdminUser) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setPassword(""); // Leave blank if keeping same

    let depts: string[] = [];
    if (staff.departments && Array.isArray(staff.departments) && staff.departments.length > 0) {
      depts = staff.departments;
    } else if (staff.department) {
      depts = staff.department.split(",").map((d) => d.trim()).filter(Boolean);
    }
    const deptVals = MUNICIPAL_DEPARTMENTS.map((d) => d.value);
    const appVals = MUNICIPAL_APPLICATIONS.map((a) => a.value);

    const matchedDepts = depts.filter((d) => deptVals.includes(d));
    const matchedApps = depts.filter((d) => appVals.includes(d));

    let parsedScope: "all" | "complaints" | "applications" = "all";
    if (staff.accessScope) {
      if (staff.accessScope.startsWith("{")) {
        try {
          const parsed = JSON.parse(staff.accessScope);
          if (Array.isArray(parsed.applications)) {
            parsed.applications.forEach((a: string) => {
              if (!matchedApps.includes(a)) matchedApps.push(a);
            });
          }
          if (parsed.scope) parsedScope = parsed.scope;
        } catch {}
      } else if (staff.accessScope === "complaints" || staff.accessScope === "applications") {
        parsedScope = staff.accessScope;
      }
    }

    setSelectedDepts(matchedDepts.length > 0 ? matchedDepts : [MUNICIPAL_DEPARTMENTS[0].value]);
    setSelectedApps(matchedApps.length > 0 ? matchedApps : MUNICIPAL_APPLICATIONS.map((a) => a.value));
    setRole((staff.role as any) || "DEPT_OFFICER");
    setAccessScope(parsedScope);
    setShowAddForm(true);
  };

  const toggleDept = (val: string) => {
    if (selectedDepts.includes(val)) {
      if (selectedDepts.length === 1) {
        toast({
          title: t("किमान एक विभाग निवडणे आवश्यक आहे", "At least one department is required"),
          variant: "destructive",
        });
        return;
      }
      setSelectedDepts(selectedDepts.filter((d) => d !== val));
    } else {
      setSelectedDepts([...selectedDepts, val]);
    }
  };

  const handleSelectAllDepts = () => {
    setSelectedDepts(MUNICIPAL_DEPARTMENTS.map((d) => d.value));
  };

  const handleClearDepts = () => {
    setSelectedDepts([MUNICIPAL_DEPARTMENTS[0].value]);
  };

  const toggleApp = (val: string) => {
    if (selectedApps.includes(val)) {
      setSelectedApps(selectedApps.filter((a) => a !== val));
    } else {
      setSelectedApps([...selectedApps, val]);
    }
  };

  const handleSelectAllApps = () => {
    setSelectedApps(MUNICIPAL_APPLICATIONS.map((a) => a.value));
  };

  const handleClearApps = () => {
    setSelectedApps([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: t("कृपया सर्व माहिती भरा", "Please fill all required fields"),
        variant: "destructive",
      });
      return;
    }

    if (!editingStaff && (!password || password.trim().length < 6)) {
      toast({
        title: t("पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे", "Password must be at least 6 characters"),
        variant: "destructive",
      });
      return;
    }

    if (role === "DEPT_OFFICER" && selectedDepts.length === 0) {
      toast({
        title: t("कृपया किमान एक विभाग निवडा", "Please select at least one department"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const combinedPermissions = Array.from(new Set([...selectedDepts, ...selectedApps]));
      const effectiveDepts = role === "SUPER_ADMIN" ? [] : combinedPermissions;
      const joinedDept = role === "SUPER_ADMIN" ? "सर्व विभाग (All)" : selectedDepts.join(", ");
      const effectiveScope = role === "SUPER_ADMIN" ? "all" : JSON.stringify({
        scope: accessScope,
        applications: selectedApps,
        departments: selectedDepts,
      });

      if (editingStaff) {
        // UPDATE existing staff
        const updatePayload: any = {
          name: name.trim(),
          department: joinedDept,
          departments: effectiveDepts,
          role,
          accessScope: effectiveScope,
        };
        if (password.trim().length >= 6) {
          updatePayload.password = password.trim();
        }

        const updated = await updateStaffUser(editingStaff.id, updatePayload);
        setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? { ...s, ...updated } : s)));

        toast({
          title: t("अधिकारी माहिती अद्ययावत झाली ✓", "Staff Info Updated ✓"),
          description: t(
            `${name} यांची माहिती यशस्वीरित्या जतन केली.`,
            `Information updated for ${name}.`
          ),
        });
      } else {
        // CREATE new staff
        const payload: CreateStaffPayload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          department: joinedDept,
          departments: effectiveDepts,
          role,
          accessScope: effectiveScope,
        };

        const newUser = await createStaffUser(payload);
        setStaffList((prev) => [newUser, ...prev]);

        toast({
          title: t("अधिकारी खाते तयार झाले ✓", "Staff Account Created ✓"),
          description: t(
            `${name} यांचे ${joinedDept} साठी खाते तयार करण्यात आले आहे.`,
            `Account created for ${name} under ${joinedDept}.`
          ),
        });
      }

      setShowAddForm(false);
      setEditingStaff(null);
    } catch (err: any) {
      toast({
        title: t("क्रिया अयशस्वी", "Action Failed"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff: AdminUser) => {
    const nextStatus = !staff.isActive;
    try {
      await updateStaffUser(staff.id, { isActive: nextStatus });
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, isActive: nextStatus } : s))
      );
      toast({
        title: nextStatus ? t("खाते सक्रिय केले", "Account Activated") : t("खाते निष्क्रिय केले", "Account Deactivated"),
      });
    } catch (err: any) {
      toast({
        title: t("त्रुटी", "Error"),
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (staff: AdminUser) => {
    if (staff.id === currentUser?.id) {
      toast({
        title: t("स्वतःचे खाते हटवता येत नाही.", "Cannot delete your own logged-in account."),
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        t(
          `तुम्हाला खात्री आहे का की "${staff.name}" चे खाते हटवायचे आहे?`,
          `Are you sure you want to delete ${staff.name}?`
        )
      )
    ) {
      return;
    }

    try {
      setDeleting(staff.id);
      await deleteStaffUser(staff.id);
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      toast({
        title: t("खाते हटवले", "Account Deleted"),
        description: t("कर्मचारी खाते यशस्वीरित्या हटवले गेले.", "Staff account successfully removed."),
      });
    } catch (err: any) {
      toast({
        title: t("हटवता आले नाही", "Delete Failed"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.department || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (deptFilter !== "all") {
      const depts = staff.departments || (staff.department ? staff.department.split(",").map((d) => d.trim()) : []);
      if (staff.role === "SUPER_ADMIN") return true;
      return depts.some((d) => d.includes(deptFilter) || deptFilter.includes(d));
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action Controls */}
      <div className="gov-gradient text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Users className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("कर्मचारी रोस्टर व बहु-विभागीय अधिकार व्यवस्थापन", "Employee Roster & Multi-Dept Roles")}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              {t("कर्मचारी रोस्टर व विभाग भूमिका", "Employee Roster & Department Roles")}
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {t(
                "एका अधिकाऱ्याला एकापेक्षा जास्त विभाग (Multiple Departments) सोपवा. प्रत्येक अधिकारी त्यांच्या नेमून दिलेल्या विभागांच्या तक्रारी व अर्ज पाहू आणि अद्ययावत करू शकेल.",
                "Assign multiple municipal departments to a single officer. Department officers can only manage grievances and certificates under their assigned departments."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/logs">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold rounded-xl"
              >
                <History className="w-4 h-4 mr-1.5" />
                {t("ऑडिट लॉग्स पहा", "View Audit Logs")}
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadStaff}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              {t("रिफ्रेश", "Refresh")}
            </Button>

            <Button
              onClick={openAddModal}
              className="bg-white text-primary hover:bg-white/90 font-black rounded-xl shadow-lg px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("नवीन कर्मचारी / अधिकारी जोडा", "Add Employee / Officer")}
            </Button>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      {showAddForm && (
        <Card className="border-primary/40 shadow-2xl rounded-3xl animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden bg-card">
          <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between py-4 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              <span>
                {editingStaff
                  ? t(`अधिकारी संपादन: ${editingStaff.name}`, `Edit Officer: ${editingStaff.name}`)
                  : t("नवीन विभागीय अधिकारी / कर्मचारी नोंदणी", "Register New Department Officer / Employee")}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setEditingStaff(null);
              }}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name, Email, Password */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Officer Name */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground">
                    {t("कर्मचारी / अधिकाऱ्याचे पूर्ण नाव *", "Employee / Officer Full Name *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("उदा. श्री. संजय कदम", "e.g. Mr. Sanjay Kadam")}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground">
                    {t("ईमेल आयडी (लॉगिन साठी) *", "Email ID (For Login) *")}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingStaff}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer.wai@gmail.com"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                  />
                  {editingStaff && (
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      {t("ईमेल आयडी बदलता येत नाही.", "Email cannot be changed.")}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground">
                    {editingStaff
                      ? t("नवीन पासवर्ड (बदलायचा असल्यास)", "New Password (Leave blank to keep same)")
                      : t("पासवर्ड (किमान ६ अक्षरे) *", "Password (Min 6 chars) *")}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingStaff ? t("बदलायचा नसल्यास रिकामा ठेवा", "Leave blank to keep current") : "••••••••"}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Role & Access Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t">
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground">
                    {t("प्रशासकीय भूमिका (Role) *", "Administrative Role *")}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="DEPT_OFFICER">
                      {t("विभागीय अधिकारी / कर्मचारी (Department Officer - Assigned Departments)", "Department Officer")}
                    </option>
                    <option value="SUPER_ADMIN">
                      {t("मुख्य प्रशासक (Super Admin - सर्व अधिकार व विभाग)", "Super Admin - All Access")}
                    </option>
                  </select>
                </div>

                {/* Access Scope */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground">
                    {t("कार्यक्षेत्र अधिकार (Scope) *", "Access Scope *")}
                  </label>
                  <select
                    value={accessScope}
                    onChange={(e) => setAccessScope(e.target.value as any)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">
                      {t("तक्रारी व दाखले अर्ज दोन्ही (Both Complaints & Applications)", "Both Complaints & Applications")}
                    </option>
                    <option value="complaints">
                      {t("फक्त नागरी तक्रारी (Complaints Only)", "Complaints Only")}
                    </option>
                    <option value="applications">
                      {t("फक्त दाखले व सेवा अर्ज (Applications Only)", "Applications Only")}
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 3: MULTI-DEPARTMENT SELECTOR */}
              {role === "DEPT_OFFICER" ? (
                <div className="pt-2 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <label className="block text-xs font-black text-foreground">
                        {t("संबंधित विभाग निवडा (एकापेक्षा जास्त विभाग निवडू शकता) *", "Select Assigned Departments (Multiple Allowed) *")}
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {t(
                          `सध्या ${selectedDepts.length} विभाग निवडले आहेत. या कर्मचाऱ्याला या सर्व विभागांचे कामकाज हाताळता येईल.`,
                          `${selectedDepts.length} department(s) selected.`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllDepts}
                        className="text-xs h-7 rounded-lg"
                      >
                        {t("सर्व निवडा", "Select All")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearDepts}
                        className="text-xs h-7 rounded-lg"
                      >
                        {t("साफ करा", "Clear")}
                      </Button>
                    </div>
                  </div>

                  {/* Grid of Department Checkbox Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 border rounded-2xl bg-muted/20">
                    {MUNICIPAL_DEPARTMENTS.map((dept) => {
                      const isSelected = selectedDepts.includes(dept.value);
                      return (
                        <button
                          key={dept.value}
                          type="button"
                          onClick={() => toggleDept(dept.value)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 text-xs font-bold ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/40 font-black"
                              : "bg-background border-border text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-primary text-white" : "border border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{lang === "mr" ? dept.labelMr : dept.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>
                    {t(
                      "मुख्य प्रशासक (Super Admin) सर्व विभागांच्या तक्रारी, अर्ज, सभा, निविदा व संपूर्ण डेटावर पूर्ण नियंत्रण ठेवू शकतो.",
                      "Super Admin has full access to all departments and administrative functions."
                    )}
                  </span>
                </div>
              )}

              {/* Row 4: APPLICATIONS & GOVERNMENT SCHEMES SELECTOR */}
              {role === "DEPT_OFFICER" && (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-black text-foreground">
                        {t(
                          "दाखले व शासकीय योजना अधिकार (निवडलेले अर्ज पाहण्याची परवानगी) *",
                          "Citizen Applications & Govt. Scheme Permissions *"
                        )}
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {t(
                          `सध्या ${selectedApps.length} अर्ज / योजना निवडल्या आहेत. या कर्मचाऱ्याला या सर्व अर्जांची पडताळणी व मंजुरी करता येईल.`,
                          `${selectedApps.length} application(s)/scheme(s) selected.`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllApps}
                        className="text-xs h-7 rounded-lg"
                      >
                        {t("सर्व निवडा", "Select All")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearApps}
                        className="text-xs h-7 rounded-lg"
                      >
                        {t("साफ करा", "Clear")}
                      </Button>
                    </div>
                  </div>

                  {/* Section A: Civil Services & Certificates */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                      {t("१. नागरी दाखले व सेवा अर्ज (Citizen Certificates & Services)", "1. Citizen Certificates & Services")}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1 border rounded-2xl bg-muted/20">
                      {MUNICIPAL_APPLICATIONS.filter((a) => a.category === "service").map((app) => {
                        const isSelected = selectedApps.includes(app.value);
                        return (
                          <button
                            key={app.value}
                            type="button"
                            onClick={() => toggleApp(app.value)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 text-xs font-bold ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/40 font-black"
                                : "bg-background border-border text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? "bg-primary text-white" : "border border-muted-foreground/30"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="truncate">{lang === "mr" ? app.labelMr : app.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section B: Government Welfare Schemes */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      {t("२. शासकीय व नागरी कल्याण योजना (Govt. Welfare Schemes)", "2. Govt. Welfare Schemes")}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1 border rounded-2xl bg-muted/20">
                      {MUNICIPAL_APPLICATIONS.filter((a) => a.category === "scheme").map((app) => {
                        const isSelected = selectedApps.includes(app.value);
                        return (
                          <button
                            key={app.value}
                            type="button"
                            onClick={() => toggleApp(app.value)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 text-xs font-bold ${
                              isSelected
                                ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/40 font-black"
                                : "bg-background border-border text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? "bg-amber-600 text-white" : "border border-muted-foreground/30"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="truncate">{lang === "mr" ? app.labelMr : app.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStaff(null);
                  }}
                  className="rounded-xl font-bold"
                >
                  {t("रद्द करा", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gov-gradient text-white font-black rounded-xl shadow-lg px-6"
                >
                  {saving
                    ? t("जतन करत आहे...", "Saving...")
                    : editingStaff
                    ? t("अद्ययावत करा (Save Changes)", "Save Changes")
                    : t("अधिकारी खाते तयार करा", "Create Officer Account")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff Roster Table Card */}
      <Card className="rounded-3xl shadow-sm border overflow-hidden">
        <CardHeader className="py-5 px-6 border-b bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>
                {t("कर्मचारी रोस्टर व अधिकारी यादी", "Employee Roster & Staff List")} ({filteredStaff.length})
              </span>
            </CardTitle>

            {/* Filter and Search */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("नाव, ईमेल किंवा विभागाने शोधा...", "Search name, email, department...")}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs border rounded-xl px-3 py-1.5 bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold"
              >
                <option value="all">{t("सर्व विभाग (All Departments)", "All Departments")}</option>
                {MUNICIPAL_DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {lang === "mr" ? dept.labelMr : dept.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold">{t("कर्मचारी रोस्टर लोड करत आहे...", "Loading employee roster...")}</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold">
                {searchQuery || deptFilter !== "all"
                  ? t("कोणतेही अधिकारी सापडले नाहीत.", "No officers found matching filters.")
                  : t("अद्याप कोणतेही अधिकारी जोडलेले नाहीत.", "No officers registered yet.")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredStaff.map((staff) => {
                const isSuper = staff.role === "SUPER_ADMIN";
                const isCurrent = staff.id === currentUser?.id;
                const depts =
                  staff.departments && Array.isArray(staff.departments) && staff.departments.length > 0
                    ? staff.departments
                    : staff.department
                    ? staff.department.split(",").map((d) => d.trim()).filter(Boolean)
                    : [];

                const deptVals = MUNICIPAL_DEPARTMENTS.map((d) => d.value);
                const appVals = MUNICIPAL_APPLICATIONS.map((a) => a.value);

                let assignedApps: string[] = [];
                if (staff.accessScope && staff.accessScope.startsWith("{")) {
                  try {
                    const parsed = JSON.parse(staff.accessScope);
                    if (Array.isArray(parsed.applications)) {
                      assignedApps = parsed.applications;
                    }
                  } catch {}
                }
                depts.forEach((d) => {
                  if (appVals.includes(d) && !assignedApps.includes(d)) {
                    assignedApps.push(d);
                  }
                });

                const displayDepts = depts.filter((d) => deptVals.includes(d) || !appVals.includes(d));

                return (
                  <div
                    key={staff.id}
                    className="p-5 md:p-6 hover:bg-muted/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm md:text-base text-foreground truncate">{staff.name}</span>

                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            {t("मुख्य प्रशासक (Super Admin)", "Super Admin")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                            <Building2 className="w-3 h-3" />
                            {t("विभागीय अधिकारी", "Dept. Officer")}
                          </span>
                        )}

                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            {t("सध्याचे लॉगिन", "Current You")}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            staff.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {staff.isActive !== false ? t("सक्रिय (Active)", "Active") : t("निष्क्रिय (Deactivated)", "Deactivated")}
                        </span>
                      </div>

                      {/* Email & Scope */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          {staff.email}
                        </span>

                        <span className="inline-flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          {t("अधिकार:", "Scope:")}{" "}
                          <strong className="text-foreground">
                            {staff.accessScope === "complaints"
                              ? t("फक्त तक्रारी", "Complaints Only")
                              : staff.accessScope === "applications"
                              ? t("फक्त अर्ज", "Applications Only")
                              : t("सर्व (तक्रारी + अर्ज)", "All (Complaints + Apps)")}
                          </strong>
                        </span>

                        {staff.lastLoginAt && (
                          <span className="text-[11px]">
                            {t("शेवटचे लॉगिन:", "Last login:")}{" "}
                            {new Date(staff.lastLoginAt).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Assigned Departments Pill Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-muted-foreground mr-1">
                          {t("नेमून दिलेले विभाग:", "Assigned Vibhag:")}
                        </span>
                        {isSuper ? (
                          <span className="text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {t("सर्व नागरी विभाग व कारभार", "All Municipal Departments")}
                          </span>
                        ) : displayDepts.length > 0 ? (
                          displayDepts.map((d, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-bold bg-muted px-2.5 py-0.5 rounded-lg border border-border text-foreground"
                            >
                              <Building2 className="w-2.5 h-2.5 text-primary" />
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {t("कोणताही विभाग नाही", "No departments assigned")}
                          </span>
                        )}
                      </div>

                      {/* Assigned Applications & Schemes Pill Badges */}
                      {!isSuper && assignedApps.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] font-bold text-muted-foreground mr-1">
                            {t("नेमून दिलेले अर्ज / योजना:", "Assigned Services & Schemes:")}
                          </span>
                          {assignedApps.map((a, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20"
                            >
                              <FileCheck2 className="w-2.5 h-2.5" />
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0">
                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(staff)}
                        className="rounded-xl text-xs font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" />
                        {t("संपादित करा", "Edit")}
                      </Button>

                      {/* Toggle Active Status */}
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(staff)}
                          className={`rounded-xl text-xs font-bold ${
                            staff.isActive !== false
                              ? "text-amber-600 hover:bg-amber-500/10"
                              : "text-emerald-600 hover:bg-emerald-500/10"
                          }`}
                        >
                          {staff.isActive !== false
                            ? t("निष्क्रिय करा", "Deactivate")
                            : t("सक्रिय करा", "Activate")}
                        </Button>
                      )}

                      {/* Delete */}
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleting === staff.id}
                          onClick={() => handleDelete(staff)}
                          className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {t("हटवा", "Delete")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
