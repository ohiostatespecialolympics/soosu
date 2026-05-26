import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, FileText } from "lucide-react";
import { CONTENT_DEFS, CONTENT_PAGES, ContentDef } from "@/lib/contentKeys";
import { refreshContent } from "@/hooks/useContent";

export default function ContentEditor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [activePage, setActivePage] = useState<string>(CONTENT_PAGES[0]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("content_blocks").select("key,value");
    const dbMap: Record<string, string> = {};
    (data || []).forEach((r: any) => { dbMap[r.key] = r.value ?? ""; });
    const next: Record<string, string> = {};
    CONTENT_DEFS.forEach(d => { next[d.key] = dbMap[d.key] ?? d.fallback; });
    setValues(next);
    setDirty({});
    setLoading(false);
  };

  const handleChange = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }));
    setDirty(d => ({ ...d, [key]: true }));
  };

  const handleSave = async (def: ContentDef) => {
    setSaving(def.key);
    const { error } = await supabase.from("content_blocks").upsert({
      key: def.key,
      page: def.page,
      label: def.label,
      value: values[def.key] ?? "",
      type: def.type === "longtext" ? "longtext" : "text",
    }, { onConflict: "key" });
    setSaving(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setDirty(d => ({ ...d, [def.key]: false }));
    refreshContent();
    toast({ title: "Saved", description: def.label });
  };

  const handleReset = (def: ContentDef) => {
    setValues(v => ({ ...v, [def.key]: def.fallback }));
    setDirty(d => ({ ...d, [def.key]: true }));
  };

  const pageDefs = useMemo(() => CONTENT_DEFS.filter(d => d.page === activePage), [activePage]);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Site Content</h2>
        <p className="text-xs text-muted-foreground">Edit copy that appears on the public website. Changes go live immediately after saving.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {CONTENT_PAGES.map(p => (
          <button
            key={p}
            onClick={() => setActivePage(p)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activePage === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {pageDefs.map(def => {
          const isLong = def.type === "longtext";
          const isDirty = !!dirty[def.key];
          return (
            <Card key={def.key} className={isDirty ? "border-primary/40" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span>{def.label}</span>
                  <code className="text-[10px] text-muted-foreground font-normal">{def.key}</code>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLong ? (
                  <Textarea
                    value={values[def.key] ?? ""}
                    onChange={e => handleChange(def.key, e.target.value)}
                    rows={Math.min(8, Math.max(3, (values[def.key] || "").split("\n").length + 1))}
                    className="font-montserrat text-sm"
                  />
                ) : (
                  <Input
                    value={values[def.key] ?? ""}
                    onChange={e => handleChange(def.key, e.target.value)}
                  />
                )}
                <div className="flex items-center gap-2 justify-end">
                  <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleReset(def)}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Reset to default
                  </Button>
                  <Button type="button" size="sm" className="h-7 text-xs" disabled={!isDirty || saving === def.key} onClick={() => handleSave(def)}>
                    {saving === def.key ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}