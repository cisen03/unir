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