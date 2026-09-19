"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema, parseCommaList, type SubmissionInput } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Array fields render as comma-separated text inputs; converted on submit.
// `website` is a honeypot (humans never fill it); sent through for the server check.
type FormValues = Omit<SubmissionInput, "technologies" | "categories" | "agents" | "tags"> & {
  technologies: string;
  categories: string;
  agents: string;
  tags: string;
  website?: string;
};

const err = "mt-1 font-mono text-base font-medium text-danger";
const label = "font-mono text-base font-medium text-foreground";
const hint = "mt-1 font-mono text-xs font-medium text-muted";

export default function SubmitPage() {
  const [status, setStatus] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: { technologies: "", categories: "", agents: "", tags: "" },
  });

  return (
    <div className="max-w-xl space-y-8 font-mono">
      <p className="font-mono text-base font-medium text-muted">$ submit --skill</p>
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">Submit a skill</h1>
      <form
        className="space-y-6"
        onSubmit={handleSubmit(async (data) => {
          setStatus(null);
          const payload: SubmissionInput = {
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            repositoryUrl: data.repositoryUrl,
            homepageUrl: data.homepageUrl,
            installCommand: data.installCommand,
            author: data.author,
            technologies: parseCommaList(data.technologies),
            categories: parseCommaList(data.categories),
            agents: parseCommaList(data.agents),
            tags: parseCommaList(data.tags),
          };
          const check = submissionSchema.safeParse(payload);
          if (!check.success) {
            setStatus("Submission failed. Check fields and try again.");
            return;
          }
          const res = await fetch("/api/submissions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...check.data, website: data.website ?? "" }),
          });
          setStatus(res.ok ? "Submitted for review." : "Submission failed. Check fields and try again.");
        })}
      >
        <div><label htmlFor="name" className={label}>name</label><Input id="name" {...register("name")} />{errors.name && <p className={err}>{errors.name.message}</p>}</div>
        <div><label htmlFor="shortDescription" className={label}>short-description</label><Input id="shortDescription" {...register("shortDescription")} />{errors.shortDescription && <p className={err}>{errors.shortDescription.message}</p>}</div>
        <div>
          <label htmlFor="description" className={label}>description</label>
          <Textarea id="description" rows={6} placeholder="What does this skill do? (min 20 characters)" {...register("description")} />
          {errors.description && <p className={err}>{errors.description.message}</p>}
        </div>
        <div><label htmlFor="repositoryUrl" className={label}>repository-url</label><Input id="repositoryUrl" placeholder="https://github.com/owner/repo" {...register("repositoryUrl")} />{errors.repositoryUrl && <p className={err}>{errors.repositoryUrl.message}</p>}</div>
        <div><label htmlFor="homepageUrl" className={label}>homepage-url (optional)</label><Input id="homepageUrl" placeholder="https://…" {...register("homepageUrl")} />{errors.homepageUrl && <p className={err}>{errors.homepageUrl.message}</p>}</div>
        <div><label htmlFor="installCommand" className={label}>install-command</label><Input id="installCommand" placeholder="npx skills add my-skill" {...register("installCommand")} />{errors.installCommand && <p className={err}>{errors.installCommand.message}</p>}</div>
        <div><label htmlFor="author" className={label}>author (optional)</label><Input id="author" placeholder="@you" {...register("author")} />{errors.author && <p className={err}>{errors.author.message}</p>}</div>
        <div>
          <label htmlFor="technologies" className={label}>technologies</label>
          <Input id="technologies" placeholder="Prisma, PostgreSQL, Next.js" {...register("technologies")} />
          <p className={hint}>comma-separated, max 12</p>
        </div>
        <div>
          <label htmlFor="categories" className={label}>categories</label>
          <Input id="categories" placeholder="Database, ORM" {...register("categories")} />
          <p className={hint}>comma-separated, max 8</p>
        </div>
        <div>
          <label htmlFor="agents" className={label}>agents</label>
          <Input id="agents" placeholder="Claude Code, OpenCode" {...register("agents")} />
          <p className={hint}>comma-separated, max 12</p>
        </div>
        <div>
          <label htmlFor="tags" className={label}>tags</label>
          <Input id="tags" placeholder="orm, typescript" {...register("tags")} />
          <p className={hint}>comma-separated, max 16</p>
        </div>
        {/* Honeypot: humans never fill this; bots do. Checked server-side. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="website">website</label>
          <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "$ submitting…" : "$ submit --review"}</Button>
        {status && <p role="status" className="font-mono text-base font-medium text-muted">{status}</p>}
      </form>
    </div>
  );
}
