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
    {
      name: "@/lib/supabase/admin",
      message: "The privileged Supabase client is restricted to the legacy server-route allowlist."
    },
    {
      name: "@/lib/supabase/env",
      message: "Server credential helpers are restricted to the legacy server-route allowlist."
    }
  ],
  patterns: [
    {
      group: [
        "@legabit/db/*",
        "@legabit/api/*",
        "**/apps/api/**",
        "../../api/**",
        "../../../api/**",
        "../../../../api/**",
        "../../../../../api/**",
        "@/lib/supabase/admin/*",
        "@/lib/supabase/env/*"
      ],
      message: "Frontend code must depend on public contracts, not database or backend infrastructure."
    }
  ]
};

const restrictedServerEnvironmentVariables = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BETTER_AUTH_SECRET"
].flatMap((name) => [
  {
    selector: `MemberExpression[object.object.name='process'][object.property.name='env'][property.name='${name}']`,
    message: `${name} is a server secret and must not be read by frontend code.`
  },
  {
    selector: `MemberExpression[object.object.name='process'][object.property.name='env'][computed=true][property.value='${name}']`,
    message: `${name} is a server secret and must not be read by frontend code.`
  }
]);

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", forbiddenFrontendImports],
      "no-restricted-syntax": ["error", ...restrictedServerEnvironmentVariables]
    }
  },
  {
    // These modules are temporary server-only infrastructure for the newsletter and
    // health routes. Remove this allowlist when those routes move to apps/api.
    files: [
      "src/app/api/newsletter/route.ts",
      "src/app/api/health/data/route.ts",
      "src/lib/supabase/admin.ts",
      "src/lib/supabase/env.ts"
    ],
    rules: {
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off"
    }
  }
];
