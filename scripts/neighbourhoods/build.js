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

  // Foz runs up the coast to Matosinhos: Foz do Douro + Nevogilde merged
  const foz = await search("Foz do Douro, Porto", "boundary", "historic");
  const nev = await lookup(["R5936094"]);
  const fozAll = union(turf.featureCollection([asFeature(foz.geojson, "foz"), asFeature(nev[0].geojson, "foz")]));
  fozAll.properties = { id: "foz" };
  out.push(fozAll);

  // Canidelo, in Gaia, west of Afurada: only its seaside strip (about 1 km in from the coast, Cabedelo to Lavadores)
  const can = await lookup(["R5991742"]);
  const coastStrip = turf.polygon([[[-8.70, 41.15], [-8.660, 41.15], [-8.652, 41.105], [-8.70, 41.105], [-8.70, 41.15]]]);
  const canCoast = turf.intersect(turf.featureCollection([asFeature(can[0].geojson, "canidelo"), coastStrip]));
  canCoast.properties = { id: "canidelo" };
  out.push(canCoast);

  // Matosinhos (the town's parish, not the whole municipality) and Afurada (São Pedro da Afurada, in Gaia)
  const mat = await lookup(["R5923922"]);
  out.push(asFeature(mat[0].geojson, "matosinhos"));
  const afu = await lookup(["R5991760"]);
  out.push(asFeature(afu[0].geojson, "afurada"));

  // No official boundary for these: approximate areas around their centres (drawn dashed)
  const approx = (id, lng, lat, km) => turf.circle([lng, lat], km, { steps: 48, units: "kilometers", properties: { id, approx: true } });
  out.push(approx("boavista", -8.6330, 41.1580, 0.7));

  // Foz Velha: the old village core, between the church and Rua da Senhora da Luz, trimmed to Foz (drawn on top of it)
  const fv = turf.intersect(turf.featureCollection([approx("fozvelha", -8.6722, 41.1495, 0.38), asFeature(foz.geojson, "fozvelha")]));
  fv.properties = { id: "fozvelha", approx: true };
  out.push(fv);

  // Ribeira last, so it is drawn on top of the historic centre
  const rib = await lookup(["R19484850"]);
  out.push(asFeature(rib[0].geojson, "ribeira"));

  // Round coordinates to 5 decimals (about 1 m) to keep the file small
  const round = c => Array.isArray(c[0]) ? c.map(round) : [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5];
  for (const f of out) f.geometry.coordinates = round(f.geometry.coordinates);

  const fc = { type: "FeatureCollection", attribution: "Boundaries © OpenStreetMap contributors (ODbL). Boavista and Foz Velha are approximate.", features: out };
  fs.writeFileSync(process.argv[2], JSON.stringify(fc));
  console.log(out.map(f => f.properties.id + ":" + f.geometry.type).join(" "), (fs.statSync(process.argv[2]).size / 1024).toFixed(0) + " KB");
})();
