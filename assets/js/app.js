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
  //On document ready the radio buttons will be visible and the table that the API properties will populate will remain hidden.
  $(".first-page").show();
  $("#second-container").hide();

  // when form is submitted the API call will be made

  $("#search-form").on("submit", function(event) {
    event.preventDefault();
    var apiKey = "39a2a8a2";
    var $search = $("#search-input").val();
    var omdbURL ="https://www.omdbapi.com/?t=" + $search + "&y=&plot=short&apikey=" + apiKey;
    var edamamURL = "";
    var queryURL = "";

    // The API called is dependent on whether the movie radio id ("#customerRadioInLine1") or the food radio id ("#customRadioInline2") is selected.
    if ($("#customRadioInline1").is(":checked")) {
      queryURL = omdbURL;
    } else if ($("#customRadioInline2").is(":checked")) {
      queryURL = edamamURL;
    } else {
      //form validation
    }
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {

     //Once the ajax call is made we can hide the radio buttons and show the table that the API is populating.

      $(".first-page").hide();
      $("#second-container").show();
      var data = response;
      
      //this conditional is in preparation for future reverse search functionality
      if ((queryURL = omdbURL)) {
        var $newMovie = $("<tr>");

        $newMovie
          .append(`<td scope="row">${data.Title}</td>`)
          .append(`<td scope="row">${data.Plot}</td>`)
          .append(`<td scope="row"><img src=${data.Poster}></td>`);
        $("tbody").prepend($newMovie);

      } else {
        //Writing this code out in case we get to the reverse search features

        // var newRecipe = $("<tr>");
        // newRecipe
        //   .append(`<td scope="row">${data}</td>`)
        //   .append(`<td scope="row">${data}</td>`)
        //   .append(`<td scope="row"><img src=${data}></td>`);
        // $("tbody").prepend(newMovie);
      }
    });
  });
});
