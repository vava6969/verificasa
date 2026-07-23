import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Image as UIImage } from "@/components/ui/image";
import { Camera, Loader2 } from "lucide-react";

export default function AvatarUpload() {
  const { user, checkUserAuth } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      await checkUserAuth();
    } catch (err) {
      // eroare ignorată — butonul revine
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user?.avatar_url ? (
        <UIImage src={user.avatar_url} fittingType="fill" className="h-20 w-20 rounded-full border border-border object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-soft text-emerald">
          <Camera className="h-8 w-8" />
        </div>
      )}
      <div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...</> : <><Camera className="h-4 w-4" /> Schimbă poza</>}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">PNG/JPG. Poza ta va apărea în comentarii și în meniu.</p>
      </div>
    </div>
  );
}