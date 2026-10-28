// Builds site/data/neighbourhoods.geojson from OpenStreetMap boundaries (via Nominatim).
// Only needed when an area is added or its outline changes. The colours and texts live in places.json.
// Run from this folder:  npm install @turf/turf@7.2.0  then  node build.js ../../site/data/neighbourhoods.geojson
const fs = require("fs");
const turf = require("@turf/turf");
const union = turf.union;

const UA = { "User-Agent": "sobri-porto-guide/1.0 (david.asobrinho@gmail.com)" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function lookup(ids) {
  const url = "https://nominatim.openstreetmap.org/lookup?format=json&polygon_geojson=1&polygon_threshold=0.00015&osm_ids=" + ids.join(",");
  const r = await fetch(url, { headers: UA });
  const j = await r.json();
  await sleep(1200);
  return j;
}
async function search(q, cls, type) {
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=8&polygon_geojson=1&polygon_threshold=0.00015&countrycodes=pt&q=" + encodeURIComponent(q);
  const j = await (await fetch(url, { headers: UA })).json();
  await sleep(1200);
  return j.find(x => x.class === cls && x.type === type);
}
const asFeature = (g, id) => turf.feature(g, { id });

(async () => {
  const out = [];

  // Centro Histórico: Sé, São Nicolau, Vitória, Miragaia merged
  const centre = await lookup(["R5936097", "R5936096", "R5936098", "R5936093"]);
  let merged = asFeature(centre[0].geojson, "centro");
  for (const p of centre.slice(1)) merged = union(turf.featureCollection([merged, asFeature(p.geojson, "centro")]));
  merged.properties = { id: "centro" };
  out.push(merged);

  const ced = await lookup(["R5936089"]);
  out.push(asFeature(ced[0].geojson, "cedofeita"));

  // Baixa (downtown: Aliados, Bolhão, Santa Catarina, Trindade) = the old parish of Santo Ildefonso
  const baixa = await lookup(["R5936095"]);
  out.push(asFeature(baixa[0].geojson, "baixa"));

  const bonfim = await search("Bonfim, Porto", "boundary", "administrative");
  out.push(asFeature(bonfim.geojson, "bonfim"));

  const camp = await search("Campanhã, Porto", "boundary", "administrative");
  out.push(asFeature(camp.geojson, "campanha"));

  const foz = await search("Foz do Douro, Porto", "boundary", "historic");
  out.push(asFeature(foz.geojson, "foz"));

  // Matosinhos (the town's parish, not the whole municipality) and Afurada (São Pedro da Afurada, in Gaia)
  const mat = await lookup(["R5923922"]);
  out.push(asFeature(mat[0].geojson, "matosinhos"));
  const afu = await lookup(["R5991760"]);
  out.push(asFeature(afu[0].geojson, "afurada"));

  // No official boundary for these: approximate areas around their centres (drawn dashed)
  const approx = (id, lng, lat, km) => turf.circle([lng, lat], km, { steps: 48, units: "kilometers", properties: { id, approx: true } });
  out.push(approx("antas", -8.5885, 41.1610, 0.75));
  out.push(approx("boavista", -8.6330, 41.1580, 0.7));

  // Ribeira last, so it is drawn on top of the historic centre
  const rib = await lookup(["R19484850"]);
  out.push(asFeature(rib[0].geojson, "ribeira"));

  // Round coordinates to 5 decimals (about 1 m) to keep the file small
  const round = c => Array.isArray(c[0]) ? c.map(round) : [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5];
  for (const f of out) f.geometry.coordinates = round(f.geometry.coordinates);

  const fc = { type: "FeatureCollection", attribution: "Boundaries © OpenStreetMap contributors (ODbL). Antas and Boavista are approximate.", features: out };
  fs.writeFileSync(process.argv[2], JSON.stringify(fc));
  console.log(out.map(f => f.properties.id + ":" + f.geometry.type).join(" "), (fs.statSync(process.argv[2]).size / 1024).toFixed(0) + " KB");
})();
