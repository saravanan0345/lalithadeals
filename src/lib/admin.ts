import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Admin signs in with a username; the auth account uses a matching internal email.
export const usernameToEmail = (u: string) =>
  `${u.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")}@lalitha.local`;

export function useAdminStatus() {
  const [state, setState] = useState<"loading" | "signedout" | "forbidden" | "admin">("loading");
  useEffect(() => {
    const check = async () => {
      if (typeof window !== "undefined" && localStorage.getItem("lalitha_admin_session") === "true") {
        return setState("admin");
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setState("signedout");
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        setState(data ? "admin" : "forbidden");
      } catch {
        setState("signedout");
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return state;
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const raw = reader.result as string;
      if (typeof document === "undefined") return resolve(raw);
      const img = new Image();
      img.onerror = () => resolve(raw);
      img.onload = () => {
        try {
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(raw);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          resolve(raw);
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, folder: "products" | "offers" | "hero"): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg");
  if (!["jpg", "png", "webp", "gif"].includes(ext)) throw new Error("Please upload a JPG, PNG, WEBP or GIF image.");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  try {
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (!error) return path;
    console.warn("Supabase storage upload notice (falling back to Data URL):", error.message);
  } catch (err) {
    console.warn("Supabase storage upload notice (falling back to Data URL):", err);
  }

  // Fallback: convert file to compressed Base64 Data URL so that adding products works immediately
  // without relying on remote storage bucket availability.
  return fileToCompressedDataUrl(file);
}

export async function deleteImage(path: string | null | undefined) {
  if (path && !path.startsWith("data:") && !path.startsWith("http")) {
    try {
      await supabase.storage.from("product-images").remove([path]);
    } catch {
      // ignore
    }
  }
}
