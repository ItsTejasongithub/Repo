// three.js ships addon (examples/jsm) modules as plain .js without bundled
// type declarations, and this project intentionally has no @types/three.
// We consume them dynamically with `any`, so an ambient module is enough.
declare module 'three/addons/*';
