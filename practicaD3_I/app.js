// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 30, left: 50, right: 15, bottom: 120 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.3)

color = d3.scaleOrdinal()
          // .range(['red', 'green', 'blue', 'yellow'])
          // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
          .range(d3.schemeDark2)

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .text('Población por Continente')
          .attr('class', 'titulo-grafica')

dataArray = []

// (1) Variables globales para determinar que mostrar y
//     poder obtener los datos del select
region = 'todas'
regionSelect = d3.select('#region')

metrica = 'oficial'
metricaSelect = d3.select('#metrica')

ascendente = false

// III. render (update o dibujo)
function render(data) {
  // function(d, i) { return d }
  // (d, i) => d
  bars = g.selectAll('rect')
            .data(data, d => d.edificio)

  bars.enter()
      .append('rect')
        .style('width', '0px')
        .style('height', '0px')
        .style('y', `${y(0)}px`)
        .style('fill', '#000')
        .style('x', d => x(d.edificio) + 'px')
      .merge(bars)
        .transition()
        // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe
        // .ease(d3.easeElastic)
        .duration(2000)
          .style('x', d => x(d.edificio) + 'px')
          .style('y', d => (y(d[metrica])) + 'px')
          .style('height', d => (alto - y(d[metrica])) + 'px')
          .style('fill', d => color(d.region))
          .style('width', d => `${x.bandwidth()}px`)

  bars.exit()
      .transition()
      .duration(2000)
        .style('height', '0px')
        .style('y', d => `${y(0)}px`)
        .style('fill', '#000000')
      .remove()


  yAxisCall = d3.axisLeft(y)
                .ticks(3)
                .tickFormat(d => d + ((metrica == 'oficial') ? 'm.' : ''))
  yAxisGroup.transition()
            .duration(2000)
            .call(yAxisCall)

  xAxisCall = d3.axisBottom(x)
  xAxisGroup.transition()
            .duration(2000)
            .call(xAxisCall)
            .selectAll('text')
            .attr('x', '-8px')
            .attr('y', '-5px')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
}

// IV. Carga de datos
//d3.csv('D:\devenv\Unir\Visual\main\practicaD3_I\poblacionCiudades.csv')
d3.csv('poblacionCiudades.csv')
.then(function(data) {
  data.forEach(d => {
    d.pais = +d.pais
    d.cuidad = +d.cuidad
    d.poblacion = +d.poblacion
  })

  dataArray = data

  //color.domain(data.map(d => d.region))

  // <select>
  //   <option value="x">despliega</option>
  // </select>
  regionSelect.append('option')
              .attr('value', 'todas')
              .text('Todas')
  color.domain().forEach(d => {
    console.log(d)
    regionSelect.append('option')
                .attr('value', d)
                .text(d)
  })

  // V. Despliegue
  frame()
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

function frame() {
  dataframe = dataArray
  //if (region != 'todas') {
  //  dataframe = d3.filter(dataArray, d => d.region == region)
  //}

  //dataframe.sort((a, b) => {
  //  return ascendente ? d3.ascending(a[metrica], b[metrica]) : d3.descending(a[metrica], b[metrica])
    //
    // Es equivalente a...
    //
    // return ascendente ? a[metrica] - b[metrica] : b[metrica] - a[metrica]
  //})

  // Calcular la altura más alta dentro de
  // los datos (columna "oficial")
  maxy = d3.max(dataframe, d => d[metrica])
  // Creamos una función para calcular la altura
  // de las barras y que quepan en nuestro canvas
  y.domain([0, maxy])
  x.domain(dataframe.map(d => d.edificio))

  render(dataframe)
}

regionSelect.on('change', () => {
  region = regionSelect.node().value
  frame()
})

metricaSelect.on('change', () => {
  metrica = metricaSelect.node().value
  frame()
})

function cambiaOrden() {
  ascendente = !ascendente
  frame()
}
// give variables global scope to not have to nest function definitions
var canvas, heightMatchObject, widthMatchObject, margins, bar, maxDrawingValues
var incomingData, buttonKeys

//-------------------------------------------------------------------//
//                                                                   //
//                                                                   //
//                     VISUALIZATION FUNCTIONS                       //
//                                                                   //
//                                                                   //
//-------------------------------------------------------------------//
// Load and parse JSON
function loadData() {
  d3.json("cityData.json", function(error, data) {
      incomingData = data
      visualizeData()
  })
}


//-------------------------------------------------------------------//
//                                                                   //
//                         MAKE BAR CHART                            //
//                                                                   //
//-------------------------------------------------------------------//
// Make the entire bar chart - sets up various canvas relate parameters
// such as margins and selected data. Can be called during screen
// resize to get a new chart that fits in the alloted space
function visualizeData() {
// Default canvas sizes
canvas = {
    "x": hyperParameters.canvas.x,
    "y": hyperParameters.canvas.y
};

// Update canvas size if size matching is specified
heightMatchObject = document.getElementById(hyperParameters.canvas.match.y);
widthMatchObject = document.getElementById(hyperParameters.canvas.match.x);
if (heightMatchObject != null) {canvas.y = heightMatchObject.clientHeight};
if (widthMatchObject != null) {canvas.x = widthMatchObject.clientWidth};

// Margins
margins = {
  "x": {
    "left": canvas.x * 0.04,
    "right": canvas.x * 0.08
  },
  "y": {
    "top": canvas.y * 0.04,
    "bottom": canvas.y * 0.04
  },
  "title": hyperParameters.fonts.title.size * 2,
  "buttons": hyperParameters.fonts.buttons.size * 2,
  "axes": {
    "x": hyperParameters.fonts.axes.size * hyperParameters.fonts.axes.maxCharacters.x,
    "y": 40
  }
}

// Max free values to draw chart in
maxDrawingValues = {
    "x": canvas.x - margins.x.left - margins.x.right - margins.axes.y,
    "y": canvas.y - margins.y.top - margins.y.bottom - margins.axes.x - margins.title - margins.buttons
};

// bar parameters. Bar.width will be calculated later
bar = {
    "spacing": 2 // spacing between bars
};

// If buttons already exist then clear everything and start from scratch
// Add an window listener event for window resizing to make sure the chart is always
// the perfect size
if (!d3.selectAll("g.buttonsGroup").empty()) {
    d3.select("svg").selectAll("g").remove()
}

// Make group for the entire chart
d3.select("svg")
  .attr("perserveAspectRatio", "xMinYMid meet") // allows SVG scaling
  .attr("viewBox", "0 0 " + canvas.x.toString() + " " + canvas.y.toString())
  .classed("svg-content-responsive", true)
  .append("g")
  .attr("id", "chartGroup")
  .data(incomingData)

// Make buttons for each key in JSON
buttonKeys = d3.keys(incomingData)

// Default chart drawn is first of all data. If from resizing then it will matain
// the data the user already selected
if (hyperParameters.data.selected == "None") {
  hyperParameters.data.selected = buttonKeys[0]
  var maxY = d3.max(incomingData[hyperParameters.data.selected], function(d) {return d[hyperParameters.data.y]})
  margins.axes.y = maxY.toString().length * hyperParameters.fonts.axes.size
  maxDrawingValues.x = canvas.x - margins.x.left - margins.x.right - margins.axes.y
}

// buttons are made first as they may require an increase in margin
makeButtons(buttonKeys)
// Adds title, axes and bars
drawChart(hyperParameters.data.selected)
}