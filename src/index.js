
var weatherIconsMap = {
  "clear-day" : "wi-day-sunny",
  "clear-night" : "wi-night-clear",
  "rain": "wi-rain",
  "snow": "wi-snow",
  "sleet": "wi-sleet",
  "wind": "wi-strong-wind",
  "fog": "wi-fog",
  "cloudy": "wi-cloudy",
  "partly-cloudy-day": "wi-day-cloudy" ,
  "partly-cloudy-night": "wi-night-alt-cloudy"
}

var appID = "99db2948b09ef071cc81649ff6b66cde"

var vrvToolkit = new verovio.toolkit();
var currentMov = "dry"
var vrvPage = 1;
var startMeasure = -1;
var meiData;
var anacrusis = false;
var highlightRdgs = false;

function getMeasureFromHash(hash) {
  startMeasure = parseInt(window.location.hash.substring(2)), 1;
  var min = anacrusis ? 0 : 1;
  return startMeasure = Math.max(startMeasure, min);
}

if (window.location.hash) {
    if (window.location.hash.match(/^#m\d+$/) ) {
      getMeasureFromHash(window.location.hash);
    }
}

$(window).on('hashchange', function(){
  if (window.location.hash.match(/^#m\d+$/) ) {
    getMeasureFromHash(window.location.hash);
    var sMeasure = anacrusis ? startMeasure : startMeasure - 1;
    redrawAtMeasure(sMeasure)
  }
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeatherForPos);
} else {
    $("html") = "Geolocation is not supported by this browser.";
}

$(document).ready(function(){

  addResponsiveFeatures();
  $(window).on("resize orientationchange", function(){
      addResponsiveFeatures()
      redoLayout()
  });

  $(window).click(closeMenus);

  $("#showClearDay").click(function(e){
    e.preventDefault();
    currentMov = 'dry'
    getWeatherFor(navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,'dry')}));
  })

  $("#showOverCastRainyNight").click(function(e){
    e.preventDefault();
    currentMov = 'wet'
    getWeatherFor(navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,'wet')}));
  })

  $("#prevArea").click(prevPage);

  $("#nextArea").click(nextPage);

  $("#set-cancel").click(function(e){
    $("#settings-cnt").collapse("toggle")
    // return to location based score
    clearHash();
    navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,currentMov)});
  });

  $("#set-close").click(function(){
    $("#settings-cnt").collapse("toggle")
  })

  $("#set-confirm").click(function(){
    $("#settings-cnt").collapse("toggle")
    // re-render with given parameters
    var movement = $("#selMov").find(":selected").val();
    var time = $("#set-time").find(":checked").val();
    var time_label = wind
    var wind = $("#set-wind").find(":checked").val();
    var wind_label = {
      "W0": 'no wind',
      "W0to11": "low",
      "W11to25": "mild",
      "Wgt26": "high"
    }
    var cloud = $("#set-cloud").find(":checked").val();
    var winddir = $("#set-winddir").find(":checked").val();
    var temp = $("#set-temp").find(":checked").val();
    var temp_label = {
      "Tlt42": "low",
      "T42to79": "mild",
      "Tgt80": "high"
    }
    // update info
    $("#weather-ico").removeClass().addClass("wi")
    var mov_icon = {
      "dry-day": "wi-day-sunny",
      "dry-night": "wi-night-clear",
      "wet-day" : "wi-rain",
      "wet-night" : "wi-rain"
    }
    $("#weather-ico").addClass(mov_icon[movement+'-'+time])
    $("#location").text("no location (manual settings)")
    $("#temp").text(temp_label[temp]);
    $("#wind").text(wind_label[wind]);
    var extras = {
      windBearing: winddir,
      cloud: cloud
    }
    // Adjust wind
    if (wind === "W0") {
      extras.windBearing = wind
      wind = "W0to11"
    }
    // render
    renderScoreWithSource(movement, "-"+time+wind+temp, time, extras)
  })

  $("#locchange").click(function(e) {
    e.stopPropagation();
    $(this).addClass("locin-hide");
    $("#mm_dropdown").addClass("locin-hide");
    $("#locinput").addClass("locin-show").find("input").focus();
  })

  $("#locinput input").click(function(e){
    e.stopPropagation();
  });

  $("#locinput .btn").click(function(e){
    e.stopPropagation();
    clearHash();
    var newLoc = $("#locinput input").val()
    newLoc = newLoc ? newLoc : $("#locinput input").attr("placeholder");
    if (!newLoc) {
      navigator.geolocation.getCurrentPosition(function(p){getWeatherForPos(p,currentMov)});
    }
    else {
      getWeatherFor(newLoc);
    }
    closeMenus();
  });

})

