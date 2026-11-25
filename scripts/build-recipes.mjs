import {mkdir, writeFile} from "node:fs/promises";
import {fileURLToPath, pathToFileURL} from "node:url";
import path from "node:path";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
const atlasRoot=path.resolve(root,"..");
const bakery=await import(pathToFileURL(path.join(atlasRoot,"postres-a-tu-ritmo/app.js")));

const migrated=bakery.RECIPES.map((r,index)=>({
  ...r,
  origin:"Bollería y galletas a tu ritmo",
  migration:"complete",
  priority:index<6?"new":"normal",
  method:/frit/i.test(r.label)?"fritura":/sartén/i.test(r.label)?"sartén":/sin horno/i.test(r.label)?"frío":"horno",
  difficulty:r.steps.length>=8?"avanzada":r.steps.length>=6?"media":"fácil",
  status:/pendiente/i.test(r.note)?"pendiente de prueba":"documentada"
}));

const provisional=[
  ["flan-nata","Flan de nata","flanes","horno","media","Dulce a tu ritmo"],
  ["quesillo","Tarta de quesillo","flanes","horno","media","Dulce a tu ritmo"],
  ["pannacotta","Pannacotta de vainilla","postres-frios","frío","fácil","Dulce a tu ritmo"],
  ["baileys","Cheesecake de Baileys","tartas","frío","media","Dulce a tu ritmo"],
  ["cookie-pie","Cookie pie","galletas","horno","media","Dulce a tu ritmo"],
  ["cinnamon-cheesecake","Tarta de queso y cinnamon roll","tartas","horno","avanzada","Dulce a tu ritmo"],
  ["panettone-tiramisu","Panettone tiramisú","postres-frios","frío","media","Dulce a tu ritmo"],
  ["lotus","Cheesecake Lotus","tartas","frío","media","Dulce a tu ritmo"],
  ["chocolate-banana","Tarta de chocolate y plátano","tartas","horno","media","Dulce a tu ritmo"],
  ["mousse-chocolate","Tarta mousse de chocolate","tartas","frío","avanzada","Dulce a tu ritmo"],
  ["brownie-griego","Brownie de yogur griego","bizcochos","horno","fácil","Dulce a tu ritmo"],
  ["maracuya","Tarta de maracuyá","tartas","frío","media","Dulce a tu ritmo"],
  ["almendra-naranja","Tarta de almendra y naranja","tartas","horno","media","Dulce a tu ritmo"],
  ["ferrero","Tarta de chocolate y avellanas","tartas","horno","avanzada","Dulce a tu ritmo"],
  ["bizcocho-canela","Bizcocho de canela","bizcochos","horno","fácil","Dulce a tu ritmo"],
  ["tostadas-tiramisu","Tostadas francesas de tiramisú","sarten","sartén","fácil","Dulce a tu ritmo"],
  ["tiramisu-limon","Tiramisú de limón","postres-frios","frío","media","Dulce a tu ritmo"],
  ["tarta-galletas","Tarta de galletas de la abuela","tartas","frío","fácil","Dulce a tu ritmo"],
  ["tres-leches","Tarta tres leches","tartas","horno","avanzada","Dulce a tu ritmo"],
  ["cheesecake-cookie","Cheesecake de cookie","tartas","horno","media","Dulce a tu ritmo"],
  ["rollitos-nutella","Rollitos de Nutella","airfryer","airfryer","fácil","Recetas para airfryer"],
  ["coulant-airfryer","Coulant de chocolate negro","airfryer","airfryer","media","Recetas para airfryer"]
].map(([id,title,category,method,difficulty,origin])=>({
  id:`legacy-${id}`,title,category,method,difficulty,origin,migration:"provisional",status:"pendiente de migración",base:0,time:"Consultar ficha original",desc:"Receta conservada en su PWA original mientras se completa la migración detallada.",ingredients:[],steps:[],note:"Acceso provisional: no se ha duplicado el contenido para evitar divergencias durante la transición.",legacyUrl:origin.startsWith("Dulce")?"https://salcrom.github.io/flan-pwa/":"https://recetas-airfryer-salcrom.salcrom.chatgpt.site/"}));

