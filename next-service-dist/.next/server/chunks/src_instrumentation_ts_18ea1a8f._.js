module.exports=[23322,t=>{"use strict";async function e(){setTimeout(async()=>{try{(await fetch("http://localhost:3000/api/songs/home")).ok&&console.log("✅ Cache prewarmed on server start")}catch(t){setTimeout(async()=>{try{await fetch("http://localhost:3000/api/songs/home")}catch{}},5e3)}},3e3)}t.s(["register",()=>e])}];

//# sourceMappingURL=src_instrumentation_ts_18ea1a8f._.js.map