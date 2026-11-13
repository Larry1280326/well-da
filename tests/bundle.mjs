import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// Bundle the actual handlers; replace only external services. Never reads AWS/DB credentials.
const require = createRequire(import.meta.url);
export async function load(entry, name, services = false) {
  const outfile = resolve(`.test-build/${name}.cjs`);
  await build({ entryPoints: [entry], outfile, bundle: true, platform: "node", format: "cjs", packages: "external", logLevel: "silent",
    plugins: [{ name: "isolated-services", setup(b) {
      b.onResolve({ filter: /^server-only$/ }, () => ({ path: "empty", namespace: "test" }));
      if (services) b.onResolve({ filter: /^@\/lib\/(db|s3|email)$/ }, args => ({ path: args.path.split("/").at(-1), namespace: "test" }));
      b.onLoad({ filter: /.*/, namespace: "test" }, args => ({ contents: ({
        empty: "",
        db: "export const getClient = (...a) => globalThis.__rfqTest.getClient(...a);",
        s3: "export const uploadFile = (...a) => globalThis.__rfqTest.uploadFile(...a); export const deleteFile = (...a) => globalThis.__rfqTest.deleteFile(...a);",
        email: "export const sendConfirmationEmail = (...a) => globalThis.__rfqTest.sendConfirmationEmail(...a); export const sendInternalRfqNotification = (...a) => globalThis.__rfqTest.sendInternalRfqNotification(...a);",
      })[args.path], loader: "js" }));
    } }],
  });
  return require(outfile);
}