const pending=[
  {id:"yule-kinder",title:"Tronquitos Kinder Bueno",category:"tartas",method:"horno",difficulty:"media",base:8,time:"45 min + enfriado",source:"https://www.instagram.com/blendymcblender/reel/DdPBi_jABlC/",author:"@blendymcblender",ingredients:[[4,"","huevos"],[55,"g","azúcar, dividido en 20 g y 35 g"],[40,"g","aceite neutro"],[40,"g","leche"],[75,"g","harina"],[3,"g","impulsor químico"],[1,"pizca","sal"],[1,"cantidad","relleno de chocolate y avellana, pendiente de concretar"]],steps:[["Preparar el bizcocho","Bate huevos y azúcar hasta que la mezcla esté aireada. Incorpora aceite y leche."],["Añadir los secos","Tamiza harina, impulsor y sal e intégralos con movimientos suaves."],["Hornear","Extiende una capa fina y hornea hasta que el bizcocho esté flexible y cocido; la fuente pública no indica temperatura ni tiempo."],["Formar","Enfría, rellena y forma los tronquitos. Mantén refrigerados si el relleno contiene lácteos."]],note:"La publicación aporta cantidades del bizcocho, pero deriva el detalle completo a un libro externo. Temperatura, tiempo, rendimiento y relleno quedan pendientes; no se inventan."},
  {id:"postre-recetasconsabor",title:"Tarta fría de galletas María y ColaCao",category:"tartas",method:"frío",difficulty:"fácil",base:6,time:"25 min + 4 h de frío",source:"https://www.instagram.com/_recetasconsabor/reel/DfdXZDjqG9L/",author:"@_recetasconsabor",ingredients:[[200,"g","galletas María"],[370,"g","leche condensada"],[250,"ml","leche para la crema"],[2,"cda","ColaCao para la crema"],[5,"láminas","gelatina neutra"],[100,"ml","leche para mojar las galletas"],[1,"cdta","ColaCao para decorar"]],steps:[["Hidratar la gelatina","Pon {{ingredient:4}} de gelatina en abundante agua fría durante 5 minutos, hasta que estén blandas."],["Hacer la crema","Calienta {{ingredient:2}} de leche con {{ingredient:1}} de leche condensada y {{ingredient:3}} de ColaCao, removiendo hasta disolver. No dejes que hierva. Retira del fuego, escurre bien la gelatina y añádela a la mezcla caliente. Remueve hasta que se disuelva por completo y deja templar 10 minutos."],["Montar las capas","Forra el molde con film. Moja rápidamente las galletas en {{ingredient:5}} de leche y cubre el fondo. Vierte la mitad de la crema, coloca otra capa de galletas mojadas, añade el resto de la crema y termina con galletas."],["Enfriar","Tapa y refrigera al menos 4 horas; para un corte más limpio, déjala toda la noche."],["Desmoldar y decorar","Desmolda en un plato y espolvorea {{ingredient:6}} de ColaCao por encima justo antes de servir."]],note:"Versión facilitada por el propietario a partir del reel: sustituye el café soluble por ColaCao. Con cinco láminas queda firme para cortar; con cuatro queda más cremosa. Si la crema está muy líquida al montar, déjala templar un poco más. Mantén la tarta refrigerada. Pendiente de prueba real."},
  {id:"coleccion-cinco-masas",title:"Colección: cinco masas dulces",category:"colecciones",method:"horno",difficulty:"avanzada",base:10,time:"Según la masa",source:"https://www.instagram.com/elpanaderopty/p/DfiWmnxOnaM/",author:"@elpanaderopty",ingredients:[],steps:[],note:"Incluye rolls de canela, croissants, berlinas y otras dos masas. Las cantidades están en las imágenes del carrusel; se desglosará tras el restablecimiento de cuota para no transcribirlas de forma incompleta."},
  {id:"coleccion-ocho-pasteles",title:"Colección: ocho pasteles",category:"colecciones",method:"horno",difficulty:"media",base:0,time:"Según el pastel",source:"https://www.instagram.com/recetassanas.nutri/p/DfikdENGnT8/",author:"@recetassanas.nutri",ingredients:[],steps:[],note:"Reúne vainilla, chocolate, mantequilla, red velvet, yogur, naranja, chiffon y bizcocho esponjoso, con almendra molida y sin azúcar añadido. El desglose de las imágenes queda pendiente."},
  {id:"postre-frio-chocolate",title:"Postre frío de chocolate, café y plátano",category:"postres-frios",method:"frío",difficulty:"media",base:10,time:"45 min + frío",source:"https://www.instagram.com/cookrate.cakes/reel/Dff1-mqFZBt/",author:"@cookrate.cakes",ingredients:[[300,"g","chocolate negro fundido"],[300,"g","chocolate blanco fundido"],[300,"g","bizcochos de soletilla"],[400,"ml","café preparado"],[150,"g","mantequilla, dividida"],[1,"","plátano"],[100,"g","crema de cacao y avellanas"],[500,"ml","nata para montar"],[80,"g","coco rallado"],[50,"g","azúcar glas"]],steps:[["Preparar las capas","Ten fríos el café y la nata antes de montar. Funde cada chocolate por separado."],["Montar","Combina soletillas humedecidas, crema y plátano en capas, siguiendo el formato del molde."],["Cubrir","Termina con los chocolates y el coco, evitando mezclar preparaciones calientes con nata montada."],["Enfriar","Refrigera hasta que el conjunto esté firme antes de cortar."]],note:"La descripción añade también hielo, leche, miel y café sin aclarar su función. La ficha necesita una prueba real para ordenar el montaje exacto y validar el rendimiento."},
  {id:"abuela-enrollada",title:"Tarta de la abuela enrollada",category:"tartas",method:"sartén y frío",difficulty:"avanzada",base:10,time:"1 h + reposo",source:"https://www.instagram.com/chefbosquet/reel/DfbrQb7Ioft/",author:"@chefbosquet",ingredients:[[4,"","huevos para crepes"],[100,"g","harina de avena o trigo sarraceno"],[220,"g","leche o bebida vegetal"],[1,"chorrito","aceite de oliva"],[5,"","yemas pasteurizadas"],[500,"g","leche para la crema"],[30,"g","endulzante"],[30,"g","maicena"],[100,"g","chocolate"],[120,"g","nata o leche de coco"]],steps:[["Cocinar las crepes","Mezcla los ingredientes y cocina crepes finas. Recorta dos extremos para facilitar el enrollado."],["Preparar la crema","Mezcla en frío y cocina a fuego medio sin dejar de remover hasta espesar. Usa yemas pasteurizadas."],["Montar","Alterna cuatro o cinco capas de crepe, crema y cacao; enrolla con ayuda de film."],["Refrigerar","Enfría varias horas, mejor hasta el día siguiente."],["Cubrir","Vierte la nata caliente sobre el chocolate picado, emulsiona y cubre el rollo frío."]],note:"Adaptación de la descripción pública. Conserva refrigerada y consume en un máximo de 48 horas."},
  {id:"kanelbullar",title:"Kanelbullar con glaseado de queso",category:"bolleria",method:"horno",difficulty:"avanzada",base:10,time:"3 h",source:"https://www.instagram.com/bakerybynoelia/reel/DfZjw5PBSyK/",author:"@bakerybynoelia",ingredients:[[400,"g","harina de fuerza"],[50,"g","azúcar"],[1,"g","sal"],[175,"g","leche"],[2,"","huevos"],[25,"g","levadura fresca"],[50,"g","mantequilla para la masa"],[150,"g","mantequilla para el relleno"],[90,"g","azúcar moreno"],[9,"g","canela"],[90,"g","queso crema"],[300,"g","azúcar glas"],[30,"g","leche para el glaseado"]],steps:[["Amasar","Mezcla leche, levadura, huevos y azúcar. Incorpora harina; añade {{ingredient:6}} de mantequilla y la sal y amasa hasta obtener elasticidad."],["Primer levado","Deja reposar hasta que triplique su volumen."],["Rellenar y formar","Mezcla {{ingredient:7}} de mantequilla, el azúcar moreno y la canela. Estira, rellena, dobla, corta tiras y forma {{servings}} nudos."],["Segundo levado","Deja fermentar en bandeja hasta que aumenten de volumen."],["Hornear","Hornea a 170 °C unos 12 minutos, vigilando el dorado. Si preparas más unidades, hornéalas por tandas sin llenar la bandeja."],["Glasear","Mezcla queso, azúcar glas, leche y zumo de medio limón; reparte sobre los bollos templados."]],note:"Cantidades y proceso proceden de la descripción pública. Rendimiento estimado en 10 unidades; pendiente de prueba real."},
  {id:"pancakes-chocolate",title:"Pancakes rellenos de chocolate",category:"sarten",method:"sartén",difficulty:"fácil",base:6,time:"35 min",source:"https://www.instagram.com/iklimafood/reel/DfUjBgJRJnw/",author:"@iklimafood",ingredients:[[3,"","huevos"],[4,"cda","azúcar"],[250,"ml","leche"],[50,"ml","aceite vegetal"],[2,"vasos de 250 ml","harina"],[1.5,"cdta","impulsor químico"],[0.33,"cdta","vainillina"],[6,"cda","crema de chocolate"]],steps:[["Congelar el relleno","Forma seis discos de crema de chocolate sobre papel y congélalos hasta que estén firmes."],["Preparar la masa","Bate huevos y azúcar; añade leche y aceite. Incorpora harina, impulsor y vainilla hasta obtener una masa de grosor medio."],["Rellenar","Pon masa en una sartén templada, coloca un disco congelado y cúbrelo con más masa."],["Cocinar","Cocina a fuego medio-bajo hasta que el centro esté hecho, dando la vuelta cuando la superficie tenga burbujas."]],note:"La fuente habla de 5 minutos por lado; comienza con menos tiempo y comprueba la primera unidad para evitar quemar el exterior."},
  {id:"crepes-tiramisu",title:"Tarta de crepes de tiramisú",category:"tartas",method:"sartén y frío",difficulty:"media",base:12,time:"1 h + frío",source:"https://www.instagram.com/margabermudez_/reel/DfVDBJjIvtW/",author:"@margabermudez_",ingredients:[[3,"","huevos L"],[50,"g","mantequilla fundida"],[360,"ml","leche"],[1,"sobre","café soluble"],[3,"cda","azúcar"],[180,"g","harina"],[700,"g","mascarpone"],[200,"g","nata para montar"],[100,"g","azúcar glas"],[15,"g","cacao puro"]],steps:[["Preparar la masa","Mezcla huevos, mantequilla, leche con café, azúcar y harina. Deja reposar 20 minutos."],["Cocinar","Haz unas 12 crepes finas en una sartén antiadherente y deja que se enfríen."],["Preparar la crema","Bate mascarpone y azúcar. Añade la nata muy fría y monta solo hasta que quede firme."],["Montar","Alterna crepes y capas finas de crema, manteniendo los bordes nivelados."],["Enfriar","Refrigera al menos 4 horas y termina con cacao justo antes de servir."]],note:"La fuente aporta ingredientes, pero no elaboración detallada. El reposo, montaje y frío son indicaciones prácticas pendientes de prueba."},
  {id:"crema-pastelera",title:"Crema pastelera de vainilla",category:"basicos",method:"cazo",difficulty:"fácil",base:8,time:"25 min + frío",source:"https://www.instagram.com/bakerybynoelia/reel/Dc75w4is6w-/",author:"@bakerybynoelia",ingredients:[[500,"ml","leche"],[70,"g","azúcar"],[4,"","yemas"],[30,"g","maicena"],[1,"","vaina de vainilla"],[1,"cantidad","canela y piel de limón al gusto"]],steps:[["Infusionar","Calienta la leche con vainilla, canela y piel de limón. Retira los aromáticos."],["Mezclar","Une azúcar y maicena antes de incorporarlas a las yemas; bate hasta que no haya grumos."],["Templar","Vierte la leche caliente poco a poco sobre las yemas mientras remueves."],["Espesar","Devuelve al cazo y cocina a fuego medio sin dejar de remover hasta que hierva y espese."],["Enfriar","Pasa a una bandeja limpia, cubre con film a piel y enfría rápidamente antes de refrigerar."]],note:"Receta básica tomada de la descripción pública. Conserva a 4 °C o menos y utiliza en un máximo de 48 horas."}
].map((r,index)=>({...r,origin:"Colección Instagram · Postres",migration:r.ingredients.length?"complete":"review",priority:"new",status:r.ingredients.length?"pendiente de prueba":"faltan datos",desc:r.note,emoji:"🍰",colors:["#7b3f2b","#e7a86e"]}));

