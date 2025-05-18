import { Sandpack } from "@codesandbox/sandpack-react";

export default function CodePreview({
  files,
}: {
  files: Record<string, { code: string }>;
}) {
  console.log({ files });
  return (
    <Sandpack
      template="nextjs"
      files={files}
      customSetup={{
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          tailwindcss: "^3.0.0",
        },
      }}
      options={{
        showTabs: false,
        showLineNumbers: false,
        showConsoleButton: true,
        showNavigator: false,
        visibleFiles: ["/src/app/page.tsx"],
      }}
    />
  );
}
