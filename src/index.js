


//var weatherSlursMap = {
//  "clear-day" : "#A",
//  "clear-night" : "#A",
//  "rain": "#S",
//  "snow": "#B",
//  "sleet": "#B",
//  "wind": "#S",
//  "fog": "#S",
//  "cloudy": "#FE",
//  "partly-cloudy-day": "#FE" ,
//  "partly-cloudy-night": "#FE"
//}
//
//var sourceNames = {
//  "#A" : "Mozart Autograph (1783)",
//  "#FE" : "First Edition (1784)",
//  "#S" : "Saint-Saëns (1915)",
//  "#B" : "Bartók (1911)"
//}
//
var appID = "99db2948b09ef071cc81649ff6b66cde"

if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(getWeatherForPos);
} else {
   $("html") = "Geolocation is not supported by this browser.";
}

var vrvToolkit = new verovio.toolkit();
var currentMov = "clear-day"

$(document).ready(function(){
 $("#changeWeather").click(function(e){
   e.preventDefault();
   var newLoc = $("#newLoc").val()
   if (!newLoc) {
     navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,currentMov)});
   }
   else {
     getWeatherFor(newLoc);
   }
 })

 $("#showClearDay").click(function(e){
   e.preventDefault();
   currentMov = 'clear-day'
   getWeatherFor(navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,'clear-day')}));
 })

 $("#showOverCastRainyNight").click(function(e){
   e.preventDefault();
   currentMov = 'overcast-rainy-night'
   getWeatherFor(navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,'overcast-rainy-night')}));
 })

})

function getWeatherForPos(position, movement) {
 movement = movement ? movement : currentMov
 var api = "https://api.darksky.net/forecast/"
 var lat = position.coords.latitude
 var lon = position.coords.longitude

 console.log(lat, lon)

$.ajax({
  url: api+appID+"/"+lat+","+lon,
  method: 'GET',
  dataType: "jsonp"
}).done(function(data){
  var source = getSourceName(data)
  renderScoreWithSource(movement, source)
  updateInfo(movement, data)
})
}

function getWeatherFor(query, movement) {
  movement = movement ? movement : currentMov
 $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+query+".json?access_token=pk.eyJ1IjoicmFmZmF6aXp6aSIsImEiOiJNUlY2OG9zIn0.NycTsYGAcmacq2LrIvtU6A", function(geodata){
   var position = {
     coords : {
       latitude: geodata.features[0].geometry.coordinates[1],
       longitude : geodata.features[0].geometry.coordinates[0]
     }
   }
   getWeatherForPos(position, movement)
 })
}

function getSourceName(data){

  var source = "" //Eventually: data.currently.icon
  var w = data.currently.windSpeed
  if (w > 11 && w <= 25) {
    source += "W11to25"
  }
  else if (w > 26) {
    source += "Wgt26"
  }
  else {
    source +"W0to11"
  }

  var t = data.currently.temperature
  if (t >= 42 && t <= 79) {
    source += "T42to79"
  }
  else if (t > 79) {
    source += "Tgt80"
  }
  else {
    source += "Tlt42"
  }

  return source
}

function updateInfo(movement, data){
 $("#loading").show();

 getSourceName(data);

 // Get location name
 $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+data.longitude+","+data.latitude+".json?access_token=pk.eyJ1IjoicmFmZmF6aXp6aSIsImEiOiJNUlY2OG9zIn0.NycTsYGAcmacq2LrIvtU6A", function(geodata){
   var loctext = ""
   for (i=0; i<geodata.features[0].context.length; i++){
     loctext += geodata.features[0].context[i].text + " "
   }
   $("#location").text(loctext)
 })
 $("#weather").text(data.currently.icon + " (Sample version is actually showing "+ movement +")")
 // $("#weather").html("<img title='"+data.weather[0].description+"' height='30' width='30' src='http://openweathermap.org/img/w/"+data.weather[0].icon+".png'/>")
 $("#wind").text(data.currently.windSpeed)
 $("#temp").text(data.currently.temperature)
}

function renderScoreWithSource(movement, source){
 console.log(movement, source)
 console.log("./rdg[contains(@source, '#"+movement+source+"')]")

  $("#output").empty()
   var options = JSON.stringify({
          pageWidth: $(document).width() * 100 / 36,
          pageHeight: $(document).height() * 100 / 40,
          ignoreLayout: 1,
          adjustPageHeight: 1,
          border: 50,
          scale: 35,
          appXPathQuery: "./rdg[contains(@source, '#"+movement+source+"')]"
      });
      vrvToolkit.setOptions(options);

  $.get( "data/"+movement+".xml", function( data ) {
      vrvToolkit.loadData( data + "\n", "");
      var pgs = vrvToolkit.getPageCount();
      // var svg = vrvToolkit.renderPage(1);

      $("#output").append(svg);
      for (var i = 1; i <= pgs; i++){
          var svg = vrvToolkit.renderPage(i);

          $("#output").append(svg);
          $("#loading").hide();
      }
      postRendering();
  }, 'text');
}

function postRendering(source) {
}

 // $(document).ready(function(){
 // var vrvToolkit = new verovio.toolkit();
 //     $("#output").empty()
 //     var options = JSON.stringify({
 //       pageWidth: $(document).width() * 100 / 36,
 //       pageHeight: $(document).height() * 100 / 40, //$(document).height(),
 //       ignoreLayout: 1,
 //       adjustPageHeight: 1,
 //       border: 50,
 //       scale: 35
 // //          appXPathQuery: "./rdg[contains(@source, '"+source+"')]"
 //   });
 //   vrvToolkit.setOptions(options);
 //
 //     $.get( "data/Overcast_Rainy_Night.xml", function( data ) {
 //       vrvToolkit.loadData( data + "\n", "");
 //       var pgs = vrvToolkit.getPageCount();
 //       // var svg = vrvToolkit.renderPage(1);
 //
 //       $("#output").append(svg);
 //       for (var i = 1; i <= pgs; i++){
 //           var svg = vrvToolkit.renderPage(i);
 //
 //           $("#output").append(svg);
 //           $("#loading").hide();
 //       }
 //     }, 'text');
 // })
