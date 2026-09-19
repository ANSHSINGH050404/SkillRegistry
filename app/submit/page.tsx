"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema, type SubmissionInput } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SubmitPage() {
  const [status, setStatus] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmissionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: { technologies: [], categories: [], agents: [], tags: [] },
  });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Submit a Skill</h1>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (data) => {
          setStatus(null);
          const res = await fetch("/api/submissions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...data, technologies: String(data.technologies).split(",").map((s) => s.trim()).filter(Boolean) }),
          });
          setStatus(res.ok ? "Submitted for review." : "Submission failed. Check fields and try again.");
        })}
      >
        <div><label htmlFor="name" className="text-sm font-medium">Skill Name</label><Input id="name" {...register("name")} />{errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}</div>
        <div><label htmlFor="shortDescription" className="text-sm font-medium">Short Description</label><Input id="shortDescription" {...register("shortDescription")} />{errors.shortDescription && <p className="text-sm text-red-600">{errors.shortDescription.message}</p>}</div>
        <div><label htmlFor="repositoryUrl" className="text-sm font-medium">Repository URL</label><Input id="repositoryUrl" placeholder="https://github.com/owner/repo" {...register("repositoryUrl")} />{errors.repositoryUrl && <p className="text-sm text-red-600">{errors.repositoryUrl.message}</p>}</div>
        <div><label htmlFor="installCommand" className="text-sm font-medium">Install Command</label><Input id="installCommand" placeholder="npx skills add my-skill" {...register("installCommand")} />{errors.installCommand && <p className="text-sm text-red-600">{errors.installCommand.message}</p>}</div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit for review"}</Button>
        {status && <p role="status" className="text-sm">{status}</p>}
      </form>
    </div>
  );
}
