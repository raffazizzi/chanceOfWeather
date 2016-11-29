


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

$(document).ready(function(){
 $("#changeWeather").click(function(e){
   e.preventDefault();
   var newLoc = $("#newLoc").val()
   if (!newLoc) {
     navigator.geolocation.getCurrentPosition(getWeatherForPos);
   }
   else {
     getWeatherFor(newLoc);
   }
 })
})

function getWeatherForPos(position) {
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
  renderScoreWithSource(source)
  updateInfo(data)
})
}

function getWeatherFor(query) {
 $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+query+".json?access_token=pk.eyJ1IjoicmFmZmF6aXp6aSIsImEiOiJNUlY2OG9zIn0.NycTsYGAcmacq2LrIvtU6A", function(geodata){
   var position = {
     coords : {
       latitude: geodata.features[0].geometry.coordinates[1],
       longitude : geodata.features[0].geometry.coordinates[0]
     }
   }
   getWeatherForPos(position)
 })
}

function getSourceName(data){
  var source = "#clear-day" //Eventually: data.currently.icon
  var w = data.currently.windSpeed
  if (w <= 11) {
    source += "W0to11"
  }
  else if (w > 11 && t <= 25) {
    source += "W11to25"
  }
  else if (w > 26) {
    source += "Wgt26"
  }

  var t = data.currently.temperature
  if (t < 42) {
    source += "Tlt42"
  }
  else if (t >= 42 && t <= 79) {
    source += "T42to79"
  }
  else if (t > 79) {
    source += "Tgt80"
  }
  return source
}

function updateInfo(data){
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
 $("#weather").text(data.currently.icon + " (currently showing Clear Day score only)")
 // $("#weather").html("<img title='"+data.weather[0].description+"' height='30' width='30' src='http://openweathermap.org/img/w/"+data.weather[0].icon+".png'/>")
 $("#wind").text(data.currently.windSpeed)
 $("#temp").text(data.currently.temperature)
}

function renderScoreWithSource(source){
  console.log(source)
 $("#output").empty()
  var options = JSON.stringify({
         pageWidth: $(document).width() * 100 / 36,
         pageHeight: $(document).height() * 100 / 40, //$(document).height(),
         ignoreLayout: 1,
         adjustPageHeight: 1,
         border: 50,
         scale: 35,
         appXPathQuery: "./rdg[contains(@source, '"+source+"')]"
     });
     vrvToolkit.setOptions(options);

 $.get( "data/chanceOfWeather.xml", function( data ) {
     vrvToolkit.loadData( data + "\n", "");
     var pgs = vrvToolkit.getPageCount();
     // var svg = vrvToolkit.renderPage(1);

     $("#output").append(svg);
     for (var i = 1; i <= pgs; i++){
         var svg = vrvToolkit.renderPage(i);

         $("#output").append(svg);
         $("#loading").hide();
     }
 }, 'text');
}


// $(document).ready(function(){
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
//     $.get( "data/chanceOfWeather.xml", function( data ) {
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
