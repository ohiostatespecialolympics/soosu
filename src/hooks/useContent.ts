import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContentMap = Record<string, string>;

let cache: ContentMap | null = null;
let inflight: Promise<ContentMap> | null = null;
const listeners = new Set<(m: ContentMap) => void>();

async function loadContent(): Promise<ContentMap> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.from("content_blocks").select("key,value");
    const map: ContentMap = {};
    (data || []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
    cache = map;
    listeners.forEach(l => l(map));
    return map;
  })();
  return inflight;
}

export function refreshContent() {
  cache = null;
  inflight = null;
  loadContent();
}

/** Read a content value with a hardcoded fallback. Re-renders when content refreshes. */
export function useContent(key: string, fallback: string): string {
  const [val, setVal] = useState<string>(() => cache?.[key] ?? fallback);

  useEffect(() => {
    let mounted = true;
    const listener = (m: ContentMap) => {
      if (!mounted) return;
      setVal(m[key] ?? fallback);
    };
    listeners.add(listener);
    loadContent().then(m => { if (mounted) setVal(m[key] ?? fallback); });
    return () => { mounted = false; listeners.delete(listener); };
  }, [key, fallback]);

  return val;
}