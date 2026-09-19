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
    <div className="max-w-xl space-y-8 font-mono">
      <p className="font-mono text-base font-medium text-muted">$ submit --skill</p>
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">Submit a skill</h1>
      <form
        className="space-y-6"
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
        <div><label htmlFor="name" className="font-mono text-base font-medium text-foreground">name</label><Input id="name" {...register("name")} />{errors.name && <p className="mt-1 font-mono text-base font-medium text-danger">{errors.name.message}</p>}</div>
        <div><label htmlFor="shortDescription" className="font-mono text-base font-medium text-foreground">short-description</label><Input id="shortDescription" {...register("shortDescription")} />{errors.shortDescription && <p className="mt-1 font-mono text-base font-medium text-danger">{errors.shortDescription.message}</p>}</div>
        <div><label htmlFor="repositoryUrl" className="font-mono text-base font-medium text-foreground">repository-url</label><Input id="repositoryUrl" placeholder="https://github.com/owner/repo" {...register("repositoryUrl")} />{errors.repositoryUrl && <p className="mt-1 font-mono text-base font-medium text-danger">{errors.repositoryUrl.message}</p>}</div>
        <div><label htmlFor="installCommand" className="font-mono text-base font-medium text-foreground">install-command</label><Input id="installCommand" placeholder="npx skills add my-skill" {...register("installCommand")} />{errors.installCommand && <p className="mt-1 font-mono text-base font-medium text-danger">{errors.installCommand.message}</p>}</div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "$ submitting…" : "$ submit --review"}</Button>
        {status && <p role="status" className="font-mono text-base font-medium text-muted">{status}</p>}
      </form>
    </div>
  );
}