const cheesecakes = [
  {
    "id": "tarta-queso-turron",
    "title": "Tarta de queso con turrón blando",
    "ingredients": [
      [
        500,
        "g",
        "queso crema"
      ],
      [
        200,
        "g",
        "turrón blando de Jijona"
      ],
      [
        200,
        "ml",
        "nata para montar"
      ],
      [
        3,
        "ud",
        "huevos M"
      ],
      [
        12,
        "g",
        "maicena"
      ]
    ],
    "mix": "Desmenuza el turrón y tritúralo con la nata. Incorpora el queso crema y la maicena.",
    "note": "El turrón aporta el dulzor. Contiene almendra, leche y huevo."
  },
  {
    "id": "tarta-queso-azul",
    "title": "Tarta de queso con queso azul",
    "ingredients": [
      [
        500,
        "g",
        "queso crema"
      ],
      [
        40,
        "g",
        "gorgonzola dulce"
      ],
      [
        200,
        "ml",
        "nata para montar"
      ],
      [
        3,
        "ud",
        "huevos M"
      ],
      [
        85,
        "g",
        "azúcar"
      ],
      [
        12,
        "g",
        "maicena"
      ]
    ],
    "mix": "Desmenuza el gorgonzola y mézclalo con el queso crema, la nata, el azúcar y la maicena.",
    "note": "Si usas cabrales o roquefort, prueba con 20–25 g para 8 raciones. Sirve con pera asada y nueces tostadas si te apetece. Contiene leche y huevo, y nueces si las añades."
  },
  {
    "id": "tarta-queso-payoyo",
    "title": "Tarta de queso con queso Payoyo",
    "ingredients": [
      [
        500,
        "g",
        "queso crema"
      ],
      [
        100,
        "g",
        "queso Payoyo semicurado"
      ],
      [
        200,
        "ml",
        "nata para montar"
      ],
      [
        3,
        "ud",
        "huevos M"
      ],
      [
        80,
        "g",
        "azúcar"
      ],
      [
        12,
        "g",
        "maicena"
      ]
    ],
    "mix": "Quita la corteza del Payoyo y rállalo fino. Calienta la nata sin hervir, añade el queso y remueve. Deja templar y mezcla con el queso crema, el azúcar y la maicena.",
    "note": "El semicurado aporta sabor sin dominar la crema. Contiene leche y huevo."
  }
].map(({mix,note,...recipe})=>({
  ...recipe,
  category:"tartas",method:"horno",difficulty:"media",base:8,
  time:"45–55 min de horno + 6 h de frío",
  priority:"new",migration:"complete",status:"pendiente de prueba",
  origin:"Receta propia",emoji:"🍰",desc:note.split(". ")[0]+".",
  steps:[
    ["Preparar el molde","Precalienta el horno a 165 °C con calor arriba y abajo. Forra con papel de horno un molde redondo de 18 cm para 8 raciones. Si cambias las raciones, ajusta el diámetro para mantener una altura similar."],
    ["Mezclar",mix+" Añade los huevos uno a uno y mezcla solo hasta integrar."],
    ["Hornear","Vierte la mezcla en el molde. Hornea entre 45 y 55 minutos como referencia para 8 raciones. Comprueba desde el minuto 45: los bordes deben estar firmes y el centro temblar ligeramente como un bloque."],
    ["Enfriar","Deja templar sobre una rejilla, refrigera al menos 6 horas y desmolda en frío."]
  ],
  note:note+" Receta propia pendiente de prueba en cocina."
}));

const recipes=[...cheesecakes,...pending,...migrated,...provisional].filter(r=>r.id!=="bunuelos-nata");
await mkdir(path.join(root,"dist"),{recursive:true});
await writeFile(path.join(root,"dist/recipes.js"),`export const RECIPES=${JSON.stringify(recipes,null,2)};\n`);
console.log(`Generadas ${recipes.length} fichas: ${pending.length + cheesecakes.length} nuevas, ${migrated.length} migradas y ${provisional.length} provisionales.`);
