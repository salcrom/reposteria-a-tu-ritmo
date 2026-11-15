import {RECIPES} from "./recipes.js?v=2";

const $=s=>document.querySelector(s);
const state={filter:"all",query:"",selected:null,servings:0};
const clean=s=>String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const norm=s=>clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const fmt=n=>new Intl.NumberFormat("es-ES",{maximumFractionDigits:1}).format(n);
const categoryLabel={tartas:"Tartas",bolleria:"Bollería",galletas:"Galletas","postres-frios":"Postres fríos",basicos:"Básicos",colecciones:"Colecciones",airfryer:"Airfryer",bizcochos:"Bizcochos",sarten:"Sartén",horno:"Bocados",pendientes:"Por identificar",flanes:"Flanes"};

function filtered(){return RECIPES.filter(r=>{
  const matchesFilter=state.filter==="all"||(state.filter==="new"?r.priority==="new":r.category===state.filter);
  const hay=norm([r.title,r.desc,r.category,r.method,r.origin,r.author].join(" "));
  return matchesFilter&&(!state.query||hay.includes(norm(state.query)));
})}

function renderCards(){const list=filtered();$("#visibleCount").textContent=list.length;$("#summaryText").textContent=list.length===1?" receta coincide":" recetas coinciden";$("#recipes").innerHTML=list.map(r=>`<button class="card" data-id="${r.id}"><span class="status ${r.migration}">${r.migration==="complete"?"Ficha detallada":r.migration==="review"?"Faltan datos":"Acceso provisional"}</span><span class="emoji">${r.emoji||"🍮"}</span><span class="type">${categoryLabel[r.category]||r.category} · ${r.method}</span><strong>${r.title}</strong><span class="desc">${clean(r.desc)}</span><span class="meta"><i>${r.difficulty}</i><i>${r.time}</i></span></button>`).join("")||`<p class="empty">No hay recetas con esos filtros.</p>`;document.querySelectorAll(".card").forEach(b=>b.onclick=()=>openRecipe(b.dataset.id));}

function scaledIngredient(i,r){const [amount,unit,name]=i;if(typeof amount!=="number"||!r.base||!state.servings)return `${amount} ${unit||""} ${name}`.trim();return `${fmt(amount*state.servings/r.base)} ${unit||""} ${name}`.trim()}
function stepText(text,r){return String(text).replace(/\{\{servings\}\}/g,String(state.servings)).replace(/\{\{ingredient:(\d+)\}\}/g,(_,n)=>scaledIngredient(r.ingredients[Number(n)],r).split(" ").slice(0,2).join(" "))}

function openRecipe(id){const r=RECIPES.find(x=>x.id===id);if(!r)return;state.selected=id;state.servings=r.base||0;const full=r.migration==="complete"&&r.ingredients.length;$("#detail").hidden=false;$("#detail").innerHTML=`<button class="close" aria-label="Cerrar receta">×</button><div class="detail-head"><span>${categoryLabel[r.category]||r.category} · ${r.method}</span><h2>${r.title}</h2><p>${clean(r.desc)}</p><div class="badges"><b>${r.difficulty}</b><b>${r.time}</b><b>${r.status}</b></div></div>${full?`<div class="detail-grid"><section><div class="section-title"><h3>Ingredientes</h3><div class="servings"><button id="minus" aria-label="Restar raciones">−</button><strong id="servings">${state.servings} raciones</strong><button id="plus" aria-label="Sumar raciones">+</button></div></div><ul id="ingredients" class="ingredients"></ul></section><section><h3>Paso a paso</h3><ol id="steps" class="steps"></ol></section></div>`:`<section class="provisional"><h3>${r.migration==="review"?"Qué falta":"Acceso provisional"}</h3><p>${clean(r.note)}</p>${r.legacyUrl?`<a class="primary" href="${r.legacyUrl}" target="_blank" rel="noreferrer">Abrir en la PWA original</a>`:""}</section>`}<section class="source"><h3>Procedencia y estado</h3><p>${clean(r.note)}</p>${r.source?`<a href="${r.source}" target="_blank" rel="noreferrer">Ver publicación de ${r.author||"origen"}</a>`:""}</section>`;$(".close").onclick=()=>{$("#detail").hidden=true;state.selected=null;history.replaceState(null,"",location.pathname)};if(full){$("#minus").onclick=()=>changeServings(-1);$("#plus").onclick=()=>changeServings(1);renderRecipeBody(r)}location.hash=`receta=${id}`;$("#detail").scrollIntoView({behavior:"smooth",block:"start"});}
function renderRecipeBody(r){$("#servings").textContent=`${state.servings} raciones`;$("#ingredients").innerHTML=r.ingredients.map(i=>`<li>${scaledIngredient(i,r)}</li>`).join("");$("#steps").innerHTML=r.steps.map(([t,b],i)=>`<li><span>${i+1}</span><div><strong>${t}</strong><p>${stepText(b,r)}</p></div></li>`).join("")}
function changeServings(delta){const r=RECIPES.find(x=>x.id===state.selected);state.servings=Math.max(1,state.servings+delta);renderRecipeBody(r)}

$("#search").oninput=e=>{state.query=e.target.value;renderCards()};$("#filters").onclick=e=>{const b=e.target.closest("button");if(!b)return;state.filter=b.dataset.filter;document.querySelectorAll("#filters button").forEach(x=>x.classList.toggle("active",x===b));renderCards()};
$("#total").textContent=RECIPES.length;renderCards();
const requested=location.hash.match(/^#receta=(.+)$/)?.[1];if(requested)openRecipe(requested);
if("serviceWorker" in navigator){navigator.serviceWorker.register("./service-worker.js");let waiting;navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());navigator.serviceWorker.ready.then(reg=>{if(reg.waiting){waiting=reg.waiting;$("#update").hidden=false}reg.addEventListener("updatefound",()=>{const worker=reg.installing;worker?.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller){waiting=worker;$("#update").hidden=false}})})});$("#update").onclick=()=>waiting?.postMessage({type:"SKIP_WAITING"})}
