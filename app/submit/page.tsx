"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema, type SubmissionInput } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/forms/combobox";
import { useState, useEffect } from "react";

// Array fields as string arrays; converted to comma-separated for API.
type FormValues = Omit<SubmissionInput, "technologies" | "categories" | "agents" | "tags"> & {
  technologies: string[];
  categories: string[];
  agents: string[];
  tags: string[];
  website?: string;
};

const err = "mt-1 font-mono text-base font-medium text-danger";
const label = "font-mono text-base font-medium text-foreground";

export default function SubmitPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    technologies: { value: string; label: string }[];
    categories: { value: string; label: string }[];
    agents: { value: string; label: string }[];
    tags: { value: string; label: string }[];
  }>({
    technologies: [],
    categories: [],
    agents: [],
    tags: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: { technologies: [], categories: [], agents: [], tags: [] },
  });

  // Fetch options on mount
  useEffect(() => {
    fetch("/api/options")
      .then((res) => res.json())
      .then((data) => {
        setOptions({
          technologies: data.technologies || [],
          categories: data.categories || [],
          agents: data.agents || [],
          tags: data.tags || [],
        });
      })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  const technologies = watch("technologies");
  const categories = watch("categories");
  const agents = watch("agents");
  const tags = watch("tags");

  const handleSubmitForm = handleSubmit(async (data) => {
    setStatus(null);
    const payload: SubmissionInput = {
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      homepageUrl: data.homepageUrl,
      installCommand: data.installCommand,
      author: data.author,
      technologies: data.technologies,
      categories: data.categories,
      agents: data.agents,
      tags: data.tags,
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
  });

  return (
    <div className="max-w-xl space-y-8 font-mono">
      <p className="font-mono text-base font-medium text-muted">$ submit --skill</p>
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">Submit a skill</h1>
      <form
        className="space-y-6"
        onSubmit={handleSubmitForm}
      >
        <div>
          <label htmlFor="name" className={label}>name</label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="shortDescription" className={label}>short-description</label>
          <Input id="shortDescription" {...register("shortDescription")} />
          {errors.shortDescription && <p className={err}>{errors.shortDescription.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className={label}>description</label>
          <Textarea
            id="description"
            rows={6}
            placeholder="What does this skill do? (min 20 characters)"
            {...register("description")}
          />
          {errors.description && <p className={err}>{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="repositoryUrl" className={label}>repository-url</label>
          <Input
            id="repositoryUrl"
            placeholder="https://github.com/owner/repo"
            {...register("repositoryUrl")}
          />
          {errors.repositoryUrl && <p className={err}>{errors.repositoryUrl.message}</p>}
        </div>

        <div>
          <label htmlFor="homepageUrl" className={label}>homepage-url (optional)</label>
          <Input id="homepageUrl" placeholder="https://…" {...register("homepageUrl")} />
          {errors.homepageUrl && <p className={err}>{errors.homepageUrl.message}</p>}
        </div>

        <div>
          <label htmlFor="installCommand" className={label}>install-command</label>
          <Input
            id="installCommand"
            placeholder="npx skills add my-skill"
            {...register("installCommand")}
          />
          {errors.installCommand && <p className={err}>{errors.installCommand.message}</p>}
        </div>

        <div>
          <label htmlFor="author" className={label}>author (optional)</label>
          <Input id="author" placeholder="@you" {...register("author")} />
          {errors.author && <p className={err}>{errors.author.message}</p>}
        </div>

        {optionsLoading ? (
          <div className="space-y-4">
            <div className="font-mono text-base font-medium text-muted">Loading options…</div>
          </div>
        ) : (
          <>
            <Combobox
              name="technologies"
              label="technologies"
              placeholder="Select or type (e.g. Prisma, Next.js)"
              options={options.technologies}
              value={technologies}
              onChange={(v) => setValue("technologies", v, { shouldValidate: true })}
              error={errors.technologies?.message}
              hint="Select from list or type new, max 12"
              allowCustom
              maxSelections={12}
              disabled={optionsLoading}
            />

            <Combobox
              name="categories"
              label="categories"
              placeholder="Select or type (e.g. Database, ORM)"
              options={options.categories}
              value={categories}
              onChange={(v) => setValue("categories", v, { shouldValidate: true })}
              error={errors.categories?.message}
              hint="Select from list or type new, max 8"
              allowCustom
              maxSelections={8}
              disabled={optionsLoading}
            />

            <Combobox
              name="agents"
              label="agents"
              placeholder="Select or type (e.g. Claude Code, OpenCode)"
              options={options.agents}
              value={agents}
              onChange={(v) => setValue("agents", v, { shouldValidate: true })}
              error={errors.agents?.message}
              hint="Select from list or type new, max 12"
              allowCustom
              maxSelections={12}
              disabled={optionsLoading}
            />

            <Combobox
              name="tags"
              label="tags"
              placeholder="Select or type (e.g. orm, typescript)"
              options={options.tags}
              value={tags}
              onChange={(v) => setValue("tags", v, { shouldValidate: true })}
              error={errors.tags?.message}
              hint="Select from list or type new, max 16"
              allowCustom
              maxSelections={16}
              disabled={optionsLoading}
            />
          </>
        )}

        {/* Honeypot: humans never fill this; bots do. Checked server-side. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="website">website</label>
          <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <Button type="submit" disabled={isSubmitting || optionsLoading}>
          {isSubmitting ? "$ submitting…" : "$ submit --review"}
        </Button>
        {status && <p role="status" className="font-mono text-base font-medium text-muted">{status}</p>}
      </form>
    </div>
  );
}