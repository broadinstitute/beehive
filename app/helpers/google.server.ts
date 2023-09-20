export * from "@googleapis/calendar";
// We can't do `import * as google from "@googleapis/calendar"` in a route file directly because
// it won't get tree-shaken properly and it'll try to use Node's process global in the browser.
// Remix solution for this is to re-export what you need to import from a .server.ts file, which
// forcibly tells Remix to tree-shake this out of the client bundle.
