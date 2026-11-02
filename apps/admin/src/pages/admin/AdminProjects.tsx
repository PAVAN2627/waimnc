import { useEffect, useState, useRef } from "react";
import {
  Building2,
  Droplets,
  FolderOpen,
  Hammer,
  Leaf,
  Lightbulb,
  LoaderCircle,
  Plus,
  Trash2,
  Zap,
  Pencil,
  X,
  FileText,
  Upload,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { uploadMedia } from "@/lib/api";
import {
  createProject,
  deleteProject,
  subscribeToAllProjects,
  setProjectStatus,
  updateProject,
  type ProjectRecord,
} from "@/lib/projects";

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Droplets,
  Leaf,
  Lightbulb,
  Hammer,
  Zap,
  FolderOpen,
};

const iconOptions = Object.keys(iconMap);

const AdminProjects = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [newTitleMr, setNewTitleMr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newDescMr, setNewDescMr] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newProgress, setNewProgress] = useState("0");
  const [newIcon, setNewIcon] = useState("Building2");
  const [docUrl, setDocUrl] = useState("");
  const [docName, setDocName] = useState("");
  const [docMode, setDocMode] = useState<"file" | "drive">("file");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docFileRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProgress, setEditingProgress] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: t("फाईल खूप मोठी आहे", "File too large"),
        description: t("कमाल आकार २० MB पर्यंत असावा.", "Max size 20 MB."),
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUploadingDoc(true);
      const res = await uploadMedia(file, "general");
      setDocUrl(res.viewUrl || res.url);
      setDocName(file.name);
      toast({
        title: t("प्रकल्प PDF यशस्वीरित्या अपलोड झाले ✓", "Project PDF uploaded ✓"),
      });
    } catch (err: any) {
      toast({
        title: t("अपलोड अयशस्वी", "Upload Failed"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAllProjects(setProjects);
    return () => unsubscribe();
  }, []);

  const startEdit = (project: ProjectRecord) => {
    setEditingId(project.id);
    setNewTitleMr(project.titleMr);
    setNewTitleEn(project.titleEn || "");
    setNewDescMr(project.descMr || "");
    setNewDescEn(project.descEn || "");
    setNewProgress(String(project.progress));
    setNewIcon(project.iconName || "Building2");
    setDocUrl(project.documentUrl || "");
    setDocName(project.documentName || "");
    if (project.documentUrl && (project.documentUrl.includes("drive.google.com") || project.documentUrl.includes("docs.google.com"))) {
      setDocMode("drive");
    } else {
      setDocMode("file");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTitleMr("");
    setNewTitleEn("");
    setNewDescMr("");
    setNewDescEn("");
    setNewProgress("0");
    setNewIcon("Building2");
    setDocUrl("");
    setDocName("");
  };

  const saveProject = async () => {
    if (!newTitleMr.trim()) return;
    try {
      setIsSaving(true);
      if (editingId) {
        await updateProject(editingId, {
          titleMr: newTitleMr.trim(),
          titleEn: newTitleEn.trim() || undefined,
          descMr: newDescMr.trim() || undefined,
          descEn: newDescEn.trim() || undefined,
          progress: Number(newProgress) || 0,
          iconName: newIcon,
          documentUrl: docUrl.trim() || undefined,
          documentName: docName.trim() || undefined,
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  titleMr: newTitleMr.trim(),
                  titleEn: newTitleEn.trim(),
                  descMr: newDescMr.trim(),
                  descEn: newDescEn.trim(),
                  progress: Number(newProgress) || 0,
                  iconName: newIcon,
                  documentUrl: docUrl.trim() || undefined,
                  documentName: docName.trim() || undefined,
                }
              : p
          )
        );
        toast({
          title: t("यशस्वी", "Success"),
          description: t("प्रकल्प अद्यतनित केला.", "Project updated."),
        });
        cancelEdit();
      } else {
        const created = await createProject({
          titleMr: newTitleMr.trim(),
          titleEn: newTitleEn.trim(),
          descMr: newDescMr.trim(),
          descEn: newDescEn.trim(),
          progress: Number(newProgress) || 0,
          iconName: newIcon,
          documentUrl: docUrl.trim() || undefined,
          documentName: docName.trim() || undefined,
        });
        setProjects((prev) => [created, ...prev]);
        toast({
          title: t("यशस्वी", "Success"),
          description: t("प्रकल्प जतन केला.", "Project saved."),
        });
        cancelEdit();
      }
    } catch (error) {
      toast({
        title: t("त्रुटी", "Error"),
        description:
          error instanceof Error
            ? error.message
            : t("प्रकल्प जतन करता आला नाही.", "Failed to save."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हा प्रकल्प हटवायचा आहे का?", "Delete this project?"))) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) cancelEdit();
      toast({
        title: t("हटवले", "Deleted"),
        description: t("प्रकल्प हटवला.", "Project deleted."),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("हटवता आले नाही.", "Failed to delete."),
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (project: ProjectRecord) => {
    const next = project.status === "active" ? "inactive" : "active";
    try {
      await setProjectStatus(project.id, next);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: next } : p))
      );
      toast({
        title: next === "active" ? t("प्रकल्प सक्रिय केला", "Project activated") : t("प्रकल्प निष्क्रिय केला", "Project deactivated"),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("स्थिती बदलता आली नाही.", "Failed to update status."),
        variant: "destructive",
      });
    }
  };

  const saveProgress = async (id: string) => {
    if (!editingProgress) return;
    const val = Math.min(100, Math.max(0, Number(editingProgress.value) || 0));
    try {
      await updateProject(id, { progress: val });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, progress: val } : p))
      );
      setEditingProgress(null);
      toast({
        title: t("यशस्वी", "Success"),
        description: t("प्रगती अद्यतनित केली.", "Progress updated."),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("प्रगती बदलता आली नाही.", "Failed to update."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 font-devanagari">
      
      {/* Hero Banner Header */}
      <div className="gov-gradient rounded-3xl p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
              <FolderOpen className="w-3.5 h-3.5" />
              {t("नगरपालिका विकास कामे", "Infrastructure & Urban Projects")}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white">{t("प्रकल्प व्यवस्थापन", "Project Management")}</h1>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1">
              {t("शहरातील चालू व प्रस्तावित विकास प्रकल्पांची प्रगती, निधी आणि स्थिती अपडेट करा.", "Monitor, edit progress percentages, and manage city development projects.")}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            🏗️
          </div>
        </div>
      </div>

      

      {/* Add / Edit Form */}
      <Card className={editingId ? "border-primary ring-2 ring-primary" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {editingId ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingId ? t("प्रकल्प संपादित करा", "Edit Project") : t("नवीन प्रकल्प जोडा", "Add New Project")}
            </span>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" />
                {t("रद्द करा", "Cancel")}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">English</p>
            <Input placeholder="Project Name (English)" value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} />
            <Input placeholder="Description (English)" value={newDescEn} onChange={(e) => setNewDescEn(e.target.value)} />
          </div>
          <AutoTranslateButton fields={[
            { value: newTitleEn, onTranslated: (v) => setNewTitleMr(v) },
            { value: newDescEn, onTranslated: (v) => setNewDescMr(v) },
          ]} />
          <div className="grid md:grid-cols-2 gap-3">
            <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">मराठी</p>
            <Input placeholder={t("प्रकल्प नाव (मराठी) *", "Project Name (Marathi) *")} value={newTitleMr} onChange={(e) => setNewTitleMr(e.target.value)} />
            <Input placeholder={t("वर्णन (मराठी)", "Description (Marathi)")} value={newDescMr} onChange={(e) => setNewDescMr(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {t("प्रगती % (0-100)", "Progress % (0-100)")}
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {t("आयकॉन", "Icon")}
              </label>
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Report Document (PDF or Drive Link) */}
          <div className="border border-border/80 rounded-xl p-3.5 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                {t("प्रकल्प अहवाल (DPR / Document)", "Project DPR / Document")}
                <span className="text-muted-foreground font-normal text-[11px]">({t("ऐच्छिक", "Optional")})</span>
              </label>

              {/* Mode Toggle Buttons */}
              <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border/60">
                <button
                  type="button"
                  onClick={() => setDocMode("file")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    docMode === "file"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  {t("PDF फाईल", "PDF File")}
                </button>
                <button
                  type="button"
                  onClick={() => setDocMode("drive")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    docMode === "drive"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  {t("गुगल ड्राईव्ह लिंक", "Drive Link")}
                </button>
              </div>
            </div>

            {docMode === "file" ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={docFileRef}
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleDocFileUpload}
                />
                {docUrl && !docUrl.includes("drive.google.com") && !docUrl.includes("docs.google.com") ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium truncate">{docName || "Project_Report.pdf"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {t("पहा", "View")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDocUrl("");
                          setDocName("");
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => docFileRef.current?.click()}
                    disabled={isUploadingDoc}
                    className="w-full border-dashed border-2 py-5 text-xs text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-2"
                  >
                    {isUploadingDoc ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
                        {t("PDF अपलोड होत आहे...", "Uploading PDF...")}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {t("प्रकल्प अहवाल PDF फाईल निवडा (कमाल २० MB)", "Choose Project Report PDF (Max 20 MB)")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder={t(
                    "गुगल ड्राईव्ह किंवा डॉक्युमेंट लिंक पेस्ट करा (https://drive.google.com/...)",
                    "Paste Google Drive or document link (https://drive.google.com/...)"
                  )}
                  value={docUrl}
                  onChange={(e) => {
                    setDocUrl(e.target.value);
                    if (!docName) setDocName("गुगल ड्राईव्ह अहवाल");
                  }}
                  className="text-xs"
                />
                <Input
                  type="text"
                  placeholder={t("दस्तऐवजाचे नाव / शीर्षक (उदा. सविस्तर प्रकल्प अहवाल)", "Document title (e.g. Detailed Project Report)")}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={saveProject}
              disabled={isSaving || !newTitleMr.trim()}
              className="gov-gradient text-primary-foreground"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : editingId ? (
                <Pencil className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {editingId ? t("अद्यतन करा", "Update") : t("जोडा", "Add")}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={cancelEdit}>
                {t("रद्द करा", "Cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            {t("सर्व प्रकल्प", "All Projects")} ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("कोणतेही प्रकल्प नाहीत.", "No projects yet.")}
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const Icon = iconMap[project.iconName] ?? Building2;
                return (
                  <div key={project.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {lang === "mr" ? project.titleMr : project.titleEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lang === "mr" ? project.descMr : project.descEn}
                          </p>
                          {project.documentUrl && (
                            <div className="mt-1.5">
                              <a
                                href={project.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
                              >
                                <FileText className="h-3.5 w-3.5 text-red-600" />
                                {project.documentName || t("प्रकल्प अहवाल / DPR", "Project Report / DPR")}
                                <ExternalLink className="h-3 w-3 opacity-70" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {project.progress >= 100 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {t("पूर्ण (१००%)", "Completed (100%)")}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            project.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {project.status === "active"
                            ? t("सक्रिय", "Active")
                            : t("निष्क्रिय", "Inactive")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="gov-gradient h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {project.progress}% {t("पूर्ण", "Complete")}
                        </p>
                      </div>
                      {editingProgress?.id === project.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 h-8 text-xs"
                            value={editingProgress.value}
                            onChange={(e) =>
                              setEditingProgress({
                                id: project.id,
                                value: e.target.value,
                              })
                            }
                          />
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => saveProgress(project.id)}
                          >
                            {t("जतन", "Save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => setEditingProgress(null)}
                          >
                            {t("रद्द", "Cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() =>
                            setEditingProgress({
                              id: project.id,
                              value: String(project.progress),
                            })
                          }
                        >
                          {t("% संपादित करा", "Edit %")}
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleToggle(project)}>
                        {project.status === "active"
                          ? t("निष्क्रिय करा", "Deactivate")
                          : t("सक्रिय करा", "Activate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(project)}
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
};

export default AdminProjects;
