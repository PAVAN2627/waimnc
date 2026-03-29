import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  createProject,
  deleteProject,
  subscribeToAllProjects,
  toggleProjectStatus,
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
  const [isSaving, setIsSaving] = useState(false);
  const [editingProgress, setEditingProgress] = useState<{
    id: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToAllProjects(setProjects);
    return () => unsubscribe();
  }, []);

  const addProject = async () => {
    if (!newTitleMr.trim()) return;
    try {
      setIsSaving(true);
      await createProject({
        titleMr: newTitleMr,
        titleEn: newTitleEn,
        descMr: newDescMr,
        descEn: newDescEn,
        progress: Number(newProgress) || 0,
        iconName: newIcon,
      });
      setNewTitleMr("");
      setNewTitleEn("");
      setNewDescMr("");
      setNewDescEn("");
      setNewProgress("0");
      setNewIcon("Building2");
      toast({
        title: t("यशस्वी", "Success"),
        description: t("प्रकल्प जतन केला.", "Project saved."),
      });
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
    try {
      await deleteProject(id);
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
      await toggleProjectStatus(project.id, next);
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
    try {
      await updateProject(id, {
        progress: Math.min(100, Math.max(0, Number(editingProgress.value) || 0)),
      });
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {t("प्रकल्प व्यवस्थापन", "Project Management")}
      </h1>

      {!isFirebaseConfigured && (
        <p className="text-sm text-muted-foreground">
          {t(
            "प्रकल्प दाखवण्यासाठी Firebase configure करा.",
            "Configure Firebase to manage projects."
          )}
        </p>
      )}

      {/* Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {t("नवीन प्रकल्प जोडा", "Add New Project")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t("प्रकल्प नाव (मराठी) *", "Project Name (Marathi) *")}</span>
                <AutoTranslateButton sourceValue={newTitleEn} onTranslated={(v) => setNewTitleMr(v)} />
              </div>
              <Input placeholder={t("प्रकल्प नाव (मराठी) *", "Project Name (Marathi) *")} value={newTitleMr} onChange={(e) => setNewTitleMr(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Project Name (English)</label>
              <Input placeholder="Project Name (English)" value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t("वर्णन (मराठी)", "Description (Marathi)")}</span>
                <AutoTranslateButton sourceValue={newDescEn} onTranslated={(v) => setNewDescMr(v)} />
              </div>
              <Input placeholder={t("वर्णन (मराठी)", "Description (Marathi)")} value={newDescMr} onChange={(e) => setNewDescMr(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Description (English)</label>
              <Input placeholder="Description (English)" value={newDescEn} onChange={(e) => setNewDescEn(e.target.value)} />
            </div>
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
          <Button
            onClick={addProject}
            disabled={isSaving || !isFirebaseConfigured || !newTitleMr.trim()}
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {t("जोडा", "Add")}
          </Button>
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
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
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
