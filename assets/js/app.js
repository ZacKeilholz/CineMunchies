//JS Setup Functions (Firebase, etc)
//=================================

//Global Vars
//=================================

//Jquery HTML Targets
//=================================

//var $exampleTarget = $("#example-container");

//Misc. Functions
//=================================

//JQuery Events / Event Listeners
//=================================

$(document).ready(function() {
  $("#search-form").on("submit", function(event) {
    event.preventDefault();
    var apiKey = "39a2a8a2";
    var $search = $("#search-input").val();
    var omdbURL =
      "https://www.omdbapi.com/?t=" +
      $search +
      "&y=&plot=short&apikey=" +
      apiKey;
    var edamamURL = "";
    var queryURL = "";
    if ($("#customRadioInline1").is(":checked")) {
      queryURL = omdbURL;
    } else if ($("#customRadioInline2").is(":checked")) {
      queryURL = edamamURL;
    } else{
       //FORM VALIDATION INFO?  
    }
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      var data = response;
      var newMovie = $("<tr>");

      newMovie
        .append(`<td scope="row">${data.Title}</td>`)
        .append(`<td scope="row">${data.Plot}</td>`)
        .append(`<td scope="row"><img src=${data.Poster}></td>`);

      $("tbody").prepend(newMovie);
      console.log(data.Title, data.Plot);
    });
  });
});
