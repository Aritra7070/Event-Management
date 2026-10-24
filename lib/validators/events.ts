import { z } from "zod";

/**
 * Reserved slugs — hardcoded fallback until Member 6 ships
 * `getSetting("reservedSlugs")`. Keep this list in sync with top-level routes.
 */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "dashboard",
  "events",
  "e",
  "login",
  "signup",
  "settings",
  "new",
  "edit",
  "preview",
  "me",
  "my",
  "register",
  "checkin",
  "analytics",
  "share",
  "opengraph-image",
] as const;

const RESERVED_SLUG_SET = new Set<string>(RESERVED_SLUGS);

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

/**
 * Validates an IANA timezone name. `Intl.DateTimeFormat` is stricter and more
 * portable than `Intl.supportedValuesOf`, which is missing in some runtimes
 * and does not include aliases such as `Asia/Calcutta`.
 */
export function isValidTimezone(timezone: string): boolean {
  if (!timezone) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

const timezoneSchema = z
  .string()
  .min(1, "Timezone is required")
  .refine(isValidTimezone, "Enter a valid IANA timezone");

export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(60, "Slug must be at most 60 characters")
  .regex(
    SLUG_REGEX,
    "Use lowercase letters, digits and hyphens; start and end with a letter or digit",
  )
  .refine((slug) => !RESERVED_SLUG_SET.has(slug), "This slug is reserved");

const optionalUrl = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().url("Enter a valid URL").nullable().optional(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.date().nullable().optional(),
);

const optionalAccentColor = z.preprocess(
  (value) => (value === "" ? null : value),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour such as #2563eb")
    .nullable()
    .optional(),
);

const optionalVenue = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().max(500, "Venue must be at most 500 characters").nullable().optional(),
);

const optionalCapacity = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be at least 1")
    .nullable()
    .optional(),
);

/**
 * Field-level event shape. Used directly for full validation, and via
 * `.partial()` for section-by-section builder saves.
 */
const baseEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  descriptionMd: z
    .string()
    .max(50_000, "Description must be at most 50,000 characters")
    .optional(),
  coverUrl: optionalUrl,
  logoUrl: optionalUrl,
  accentColor: optionalAccentColor,
  startsAt: optionalDate,
  endsAt: optionalDate,
  timezone: timezoneSchema.optional(),
  mode: z.enum(["in_person", "online", "hybrid"]).optional(),
  venue: optionalVenue,
  onlineUrl: optionalUrl,
  capacity: optionalCapacity,
  requiresApproval: z.boolean().optional(),
  waitlistEnabled: z.boolean().optional(),
  slug: slugSchema.optional(),
});

type EventShape = z.infer<typeof baseEventSchema>;

type DateOrderShape = Pick<EventShape, "startsAt" | "endsAt">;
type ModeShape = Pick<EventShape, "mode" | "venue" | "onlineUrl">;

function addDateOrderIssue(data: DateOrderShape, ctx: z.RefinementCtx) {
  if (
    data.startsAt &&
    data.endsAt &&
    data.endsAt.getTime() <= data.startsAt.getTime()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "End time must be after start time",
    });
  }
}

function addModeIssues(data: ModeShape, ctx: z.RefinementCtx) {
  if (
    (data.mode === "in_person" || data.mode === "hybrid") &&
    (!data.venue || !data.venue.trim())
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["venue"],
      message: "Venue is required for in-person and hybrid events",
    });
  }

  if (
    (data.mode === "online" || data.mode === "hybrid") &&
    !data.onlineUrl
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["onlineUrl"],
      message: "Online link is required for online and hybrid events",
    });
  }
}

/**
 * Full event validation, including mode/venue and date rules. This is the
 * shape the test suite exercises.
 */
export const eventSchema = baseEventSchema.superRefine((data, ctx) => {
  addDateOrderIssue(data, ctx);
  addModeIssues(data, ctx);
});

/**
 * Partial update used by section-by-section builder saves. Venue/link rules
 * are deliberately publish-time only so an organizer can save a half-filled
 * draft; date order is still checked when both dates are present.
 */
export const eventPatchSchema = baseEventSchema
  .partial()
  .superRefine(addDateOrderIssue);

/**
 * Strict publish validation. Every field required to make a page public is
 * mandatory here, and the mode/venue rules run again.
 */
export const publishSchema = baseEventSchema
  .extend({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: slugSchema,
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    timezone: timezoneSchema,
    mode: z.enum(["in_person", "online", "hybrid"]),
  })
  .superRefine((data, ctx) => {
    addDateOrderIssue(data, ctx);
    addModeIssues(data, ctx);
  });

export const draftSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export const questionSchema = z
  .object({
    id: z.string().uuid().optional(),
    label: z.string().trim().min(1, "Question label is required").max(200),
    type: z.enum(["text", "select", "checkbox"]),
    options: z
      .array(z.string().trim().min(1, "Options cannot be empty").max(200))
      .max(20, "A question can have at most 20 options")
      .nullable()
      .optional(),
    required: z.boolean().default(false),
    position: z.number().int().nonnegative(),
  })
  .superRefine((question, ctx) => {
    if (question.type !== "select") {
      return;
    }

    if (!question.options || question.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Select questions need at least 2 options",
      });
      return;
    }

    const normalized = question.options.map((option) => option.toLowerCase());
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Options must be unique",
      });
    }
  });

export const questionsArraySchema = z
  .array(questionSchema)
  .max(20, "An event can have at most 20 custom questions");

export type EventPatch = z.infer<typeof eventPatchSchema>;
export type PublishInput = z.infer<typeof publishSchema>;
export type QuestionPayload = z.infer<typeof questionSchema>;
