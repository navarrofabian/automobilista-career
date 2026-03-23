// data.js

// --- Árbol de carrera ---
const career = [
  {
    level: "NIVEL 0",
    branches: [
      {
        name: "KARTING",
        categories: [
          { name: "Kart Rental", img: "img/kart_rental.png", icon: "icons/kart_rental.png", locked: false },
          { name: "Kart GX390", img: "img/kart_gx390.png", icon: "icons/4trace.png", locked: true },
          { name: "Kart 125cc", img: "img/kart125.png", icon: "icons/2t125.png", locked: false },
          { name: "Kart Shifter", img: "img/kart_shifter.png", icon: "icons/2tshifter.png", locked: true },
        ]
      }
    ]
  },
  {
    level: "NIVEL 1",
    branches: [
      {
        name: "Primeros Autos",
        categories: [
          { name: "Formula Trainer", img: "img/formula_trainer.png", icon: "icons/trainer.png", locked: true },
          { name: "Copa Uno", img: "img/copa_uno.png", icon: "icons/copauno.png", locked: true },
          { name: "Copa Fusca", img: "img/fusca.png", icon: "icons/fusca.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 2",
    branches: [
      {
        name: "Monoplazas",
        categories: [
          { name: "Formula Vee", img: "img/formula_vee.png", icon: "icons/vee.png", locked: true },
          { name: "Formula Trainer Advanced", img: "img/formula_trainer_adv.png", icon: "icons/formula_trainer_adv.png", locked: true }
        ]
      },
      {
        name: "Turismo",
        categories: [
          { name: "Copa Classic B", img: "img/copa_classic_b.png", icon: "icons/copa_classic_b.png", locked: true },
          { name: "Caterham Academy", img: "img/caterham_academy.png", icon: "icons/caterham_academy.png", locked: true }
        ]
      },
      {
        name: "Offroad",
        categories: [
          { name: "Formula Dirt", img: "img/formula_dirt.png", icon: "icons/formula_dirt.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 3",
    branches: [
      {
        name: "Monoplazas",
        categories: [
          { name: "Formula 3 Brasil", img: "img/formula3.png", icon: "icons/formula3.png", locked: true }
        ]
      },
      {
        name: "Turismo",
        categories: [
          { name: "Copa Classic FL", img: "img/copa_classic_fl.png", icon: "icons/copa_classic_fl.png", locked: true },
          { name: "Ginetta G40 Cup", img: "img/ginetta_g40.png", icon: "icons/ginetta_g40.png", locked: true },
          { name: "Caterham Supersport", img: "img/caterham_supersport.png", icon: "icons/caterham_supersport.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 4",
    branches: [
      {
        name: "Monoplazas",
        categories: [
          { name: "Formula Retro Gen1", img: "img/formula_retro1.png", icon: "icons/formula_retro1.png", locked: true }
        ]
      },
      {
        name: "GT",
        categories: [
          { name: "GT5", img: "img/gt5.png", icon: "icons/gt5.png", locked: true },
          { name: "Ginetta G55 Supercup", img: "img/ginetta_g55.png", icon: "icons/ginetta_g55.png", locked: true }
        ]
      },
      {
        name: "Turismo",
        categories: [
          { name: "Copa Montana", img: "img/copa_montana.png", icon: "icons/copa_montana.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 5",
    branches: [
      {
        name: "Monoplazas",
        categories: [
          { name: "Formula Retro Gen2", img: "img/formula_retro2.png", icon: "icons/formula.png", locked: true },
          { name: "Formula Retro Gen3", img: "img/formula_retro3.png", icon: "icons/formula.png", locked: true }
        ]
      },
      {
        name: "GT",
        categories: [
          { name: "GT4", img: "img/gt4.png", icon: "icons/gt.png", locked: true }
        ]
      },
      {
        name: "Turismo",
        categories: [
          { name: "Stock Car Brasil", img: "img/stockcar.png", icon: "icons/turismo.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 6",
    branches: [
      {
        name: "Formula Histórica",
        categories: [
          { name: "Formula Classic Gen1", img: "img/formula_classic1.png", icon: "icons/formula.png", locked: true },
          { name: "Formula Classic Gen2", img: "img/formula_classic2.png", icon: "icons/formula.png", locked: true }
        ]
      },
      {
        name: "Turismo",
        categories: [
          { name: "Vintage Touring Cars T2", img: "img/vintage_t2.png", icon: "icons/classics.png", locked: true }
        ]
      },
      {
        name: "Especial",
        categories: [
          { name: "ARC Camaro", img: "img/arc_camaro.png", icon: "icons/special.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 7",
    branches: [
      {
        name: "Formula",
        categories: [
          { name: "Formula Classic Gen3", img: "img/formula_classic3.png", icon: "icons/formula.png", locked: true },
          { name: "Formula Classic Gen4", img: "img/formula_classic4.png", icon: "icons/formula.png", locked: true }
        ]
      },
      {
        name: "GT",
        categories: [
          { name: "GT3", img: "img/gt3.png", icon: "icons/gt.png", locked: true },
          { name: "GT3 Gen2", img: "img/gt3_gen2.png", icon: "icons/gt.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 8",
    branches: [
      {
        name: "Formula",
        categories: [
          { name: "Formula V10 Gen1", img: "img/formula_v10_1.png", icon: "icons/formula.png", locked: true },
          { name: "Formula V8 Gen3", img: "img/formula_v8_3.png", icon: "icons/formula.png", locked: true }
        ]
      },
      {
        name: "GT",
        categories: [
          { name: "GTE", img: "img/gte.png", icon: "icons/gt.png", locked: true },
          { name: "GT1", img: "img/gt1.png", icon: "icons/gt.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL 9",
    branches: [
      {
        name: "Prototipos",
        categories: [
          { name: "LMP2", img: "img/lmp2.png", icon: "icons/prototype.png", locked: true },
          { name: "DPI", img: "img/dpi.png", icon: "icons/prototype.png", locked: true },
          { name: "LMDh", img: "img/lmdh.png", icon: "icons/prototype.png", locked: true }
        ]
      },
      {
        name: "Histórico",
        categories: [
          { name: "Group C", img: "img/groupc.png", icon: "icons/classics.png", locked: true }
        ]
      }
    ]
  },
  {
    level: "NIVEL FINAL",
    branches: [
      {
        name: "Formula Maxima",
        categories: [
          { name: "Formula Ultimate", img: "img/formula_ultimate.png", icon: "icons/formula.png", locked: true },
          { name: "Formula Ultimate Gen2", img: "img/formula_ultimate2.png", icon: "icons/formula.png", locked: true }
        ]
      },
      {
        name: "Endurance Top",
        categories: [
          { name: "Hypercar", img: "img/hypercar.png", icon: "icons/prototype.png", locked: true }
        ]
      }
    ]
  }
];

// --- Campeonatos predefinidos ---
const championshipsData = {
  "Kart 125cc": {
    races: [
      { 
        id: 1,
        name: "Grand Prix Ciudad A", 
        date: "01/04/2026", 
        location: "Circuito A", 
        img: "img/circuitoA.png",
        results: [ { driver:"Juan Pérez", points:25 }, { driver:"Ana Gómez", points:18 }, { driver:"Luis Martínez", points:15 } ]
      },
      { 
        id: 2,
        name: "Copa Metropolitana", 
        date: "15/04/2026", 
        location: "Circuito B", 
        img: "img/circuitoB.png",
        results: [ { driver:"Juan Pérez", points:18 }, { driver:"Ana Gómez", points:25 }, { driver:"Luis Martínez", points:15 } ]
      },
      { 
        id: 3,
        name: "Final Provincial", 
        date: "30/04/2026", 
        location: "Circuito C", 
        img: "img/circuitoC.png",
        results: [ { driver:"Juan Pérez", points:15 }, { driver:"Ana Gómez", points:18 }, { driver:"Luis Martínez", points:25 } ]
      }
    ],
    drivers: [
      { name:"Juan Pérez" },
      { name:"Ana Gómez" },
      { name:"Luis Martínez" }
    ]
  },

  "Formula Trainer": {
    races: [
      { 
        id:1,
        name:"Autódromo X - Entrenamiento", 
        date:"02/05/2026", 
        location:"Autódromo X", 
        img:"img/circuitox.png",
        results:[ { driver:"Carlos Díaz", points:25 }, { driver:"María López", points:18 } ]
      },
      { 
        id:2,
        name:"Autódromo Y - Challenge", 
        date:"16/05/2026", 
        location:"Autódromo Y", 
        img:"img/circuitoy.png",
        results:[ { driver:"Carlos Díaz", points:18 }, { driver:"María López", points:25 } ]
      },
      { 
        id:3,
        name:"Autódromo Z - Final", 
        date:"30/05/2026", 
        location:"Autódromo Z", 
        img:"img/circuitoz.png",
        results:[ { driver:"Carlos Díaz", points:25 }, { driver:"María López", points:18 } ]
      }
    ],
    drivers: [
      { name:"Carlos Díaz" },
      { name:"María López" }
    ]
  }
  // Podés agregar más categorías con sus carreras y pilotos
};




// --- Lista de circuitos y layouts reales ---
const trackList = [
  {
    name:"Adelaide",
    img:"img/tracks/adelaide.png",
    layouts:[
      {name:"Adelaide",img:"img/tracks/adelaide_adelaide.png"},
      {name:"Adelaide Historic 1988",img:"img/tracks/adelaide_historic1988.png"},
      {name:"Adelaide STT",img:"img/tracks/adelaide_stt.png"}
    ]
  },
  {
    name:"Ascurra",
    img:"img/tracks/ascurra.png",
    layouts:[
      {name:"Ascurra Dirt",img:"img/tracks/ascurra_dirt.png"},
      {name:"Ascurra RX",img:"img/tracks/ascurra_rx.png"}
    ]
  },
  {
    name:"Azure Circuit (Monaco)",
    img:"img/tracks/azurecircuit.png",
    layouts:[
      {name:"Azure Circuit",img:"img/tracks/azurecircuit.png"}
    ]
  },
  {
    name:"Barcelona-Catalunya",
    img:"img/tracks/barcelona.png",
    layouts:[
      {name:"Barcelona GP",img:"img/tracks/barcelona_gp.png"},
      {name:"Barcelona GP (No Chicane)",img:"img/tracks/barcelona_gp_nochicane.png"},
      {name:"Barcelona National",img:"img/tracks/barcelona_national.png"},
      {name:"Barcelona Historic 1991",img:"img/tracks/barcelona_historic1991.png"},
      {name:"Barcelona RX",img:"img/tracks/barcelona_rx.png"}
    ]
  },
  {
    name:"Bathurst",
    img:"img/tracks/bathurst.png",
    layouts:[
      {name:"Bathurst 2020",img:"img/tracks/bathurst_2020.png"},
      {name:"Bathurst 1983 (Historic)",img:"img/tracks/bathurst_historic1983.png"}
    ]
  },
  {
    name:"Brands Hatch",
    img:"img/tracks/brandshatch.png",
    layouts:[
      {name:"Brands Hatch GP",img:"img/tracks/brandshatch_gp.png"},
      {name:"Brands Hatch Indy",img:"img/tracks/brandshatch_indy.png"}
    ]
  },
  {
    name:"Brasília",
    img:"img/tracks/brasilia.png",
    layouts:[
      {name:"Brasília Full",img:"img/tracks/brasilia_full.png"},
      {name:"Brasília Outer",img:"img/tracks/brasilia_outer.png"}
    ]
  },
  {
    name:"Buenos Aires",
    img:"img/tracks/buenosaires.png",
    layouts:[
      {name:"Circuito No.6 S",img:"img/tracks/buenosaires_6s.png"},
      {name:"Circuito No.6",img:"img/tracks/buenosaires_6.png"},
      {name:"Circuito No.7",img:"img/tracks/buenosaires_7.png"},
      {name:"Circuito No.8",img:"img/tracks/buenosaires_8.png"},
      {name:"Circuito No.9",img:"img/tracks/buenosaires_9.png"},
      {name:"Circuito No.12",img:"img/tracks/buenosaires_12.png"},
      {name:"Circuito No.15",img:"img/tracks/buenosaires_15.png"}
    ]
  },
  {
    name:"Buskerud Kart",
    img:"img/tracks/buskerudkart.jpg",
    layouts:[
      {name:"Buskerud Kart Long",img:"img/tracks/buskerudkart_long.png"},
      {name:"Buskerud Kart Short",img:"img/tracks/buskerudkart_short.png"}
    ]
  },
  {
    name:"Cadwell Park",
    img:"img/tracks/cadwellpark.png",
    layouts:[
      {name:"Cadwell Park",img:"img/tracks/cadwellpark.png"}
    ]
  },
  {
    name:"Campo Grande",
    img:"img/tracks/campogrande.png",
    layouts:[
      {name:"Campo Grande",img:"img/tracks/campogrande.png"}
    ]
  },
  {
    name:"Cascais (Estoril)",
    img:"img/tracks/cascais.png",
    layouts:[
      {name:"Cascais Standard",img:"img/tracks/cascais_standard.png"},
      {name:"Cascais Alternate",img:"img/tracks/cascais_alternate.png"},
      {name:"Cascais Historic 1988",img:"img/tracks/cascais_historic1988.png"}
    ]
  },
  {
    name:"Cascavel",
    img:"img/tracks/cascavel.png",
    layouts:[
      {name:"Cascavel",img:"img/tracks/cascavel.png"}
    ]
  },
  {
    name:"Cleveland",
    img:"img/tracks/cleveland.png",
    layouts:[
      {name:"Cleveland GP",img:"img/tracks/cleveland_gp.png"},
      {name:"Cleveland STT",img:"img/tracks/cleveland_stt.png"}
    ]
  },
  {
    name:"Córdoba",
    img:"img/tracks/cordoba.png",
    layouts:[
      {name:"Córdoba Full",img:"img/tracks/cordoba_full.png"},
      {name:"Córdoba Alternate 1",img:"img/tracks/cordoba_alt1.png"},
      {name:"Córdoba Alternate 2",img:"img/tracks/cordoba_alt2.png"}
    ]
  },
  {
    name:"Curitiba",
    img:"img/tracks/curitiba.png",
    layouts:[
      {name:"Curitiba GP",img:"img/tracks/curitiba_gp.png"},
      {name:"Curitiba Outer",img:"img/tracks/curitiba_outer.png"}
    ]
  },
  {
    name:"Curvelo",
    img:"img/tracks/curvelo.png",
    layouts:[
      {name:"Curvelo Long",img:"img/tracks/curvelo_long.png"},
      {name:"Curvelo Short",img:"img/tracks/curvelo_short.png"}
    ]
  },
  {
    name:"Daytona International Speedway",
    img:"img/tracks/daytona.png",
    layouts:[
      {name:"Daytona Road Course",img:"img/tracks/daytona_roadcourse.png"},
      {name:"Daytona NASCAR Road Course",img:"img/tracks/daytona_nascar.png"},
      {name:"Daytona Oval",img:"img/tracks/daytona_oval.png"}
    ]
  },
  {
    name:"Donington Park",
    img:"img/tracks/donington.png",
    layouts:[
      {name:"Donington GP",img:"img/tracks/donington_gp.png"},
      {name:"Donington National",img:"img/tracks/donington_national.png"}
    ]
  },
  {
    name:"Fontana (Auto Club Speedway)",
    img:"img/tracks/autoclub.png",
    layouts:[
      {name:"Auto Club Oval",img:"img/tracks/autoclub_oval.png"},
      {name:"Auto Club Road Course",img:"img/tracks/autoclub_roadcourse.png"}
    ]
  },
  {
    name:"Foz",
    img:"img/tracks/foz.png",
    layouts:[
      {name:"Foz",img:"img/tracks/foz.png"}
    ]
  },
  {
    name:"Galeão Airport",
    img:"img/tracks/galeao_airport.png",
    layouts:[
      {name:"Galeão Airport",img:"img/tracks/galeao_airport.png"}
    ]
  },
  {
    name:"Gateway",
    img:"img/tracks/gateway.png",
    layouts:[
      {name:"Gateway GP",img:"img/tracks/gateway_gp.png"},
      {name:"Gateway Short",img:"img/tracks/gateway_short.png"},
      {name:"Gateway Oval",img:"img/tracks/gateway_oval.png"}
    ]
  },
  {
    name:"Goiânia",
    img:"img/tracks/goiania.png",
    layouts:[
      {name:"Goiania GP",img:"img/tracks/goiania_gp.png"},
      {name:"Goiania Short",img:"img/tracks/goiania_short.png"},
      {name:"Goiania Oval",img:"img/tracks/goiania_oval.png"}
    ]
  },
  {
    name:"Granja Viana",
    img:"img/tracks/granja.png",
    layouts:[
      {name:"Copa Sao Paulo Kart Stage 2",img:"img/tracks/goiania_gp.png"},
      {name:"Granja Viana Kart 101",img:"img/tracks/goiania_short.png"},
      {name:"Granja Viana Kart 121",img:"img/tracks/goiania_short.png"},
      {name:"Granja Viana Kart 102",img:"img/tracks/goiania_oval.png"}
    ]
  },
 {
    name:"Guaporé",
    img:"img/tracks/guapore.png",
    layouts:[
      {name:"Guaporé GP", img:"img/tracks/guapore_gp.png"},
      {name:"Guaporé Short", img:"img/tracks/guapore_short.png"}
    ]
  },
  {
    name:"Hockenheimring",
    img:"img/tracks/hockenheim.png",
    layouts:[
      {name:"GP", img:"img/tracks/hockenheim_gp.png"},
      {name:"Short", img:"img/tracks/hockenheim_short.png"},
      {name:"Historic 2002", img:"img/tracks/hockenheim_historic2002.png"},
      {name:"STT", img:"img/tracks/hockenheim_stt.png"},
      {name:"Endurance", img:"img/tracks/hockenheim_endurance.png"}
    ]
  },
  {
    name:"Ibarra",
    img:"img/tracks/ibarra.png",
    layouts:[
      {name:"Ibarra GP", img:"img/tracks/ibarra_gp.png"},
      {name:"Ibarra RX", img:"img/tracks/ibarra_rx.png"},
      {name:"Ibarra Dirt", img:"img/tracks/ibarra_dirt.png"}
    ]
  },
  {
    name:"Imola",
    img:"img/tracks/imola.png",
    layouts:[
      {name:"GP", img:"img/tracks/imola_gp.png"},
      {name:"National", img:"img/tracks/imola_national.png"},
      {name:"Historic 1988", img:"img/tracks/imola_historic1988.png"},
      {name:"RX", img:"img/tracks/imola_rx.png"}
    ]
  },
  {
    name:"Indianapolis",
    img:"img/tracks/indianapolis.png",
    layouts:[
      {name:"GP", img:"img/tracks/indianapolis_gp.png"},
      {name:"Oval", img:"img/tracks/indianapolis_oval.png"}
    ]
  },
  {
    name:"Interlagos",
    img:"img/tracks/interlagos.png",
    layouts:[
      {name:"GP", img:"img/tracks/interlagos_gp.png"},
      {name:"National", img:"img/tracks/interlagos_national.png"},
      {name:"Short", img:"img/tracks/interlagos_short.png"},
      {name:"Historic 1992", img:"img/tracks/interlagos_historic1992.png"},
      {name:"STT", img:"img/tracks/interlagos_stt.png"},
      {name:"RX", img:"img/tracks/interlagos_rx.png"}
    ]
  },
  {
    name:"Jacarepaguá",
    img:"img/tracks/jacarepagua.png",
    layouts:[
      {name:"Full GP", img:"img/tracks/jacarepagua_gp.png"},
      {name:"Short", img:"img/tracks/jacarepagua_short.png"},
      {name:"Historic 1988", img:"img/tracks/jacarepagua_historic1988.png"}
    ]
  },
  {
    name:"Jerez",
    img:"img/tracks/jerez.png",
    layouts:[
      {name:"GP", img:"img/tracks/jerez_gp.png"},
      {name:"National", img:"img/tracks/jerez_national.png"},
      {name:"RX", img:"img/tracks/jerez_rx.png"}
    ]
  },
  {
    name:"Kansai (Susuka)",
    img:"img/tracks/kansai.png",
    layouts:[
      {name:"GP", img:"img/tracks/kansai_gp.png"},
      {name:"Short", img:"img/tracks/kansai_short.png"},
      {name:"RX", img:"img/tracks/kansai_rx.png"},
      {name:"Historic 1988", img:"img/tracks/kansai_historic1988.png"}
    ]
  },
  {
    name:"Kyalami",
    img:"img/tracks/kyalami.png",
    layouts:[
      {name:"Full GP", img:"img/tracks/kyalami_gp.png"},
      {name:"Short", img:"img/tracks/kyalami_short.png"}
    ]
  },
  {
    name:"Laguna Seca",
    img:"img/tracks/lagunaseca.png",
    layouts:[
      {name:"Full GP", img:"img/tracks/lagunaseca_gp.png"}
    ]
  },
  {
    name:"Le Mans",
    img:"img/tracks/lemans.png",
    layouts:[
      {name:"Full GP", img:"img/tracks/lemans_gp.png"},
      {name:"Bugatti", img:"img/tracks/lemans_bugatti.png"}
    ]
  },
  {
    name:"Londrina",
    img:"img/tracks/londrina.png",
    layouts:[
      {name:"GP", img:"img/tracks/londrina_gp.png"},
      {name:"Short", img:"img/tracks/londrina_short.png"},
      {name:"RX", img:"img/tracks/londrina_rx.png"},
      {name:"Historic", img:"img/tracks/londrina_historic.png"}
    ]
  },
  {
    name:"Long Beach",
    img:"img/tracks/longbeach.png",
    layouts:[
      {name:"GP", img:"img/tracks/longbeach_gp.png"},
      {name:"Historic 1988", img:"img/tracks/longbeach_historic1988.png"}
    ]
  },
  {
    name:"Montréal",
    img:"img/tracks/montreal.png",
    layouts:[
      {name:"GP", img:"img/tracks/montreal_gp.png"},
      {name:"National", img:"img/tracks/montreal_national.png"},
      {name:"RX", img:"img/tracks/montreal_rx.png"}
    ]
  },
  {
    name:"Monza",
    img:"img/tracks/monza.png",
    layouts:[
      {name:"GP", img:"img/tracks/monza_gp.png"},
      {name:"National", img:"img/tracks/monza_national.png"},
      {name:"Historic 1988", img:"img/tracks/monza_historic1988.png"},
      {name:"Historic 1990", img:"img/tracks/monza_historic1990.png"},
      {name:"RX", img:"img/tracks/monza_rx.png"},
      {name:"Short", img:"img/tracks/monza_short.png"},
      {name:"STT", img:"img/tracks/monza_stt.png"},
      {name:"Endurance", img:"img/tracks/monza_endurance.png"}
    ]
  },
  {
    name:"Mosport",
    img:"img/tracks/mosport.png",
    layouts:[
      {name:"GP", img:"img/tracks/mosport_gp.png"}
    ]
  },
  {
    name:"Nürburgring",
    img:"img/tracks/nurburgring.png",
    layouts:[
      {name:"GP", img:"img/tracks/nurburgring_gp.png"},
      {name:"Nordschleife", img:"img/tracks/nurburgring_nordschleife.png"},
      {name:"Sprint", img:"img/tracks/nurburgring_sprint.png"},
      {name:"Historic 1984", img:"img/tracks/nurburgring_historic1984.png"},
      {name:"RX", img:"img/tracks/nurburgring_rx.png"},
      {name:"Club", img:"img/tracks/nurburgring_club.png"},
      {name:"STT", img:"img/tracks/nurburgring_stt.png"},
      {name:"Endurance", img:"img/tracks/nurburgring_endurance.png"},
      {name:"GP 2002", img:"img/tracks/nurburgring_gp2002.png"},
      {name:"National", img:"img/tracks/nurburgring_national.png"},
      {name:"Short", img:"img/tracks/nurburgring_short.png"},
      {name:"Historic 1991", img:"img/tracks/nurburgring_historic1991.png"},
      {name:"RX Alternate", img:"img/tracks/nurburgring_rxalt.png"}
    ]
  },
  {
    name:"Ortona",
    img:"img/tracks/ortona.png",
    layouts:[
      {name:"GP", img:"img/tracks/ortona_gp.png"},
      {name:"Short", img:"img/tracks/ortona_short.png"},
      {name:"RX", img:"img/tracks/ortona_rx.png"},
      {name:"Historic", img:"img/tracks/ortona_historic.png"}
    ]
  },
  {
    name:"Oulton Park",
    img:"img/tracks/oultonpark.png",
    layouts:[
      {name:"GP", img:"img/tracks/oultonpark_gp.png"},
      {name:"Island", img:"img/tracks/oultonpark_island.png"},
      {name:"Historic", img:"img/tracks/oultonpark_historic.png"},
      {name:"RX", img:"img/tracks/oultonpark_rx.png"}
    ]
  },
  {
    name:"Pocono",
    img:"img/tracks/pocono.png",
    layouts:[
      {name:"GP", img:"img/tracks/pocono_gp.png"},
      {name:"Short", img:"img/tracks/pocono_short.png"},
      {name:"Oval", img:"img/tracks/pocono_oval.png"},
      {name:"Historic 1988", img:"img/tracks/pocono_historic1988.png"},
      {name:"STT", img:"img/tracks/pocono_stt.png"},
      {name:"RX", img:"img/tracks/pocono_rx.png"},
      {name:"Endurance", img:"img/tracks/pocono_endurance.png"}
    ]
  },
{
  name:"Road America",
  img:"img/tracks/roadamerica.png",
  layouts:[
    {name:"Road America", img:"img/tracks/roadamerica.png"},
    {name:"Road America (Bend)", img:"img/tracks/roadamerica_bend.png"},
    {name:"Road America STT", img:"img/tracks/roadamerica_stt.png"}
  ]
},
{
  name:"Road Atlanta",
  img:"img/tracks/roadatlanta.png",
  layouts:[
    {name:"Road Atlanta", img:"img/tracks/roadatlanta.png"},
    {name:"Road Atlanta 2005", img:"img/tracks/roadatlanta_2005.png"},
    {name:"Road Atlanta 2005 Short", img:"img/tracks/roadatlanta_2005_short.png"},
    {name:"Road Atlanta Moto", img:"img/tracks/roadatlanta_moto.png"}
  ]
},
{
  name:"Salvador",
  img:"img/tracks/salvador.png",
  layouts:[
    {name:"Salvador Street Circuit", img:"img/tracks/salvador_street.png"}
  ]
},
{
  name:"Santa Cruz",
  img:"img/tracks/santacruz.png",
  layouts:[
    {name:"Santa Cruz do Sul", img:"img/tracks/santacruz_dosul.png"}
  ]
},
{
  name:"Sebring",
  img:"img/tracks/sebring.png",
  layouts:[
    {name:"Sebring", img:"img/tracks/sebring_full.png"},
    {name:"Sebring School", img:"img/tracks/sebring_school.png"},
    {name:"Sebring School STT", img:"img/tracks/sebring_school_stt.png"},
    {name:"Sebring Club", img:"img/tracks/sebring_club.png"}
  ]
},
{
  name:"Silverstone",
  img:"img/tracks/silverstone.png",
  layouts:[
    {name:"Silverstone GP", img:"img/tracks/silverstone_gp.png"},
    {name:"Silverstone International", img:"img/tracks/silverstone_international.png"},
    {name:"Silverstone National", img:"img/tracks/silverstone_national.png"},
    {name:"Silverstone 1975", img:"img/tracks/silverstone_1975.png"},
    {name:"Silverstone 1975 No Chicane", img:"img/tracks/silverstone_1975_nochicane.png"},
    {name:"Silverstone GP 2001", img:"img/tracks/silverstone_gp2001.png"},
    {name:"Silverstone International 2001", img:"img/tracks/silverstone_international2001.png"},
    {name:"Silverstone National 2001", img:"img/tracks/silverstone_national2001.png"},
    {name:"Silverstone GP 2020", img:"img/tracks/silverstone_gp2020.png"}
  ]
},
{
  name:"Snetterton",
  img:"img/tracks/snetterton.png",
  layouts:[
    {name:"Snetterton 100", img:"img/tracks/snetterton_100.png"},
    {name:"Snetterton 200", img:"img/tracks/snetterton_200.png"},
    {name:"Snetterton 300", img:"img/tracks/snetterton_300.png"}
  ]
},
{
  name:"Spa-Francorchamps",
  img:"img/tracks/spafrancorchamps.png",
  layouts:[
    {name:"Spa GP", img:"img/tracks/spafrancorchamps_gp.png"},
    {name:"Spa National", img:"img/tracks/spafrancorchamps_national.png"},
    {name:"Spa Club", img:"img/tracks/spafrancorchamps_club.png"},
    {name:"Spa Historic 1993", img:"img/tracks/spafrancorchamps_historic1993.png"},
    {name:"Spa Short", img:"img/tracks/spafrancorchamps_short.png"},
    {name:"Spa International", img:"img/tracks/spafrancorchamps_international.png"},
    {name:"Spa 1970", img:"img/tracks/spafrancorchamps_1970.png"},
    {name:"Spa 1970 1000km", img:"img/tracks/spafrancorchamps_1970_1000km.png"}
  ]
},
{
  name:"Speedland",
  img:"img/tracks/speedland.png",
  layouts:[
    {name:"Speedland Kart 1", img:"img/tracks/speedland_kart1.png"},
    {name:"Speedland Kart 2", img:"img/tracks/speedland_kart2.png"},
    {name:"Speedland Kart 3", img:"img/tracks/speedland_kart3.png"},
    {name:"Speedland Kart 4", img:"img/tracks/speedland_kart4.png"}
  ]
},
{
  name:"Spielberg",
  img:"img/tracks/spielberg.png",
  layouts:[
    {name:"Spielberg GP", img:"img/tracks/spielberg_gp.png"},
    {name:"Spielberg Short", img:"img/tracks/spielberg_short.png"},
    {name:"Spielberg Historic 1974", img:"img/tracks/spielberg_historic1974.png"},
    {name:"Spielberg Historic 1977", img:"img/tracks/spielberg_historic1977.png"},
    {name:"Spielberg STT", img:"img/tracks/spielberg_stt.png"}
  ]
},
{
  name:"Taruma",
  img:"img/tracks/taruma.png",
  layouts:[
    {name:"Tarumã International", img:"img/tracks/taruma_international.png"},
    {name:"Tarumã Chicane", img:"img/tracks/taruma_chicane.png"}
  ]
},
{
  name:"Termas de Rio Hondo",
  img:"img/tracks/termasderiohondo.png",
  layouts:[
    {name:"Termas de Río Hondo", img:"img/tracks/termasderiohondo_full.png"}
  ]
},
{
  name:"Tykki",
  img:"img/tracks/tykki.png",
  layouts:[
    {name:"Tykki Dirt 1", img:"img/tracks/tykki_dirt1.png"},
    {name:"Tykki Dirt 2", img:"img/tracks/tykki_dirt2.png"},
    {name:"Tykki RX", img:"img/tracks/tykki_rx.png"},
    {name:"Tykki Tarmac", img:"img/tracks/tykki_tarmac.png"}
  ]
},
{
  name:"Velo Citta",
  img:"img/tracks/velocitta.png",
  layouts:[
    {name:"Velo Città", img:"img/tracks/velocitta.png"},
    {name:"Velo Città Track Day", img:"img/tracks/velocitta_trackday.png"},
    {name:"Velo Città Club Day", img:"img/tracks/velocitta_clubday.png"}
  ]
},
{
  name:"Velopark",
  img:"img/tracks/velopark.png",
  layouts:[
    {name:"Velopark 2010", img:"img/tracks/velopark_2010.png"},
    {name:"Velopark 2017", img:"img/tracks/velopark_2017.png"},
    {name:"Velopark 2017 STT", img:"img/tracks/velopark_2017_stt.png"}
  ]
},
{
  name:"Virginia International Raceway",
  img:"img/tracks/virginiair.png",
  layouts:[
    {name:"VIR Full", img:"img/tracks/virginia_full.png"},
    {name:"VIR Grand", img:"img/tracks/virginia_grand.png"},
    {name:"VIR North", img:"img/tracks/virginia_north.png"},
    {name:"VIR Patriot", img:"img/tracks/virginia_patriot.png"},
    {name:"VIR South", img:"img/tracks/virginia_south.png"}
  ]
},
{
  name:"Watkins Glen",
  img:"img/tracks/watkinsglen.png",
  layouts:[
    {name:"Watkins Glen GP", img:"img/tracks/watkinsglen_gp.png"},
    {name:"Watkins Glen GP (Inner Loop)", img:"img/tracks/watkinsglen_gp_innerloop.png"},
    {name:"Watkins Glen Short", img:"img/tracks/watkinsglen_short.png"},
    {name:"Watkins Glen Short (Inner Loop)", img:"img/tracks/watkinsglen_short_innerloop.png"},
    {name:"Watkins Glen STT", img:"img/tracks/watkinsglen_stt.png"}
  ]
}
];

// ====== CAMPEONATOS ======
const championships = {};
// Se inicializa dinámicamente al abrir cada categoría