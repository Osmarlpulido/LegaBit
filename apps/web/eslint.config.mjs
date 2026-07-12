import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const forbiddenFrontendImports = {
  paths: [
    {
      name: "@legabit/db",
      message: "Database access belongs in the API, not frontend code."
    },
    {
      name: "@legabit/api",
      message: "Import API contracts instead of backend implementation modules."
    },
  ],
  patterns: [
    {
      group: [
        "@legabit/db/*",
        "@legabit/api/*",
        "**/packages/db",
        "**/packages/db/**",
        "**/apps/api/**",
        "../**/packages/db",
        "../**/packages/db/**",
        "../**/apps/api/**",
        "../../api/**",
        "../../../api/**",
        "../../../../api/**",
        "../../../../../api/**",
      ],
      message: "Frontend code must depend on public contracts, not database or backend infrastructure."
    }
  ]
};

const processEnvObject = "MemberExpression[object.name='process'][property.name='env']";
const computedProcessEnvObject = "MemberExpression[object.name='process'][computed=true][property.value='env']";

const restrictedEnvironmentAccess = [
  {
    selector: "ImportExpression[source.value=/\\/(?:packages\\/db|apps\\/api)(?:\\/|$)/]",
    message: "Dynamic imports must not bypass frontend database or backend boundaries."
  },
  {
    selector: "CallExpression[callee.name='require'][arguments.0.value=/\\/(?:packages\\/db|apps\\/api)(?:\\/|$)/]",
    message: "require() must not bypass frontend database or backend boundaries."
  },
  {
    selector:
      ":matches(MemberExpression, OptionalMemberExpression)" +
      ":matches([object.object.name='process'][object.property.name='env'], " +
      "[object.object.name='process'][object.computed=true][object.property.value='env'])" +
      ":not([computed=false][property.name=/^NEXT_PUBLIC_/])" +
      ":not([computed=true][property.value=/^NEXT_PUBLIC_/])",
    message: "Only statically named NEXT_PUBLIC_* environment variables may be read in frontend code."
  },
  {
    selector: `VariableDeclarator[init.type='MemberExpression']:matches([init.object.name='process'][init.property.name='env'], [init.object.name='process'][init.computed=true][init.property.value='env'])`,
    message: "Do not alias or destructure process.env; access a static NEXT_PUBLIC_* key directly."
  },
  {
    selector: `AssignmentExpression[right.type='MemberExpression']:matches([right.object.name='process'][right.property.name='env'], [right.object.name='process'][right.computed=true][right.property.value='env'])`,
    message: "Do not alias process.env; access a static NEXT_PUBLIC_* key directly."
  },
  {
    selector: `:matches(CallExpression, NewExpression) > :matches(${processEnvObject}, ${computedProcessEnvObject})`,
    message: "Do not pass process.env indirectly; access a static NEXT_PUBLIC_* key directly."
  },
  {
    selector: `SpreadElement > :matches(${processEnvObject}, ${computedProcessEnvObject})`,
    message: "Do not spread process.env into frontend data."
  }
];

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", forbiddenFrontendImports],
      "no-restricted-syntax": ["error", ...restrictedEnvironmentAccess]
    }
  },
  {
    // This server-only auth adapter needs a private internal API URL. Keep the
    // exception narrow so client and presentation modules remain public-env only.
    files: [
      "src/lib/auth/current-user.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off"
    }
  }
];
