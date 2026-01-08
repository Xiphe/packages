import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";

export type SlotSchema = StandardSchemaV1 & StandardJSONSchemaV1;

// BDD API contract
export type StepHandler<Context = any, Args extends Array<unknown> = any[]> = (
  ctx: Context,
  ...args: Args
) => Promise<void> | void;
export type StepDefiner<Context = any, Args extends Array<unknown> = any[]> = (
  pattern: string | RegExp,
  handler: StepHandler<Context, Args>,
) => void;

export interface BddApi<Context = any> {
  Given: StepDefiner<Context, any[]>;
  When: StepDefiner<Context, any[]>;
  Then: StepDefiner<Context, any[]>;
}

// Map a tuple of schemas to a tuple of inferred output types (preserves order)
type ArgsFromSchemas<S extends readonly StandardJSONSchemaV1[]> = {
  [K in keyof S]: StandardJSONSchemaV1.InferOutput<S[K]>;
};

type TemplateHandler<CTX, TArgs extends readonly unknown[]> = (
  ctx: CTX,
  ...args: TArgs
) => Promise<void> | void;

// Use function overloads instead of intersection type
interface TaggedStepDefiner<Handler extends StepHandler> {
  (pattern: string | RegExp, handler: Handler): void;
  <Schemas extends readonly SlotSchema[]>(
    strings: TemplateStringsArray,
    ...schemas: Schemas
  ): (
    handler: TemplateHandler<Parameters<Handler>[0], ArgsFromSchemas<Schemas>>,
  ) => void;
}

interface TypedBddApi<API extends BddApi> {
  Given: TaggedStepDefiner<Parameters<API["Given"]>[1]>;
  When: TaggedStepDefiner<Parameters<API["When"]>[1]>;
  Then: TaggedStepDefiner<Parameters<API["Then"]>[1]>;
}

/**
 * Escapes special regex characters in a literal string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates a regex pattern from JSON Schema
 */
function schemaToRegex(schema: StandardJSONSchemaV1): string {
  const standard = schema["~standard"];
  const jsonSchema = standard.jsonSchema.input({ target: "openapi-3.0" });

  // Handle const (literal)
  if ("const" in jsonSchema) {
    return `(${escapeRegex(String(jsonSchema.const))})`;
  }

  // Handle enum (literal values)
  if ("enum" in jsonSchema && Array.isArray(jsonSchema.enum)) {
    return `(${jsonSchema.enum.map(String).map(escapeRegex).join("|")})`;
  }

  // Handle anyOf (union of literals)
  if ("anyOf" in jsonSchema && Array.isArray(jsonSchema.anyOf)) {
    const values: string[] = [];

    jsonSchema.anyOf.forEach((s) => {
      switch (true) {
        case "const" in s:
          values.push(escapeRegex(String(s.const)));
          break;
        case "enum" in s && Array.isArray(s.enum):
          values.push(s.enum.map(String).map(escapeRegex).join("|"));
          break;
        case "type" in s && s.type === "string":
          values.push(`["'][^"']+["']`);
          break;
        case "type" in s && s.type === "number":
          values.push(`[-+]?\\d+(?:\\.\\d+)?`);
          break;
        default:
          throw new Error(`Unsupported schema in anyOf: ${JSON.stringify(s)}`);
      }
    });

    return `(${values.join("|")})`;
  }

  // Handle type-based schemas
  if ("type" in jsonSchema) {
    switch (jsonSchema.type) {
      case "string":
        // Match quoted strings
        return `["']([^"']+)["']`;
      case "number":
        // Match integers and floats
        return `([-+]?\\d+(?:\\.\\d+)?)`;
    }
  }

  throw new Error(`Unsupported schema: ${JSON.stringify(jsonSchema)}`);
}

/**
 * Creates a typed BDD API wrapper
 */
export function createTypedBdd<API extends BddApi>(
  base: API,
): TypedBddApi<API> {
  function createStepDefiner<Definer extends StepDefiner>(
    baseDefiner: Definer,
  ) {
    const result = (...args: any[]) => {
      // Check if called as tagged template
      if (args.length > 0 && Array.isArray(args[0]) && "raw" in args[0]) {
        const strings = args[0] as TemplateStringsArray;
        const schemas = args.slice(1) as SlotSchema[];

        // Return a function that accepts the handler
        return (handler: any) => {
          // Build regex pattern
          let pattern = "^";
          for (let i = 0; i < strings.length; i++) {
            pattern += escapeRegex(strings[i]);
            if (i < schemas.length) {
              pattern += schemaToRegex(schemas[i]);
            }
          }
          pattern += "$";

          const regex = new RegExp(pattern);

          // Create wrapped handler that validates and parses values
          const wrappedHandler = async (ctx: any, ...args: string[]) => {
            const validatedArgs: any[] = [];

            for (let i = 0; i < schemas.length; i++) {
              const value = args[i];
              const schema = schemas[i];

              // Validate using standard schema
              const result = await schema["~standard"].validate(value);

              if ("issues" in result) {
                throw new Error(
                  `Validation failed for argument ${i}: ${JSON.stringify(
                    result.issues,
                  )}`,
                );
              }

              validatedArgs.push(result.value);
            }

            return handler(ctx, ...validatedArgs);
          };

          baseDefiner(regex, wrappedHandler);
        };
      }

      // Otherwise, pass through to base API (string/RegExp overload)
      baseDefiner(args[0], args[1]);
    };

    return result as TaggedStepDefiner<Parameters<Definer>[1]>;
  }

  return {
    Given: createStepDefiner(base.Given),
    When: createStepDefiner(base.When),
    Then: createStepDefiner(base.Then),
  };
}
