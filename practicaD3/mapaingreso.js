// Clon de Gapminder
//
//

graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
  top: 30,
  left: 20,
  right: 15,
  bottom: 20
}
ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// Area total de visualización
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

// Contenedor "interno" donde van a estar los gráficos
g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

fontsize = alto * 0.65
yearDisplay = g.append('text')
                .attr('x', ancho / 2)
                .attr('y', alto / 2 + fontsize/2)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'Roboto')
                .attr('font-size', `${fontsize}px`)
                .attr('fill', '#cccccc')
                .text('1800')

g.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', ancho)
  .attr('height', alto)
  .attr('stroke', 'black')
  .attr('fill', 'none')

g.append('clipPath')
  .attr('id', 'clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ancho)
    .attr('height', alto)

// Escaladores
x = d3.scaleLog().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
r = d3.scaleLinear().range([10, 100])

color = d3.scaleOrdinal().range(['#cc2a14', '#1a7a3d', '#90be6d', '#577590'])

// Variables Globales
datos = []
years = []
iyear = 0
maxy  = 0
miny  = 50000
continente = 'todos'
corriendo  = true

var interval

contSelect = d3.select('#continente')
botonPausa = d3.select('#pausa')
slider     = d3.select('#slider');

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .center([0, 5 ])
    .scale(150)
    .rotate([-180,0]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

// load and display the World
d3.json("world-110m2.json").then(function(topology) {

    // load and display the cities
    d3.csv("cities.csv").then(function(data) {
        g.selectAll("circle")
           .data(data)
           .enter()
           .append("a")
			    	  .attr("xlink:href", function(d) {
				    	  return "https://www.google.com/search?q="+d.city;}
		    		  )
           .append("circle")
           .attr("cx", function(d) {
                   return projection([d.lon, d.lat])[0];
           })
           .attr("cy", function(d) {
                   return projection([d.lon, d.lat])[1];
           })
           .attr("r", 5)
           .style("fill", "red");
    });

    g.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries)
           .features)
       .enter().append("path")
       .attr("d", path);

});

var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function() {
          g.selectAll('path')
           .attr('transform', d3.event.transform);
          g.selectAll("circle")
           .attr('transform', d3.event.transform);
});

svg.call(zoom);

function frame() {
  year = years[iyear]
  data = d3.filter(datos, d => d.year == year)
  data = d3.filter(data, d => {
    if (continente == 'todos')
      return true
    else
      return d.continent == continente
  })

  slider.node().value = iyear
  render(data)
}

function render(data) {
  yearDisplay.text(years[iyear])

  p = g.selectAll('circle')
        .data(data, d => d.country)

  p.enter()
    .append('circle')
      .attr('r', 0)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('fill', '#005500')
      .attr('clip-path', 'url(#clip)')
      .attr('stroke', '#333333')
      .attr('fill-opacity', 0.75)
    .merge(p)
      .transition().duration(600)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('r', d => r(d.population))
      .attr('fill', d => color(d.continent))

  p.exit()
    .transition().duration(600)
    .attr('r', 0)
    .attr('fill', '#ff0000')
    .remove()
}

// function atras() {
//   iyear--
//   if (iyear < 0) iyear = 0
//   frame()
// }

// function adelante() {
//   iyear++
//   if (iyear == years.lenght) iyear = years.lenght
//   frame()
// }

// Refactoring de las funciones de arriba
// DRY Don't Repeat Yourself

function delta(d) {
  iyear += d
  console.log(iyear)

  if (iyear < 0) iyear = years.length-1
  if (iyear > years.length-1) iyear = 0
  frame()
}

contSelect.on('change', () => {
  continente = contSelect.node().value
  frame()
})

botonPausa.on('click', () => {
  corriendo = !corriendo
  if (corriendo) {
    botonPausa
      .classed('btn-danger', true)
      .classed('btn-success', false)
      .html('<i class="fas fa-pause-circle"></i>')
      interval = d3.interval(() => delta(1), 600)
  } else {
    botonPausa
      .classed('btn-danger', false)
      .classed('btn-success', true)
      .html('<i class="fas fa-play-circle"></i>')
    interval.stop()
  }
})

slider.on('input', () => {
  // d3.select('#sliderv').text(slider.node().value)
  iyear = +slider.node().value
  frame()
})

slider.on('mousedown', () => {
  if (corriendo) interval.stop()
})

slider.on('mouseup', () => {
  if (corriendo) interval = d3.interval(() => delta(1), 600)
})