function clearHash() {
  // clear hash
  // (eventually you could determine the first measure and updated it accordingly)
  window.location.hash = "";
}

function higlightRdgs() {
  $(".rdg").addClass("svg-highlighted");
}

function adjustPageAreaControls() {
  $(".pageAreaControl").height($("#output").height());
}

function closeMenus(e) {
  $("#info-rest").removeClass('info-stack');
  $("#locchange").removeClass("locin-hide");
  // $("#mm_dropdown").removeClass("locin-hide");
  $("#locinput").removeClass("locin-show");
}

function addResponsiveFeatures(){
  if ( $(window).width() < 1024) {
    $("#weather").off();
    $("#weather").click(function(e){
      e.stopPropagation();
      if ($("#info-rest").hasClass('info-stack')){
          $("#info-rest").removeClass('info-stack');
          $("#info-rest").height("0px")
      }
      else {
        $("#info-rest").addClass('info-stack');
        $("#info-rest").height("106px")
      }
    });
  }
  else {
    $("#info-rest").removeClass('info-stack');
  }
}

function redoLayout(){
  clearHash();
  setOptions();
  var measure = 0;
  if (vrvPage != 1) {
      measure = $("#output .measure").attr("id");
  }

  vrvToolkit.redoLayout();

  page = 1;
  if (measure != 0) {
      page = vrvToolkit.getPageWithElement(measure);
  }
  renderPage(page);
}

function bindPageControls(){
  $(window).keyup(function(event){
       // We need to make sure not to capture event on text fields
       if ( $(event.target).hasClass('form-control') ) {
           return;
       }
       if ( event.ctrlKey && (event.keyCode == 37 || event.keyCode == 33) ) {
           renderPage(1);
       }
       else if ( event.keyCode == 37 || event.keyCode == 33 ) {
           prevPage();
       }
       else if ( event.ctrlKey && (event.keyCode == 39 || event.keyCode == 34) ) {
           renderPage(vrvToolkit.getPageCount());
       }
       else if ( event.keyCode == 39  || event.keyCode == 34) {
           nextPage();
       }
   });
}

function getWeatherForPos(position, movement) {
  movement = movement ? movement : currentMov
  var api = "https://api.darksky.net/forecast/"
  var lat = position.coords.latitude
  var lon = position.coords.longitude

 $.ajax({
   url: api+appID+"/"+lat+","+lon,
   method: 'GET',
   dataType: "jsonp"
 }).done(function(data){
   var source = getSourceName(data)
   var extras = getSourceExtras(data)
   renderScoreWithSource(movement, source, getTime(data), extras)
   updateInfo(movement, data)
 })
}

function getTime(data) {
  console.log(data.currently)
  var now = data.currently.time
  var sunrise = data.daily.data[0].sunriseTime
  var sunset = data.daily.data[0].sunsetTime
  if (sunrise <= now && now < sunset) {
    return 'day'
  } else {
    return 'night'
  }
}

function getSourceName(data){

  var timeDay = '-'+getTime(data)

  var source = timeDay
  var w = data.currently.windSpeed
  if (w <= 11) {
    source += "W0to11"
  }
  else if (w > 11 && w <= 25) {
    source += "W11to25"
  }
  else if (w > 26) {
    source += "Wgt26"
  }
  else source += "W0to11"

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
  else source += "Tlt42"

  return source
}

function getSourceExtras(data){
  var extras = {}
  if (data.currently.windSpeed > 0) {
    var w = data.currently.windBearing
    if (315 < w && w <= 360 || 0 <= w && w <= 45) {
      extras.windBearing = 'Wnorth'
    } else if (45 < w && w <= 135) {
      extras.windBearing = 'Weast'
    } else if (135 < w && w <= 225) {
      extras.windBearing = 'Wsouth'
    } else if (225 < w && w <= 315) {
      extras.windBearing = 'Wwest'
    }
  }
  if (data.currently.cloudCover > 0) {
    var c = data.currently.cloudCover
    if (0 < c && c <= 0.1) {
      extras.cloud = 'C0to10'
    } else if (0.1 < c && c <= 0.25) {
      extras.cloud = 'C11to25'
    } else if (0.25 < c && c <= 0.5) {
      extras.cloud = 'C26to50'
    } else if (0.5 < c && c <= 0.75) {
      extras.cloud = 'C51to75'
    } else if (0.75 < c && c <= 1) {
      extras.cloud = 'C76to100'
    }
  }
  return extras
}

function getWeatherFor(query, movement) {
  movement = movement ? movement : currentMov
  $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+query+".json?access_token=pk.eyJ1IjoicmFmZmF6aXp6aSIsImEiOiJNUlY2OG9zIn0.NycTsYGAcmacq2LrIvtU6A", function(geodata){
    var position = { coords: {
      latitude: geodata.features[0].geometry.coordinates[1],
      longitude: geodata.features[0].geometry.coordinates[0]
    } }
    getWeatherForPos(position)
  })
}

function updateInfo(movement, data){
  $("#loading").show();
  var source = getSourceName(data);
  console.log(data.latitude, data.longitude)
  // Get location name
  $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/"+data.longitude+","+data.latitude+".json?access_token=pk.eyJ1IjoicmFmZmF6aXp6aSIsImEiOiJNUlY2OG9zIn0.NycTsYGAcmacq2LrIvtU6A", function(geodata){
    var loctext = []
    for (i=0; i<geodata.features[0].context.length; i++){
      var locid = geodata.features[0].context[i].id;
      if (locid.startsWith('place')
        | locid.startsWith('region')
        | locid.startsWith('country')) {
       loctext.push(geodata.features[0].context[i].text)
      }
      // Remove region if repeated
      if (loctext[0] == loctext[1]) {
        loctext.splice(1, 1)
      }

    }
    $("#location").html(loctext.join(", "))
      .attr("title", loctext)
  })
  $("#weather-ico").removeClass().addClass("wi")
  $("#weather-ico").addClass(weatherIconsMap[data.currently.icon])
    .attr("title", data.currently.icon.replace(/-/g, " "))
  $("#wind").text(data.currently.windSpeed + "mph")
  $("#temp").text(Math.floor(data.currently.temperature) + " °F")
}

function setOptions() {
  var options = JSON.stringify({
      pageWidth: $("body").width() * 100 / 36,
      pageHeight: ($(window).height() - $( "#mainNav" ).height() - 20) * 100 / 40, //$(document).height() * 100 / 40,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 50,
      scale: 35
   });
  vrvToolkit.setOptions(options);
}

function renderScoreWithSource(movement, source, time, extras){
  $("#output").empty()

  console.log("#"+movement+source, extras)

  var extraPath = ''
  if (Object.keys(extras).length > 0){
    for (var extra in extras) {
      extraPath += " or contains(@source, '#" + movement + '-' + time + extras[extra] + "')"
    }
  }

  setOptions();
  var options = JSON.stringify({
      appXPathQuery: "./rdg[contains(@source, '#"+movement+source+"')"+extraPath+"]"
   });
  vrvToolkit.setOptions(options);

  $.get( "data/"+movement+".xml", function( data ) {
      vrvToolkit.loadData( data + "\n", "");
      meiData = $.parseXML((vrvToolkit.getMEI(null, 1)));
      bindPageControls();
      renderPage(1);

  }, 'text');
}

function redrawAtMeasure(sMeasure){
  var measures = $(meiData).find("measure");
  sMeasure = sMeasure >= measures.length ? measures.length-1 : sMeasure;
  var measure = measures.get(sMeasure).getAttribute("xml:id");
  vrvPage = vrvToolkit.getPageWithElement(measure);
  renderPage(vrvPage);
  $("#"+measure).css({"fill": "#dbcdbf", "stroke": "#dbcdbf", transition: "0.5s"})
  setTimeout(function(){$("#"+measure).css({"fill": "#000", "stroke": "#000", transition: "1s"});}, 800)
}

function renderPage(page) {
  $("#loading").show();
  var svg = vrvToolkit.renderPage(page);
  $("#loading").hide();
  $("#output").html(svg);
  adjustPageAreaControls();
}

function nextPage() {
  if (vrvPage+1 <= vrvToolkit.getPageCount()) {
    clearHash();
    vrvPage = vrvPage+1
    renderPage(vrvPage)
    if (highlightRdgs) higlightRdgs()
  }
}

function prevPage() {
  if (vrvPage-1 >0) {
    clearHash();
    vrvPage = vrvPage-1
    renderPage(vrvPage)
    if (highlightRdgs) higlightRdgs()
  }
}
