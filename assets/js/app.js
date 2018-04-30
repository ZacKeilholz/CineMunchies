//Global Vars
//=================================

var apiKey = "39a2a8a2";

//Jquery HTML Targets
//=================================

//Use this switch case for showing/hiding containers when pages change during on-click events
function showHideSwitch(param) {
  switch (param) {
    
    //Page 1 Initial Search page
    case (1):
    $("#first-page-search").show();
    $("#second-page-search,#third-container,#movie-results-container").hide();
    
    
    break;
    
    //Page 2- Movie search input has been entered and submitted
    case (2):
    
    $("#first-page-search").hide();
    $("#second-page-search,#movie-results-container").show();
    
    break;
    
    //Page 3 - Movie search result has been clicked
    case (3):
    $("#second-page-search,#movie-results-container").hide();
    $("#third-container").show();
    
    break;
    
    //Page 4 - Food result has been clicked
    case (4):
    
    break;
    
    
    
    default:
    break;
  }
}


//Name Cleaner Function - Converts upper to lower case and swaps spaces for hyphens:
function nameClean(textInput) {

 return textInput.replace(/\s+/g, "-").toLowerCase();

};

//Name UnCleaner Function - Converts hyphenated name to spaced name for pretty html use
function nameUnclean(textInput) {

 return textInput.replace("-", " ");

};
//MAIN FUNCTION
//==================================

$(document).ready(function () {
  //On document ready the radio buttons will be visible and the table that the API properties will populate will remain hidden.
  //NOTE: Switch these default show/hide methods to CSS set display to none after funcitonality problem is fixed.

  //Show hide containers
  showHideSwitch(1);

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAG3W2hu-w6A91MAS41_ursXlSyXf4W6Kk",
    authDomain: "movie-food-database.firebaseapp.com",
    databaseURL: "https://movie-food-database.firebaseio.com",
    projectId: "movie-food-database",
    storageBucket: "",
    messagingSenderId: "815938672043"
  };

  //Global Vars
  //=================================

  firebase.initializeApp(config);

  //Used for firebase
  var database;
  var refMovies;
  var addedFood;
  var uniqueToggle = false;

  //set database to the firebase database
  database = firebase.database();


  //Firebase Events
  //======================

  //On Click event for movie list line-item
  $("body").on("click", ".movie-item", function () {

    //Show/Hide Containers
    showHideSwitch(3);

    //Get name of movie from movie data attribute
    var movieName = $(this).attr("data-name");

    //Set the add-food button data attribute = to this same name (changes the button every time a movie is pressed)
    $("#add-food-submit").attr("data-name", movieName);

    //Get Target Firebase Location- we want the specific movie
    refMovies = database.ref("movies/" + movieName);

    refMovies.once("value")
      .then(function (snapshot) {
        var a = snapshot.exists(); // true
        if (!a) {

          //Clear container
          //There aren't any movies listed
          //Create HTML Object to contain the food item
          var foodListItem = $("<li>");
          foodListItem.text("Be the first to add a munchie to this movie!")

        } else {

          //Firebase function - call firebase and spit out food data onto the page for THIS movie
          refMovies.on('value', pullFirebaseData, firebaseErrorData);

        }
      });


  });

  //ADDING NEW FOOD ITEM TO FIREBASE (FORM SUBMIT)

  $("body").on("click", "#add-food-submit", function(event) {
    event.preventDefault();

    uniqueToggle = false;

    //Get Form Input Value
    var $foodInput = $("#add-food-input");

    //Get current moviename from submit button (was passed here after clicking a movie name)
    var movieName = $("#add-food-submit").attr("data-name");

    //Get input text from form
    addedFood = $foodInput.val();

    //Clear out form text input after submitting
    $foodInput.val("");

    //Shape the data we want to push to Firebase
    var foodData = {
      food: nameClean(addedFood)
    }

    //Get Target Firebase Location- we want the specific movie object
    var refMovies = database.ref('movies/' + movieName);

    //Check database to make sure food isn't already added
    refMovies.on("value", checkForDuplicateFood, firebaseErrorData);

    if (uniqueToggle) {
      console.log("it's unique!");
      //Push Food info to Specific Movie location in Firebase
      refMovies.push(foodData);
      //Clear and refresh the current food list
      refMovies.on("value", pullFirebaseData, firebaseErrorData);
    } else {
      console.log("That food has already been added!");
      //create a bootstrap alert at top of page notifying user that the input food already exists
    }

    //Testing to see if this movie has a database entry at all- and pushing data to it if not.
    //Check if database entry exists
    refMovies.once("value")
      .then(function (snapshot) {
        var a = snapshot.exists(); // true
        if (!a) {
          refMovies.push(foodData);
          refMovies.on('value', pullFirebaseData, firebaseErrorData);
        }
      });
  });

  //Get list of foods from Firebase! (data parameter is a reference to the Firebase )
  //==================================
  function pullFirebaseData(data) {
    //Clear out the food list container each time this function is called
    $("#food-list").empty();

    //Retrieve Firebase food data for the specific movie that was passed into the function
    var foodObject = data.val();
    var keys = Object.keys(foodObject);

    //Append food items to html and local array
    for (var i = 0; i < keys.length; i++) {
      //Get object key (there is always key above the data we want)
      var k = keys[i];
      //Get the specific food value at this key
      var foodItem = foodObject[k].food;
  
      //Create HTML Object to contain the food item
      var $newRow = $("<tr>");
      var $foodListItem = $("<td>");

      //Adds Selector Class for Page 4 Recipe API On Click Event and bootstrap class for capitalizing the 'cleaned/uncleaned' food data
      $foodListItem.addClass("food-item text-capitalize");

      //Adds attribute for use in pg 4 recipe api call- it's 'cleaned'
      $foodListItem.attr("data-name", nameClean(foodItem));

      //Append to html food list container- use unclean version (swap hyphens for spaces)
      $foodListItem.text(nameUnclean(foodItem));


      $newRow.append($foodListItem);
      $("#food-list").append($newRow);
    }
  }

  //Check if item exists in Firebase food list
  //===========================================
  function checkForDuplicateFood(data) {
    console.log("checking for duplicates...");
    console.log("Input food was: ", addedFood);
    //Retrieve Firebase food data for the specific movie that was passed into the function
    var foodObject = data.val();
    var keys = Object.keys(foodObject);

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var foodItem = foodObject[k].food;
      console.log("current food item", foodItem);
      if (nameClean(addedFood) == foodItem) {
        console.log("A:", addedFood);
        console.log("B:", foodItem);
        uniqueToggle = false;
        return;
      }
    }
    uniqueToggle = true;
  }

  //Firebase Error Function
  function firebaseErrorData(err) {
    console.log("Error!");
    console.log(err);
  }

  //MOVIE REQUEST API
  //=============================================

  // when form is submitted the API call will be made

  $(".search-form").on("submit", function(event) {
    event.preventDefault();
    $("tbody").empty();
    var search = getSearchValue();
    doSearch(search);
  });
});


//Global API/Search functions that feed into the $(".search-form").on("submit") event handler.
//=======================================================
function doSearch(search) {
  var queryURL = getQueryURL(search);
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(populateTable);
}

function populateTable(searchResponse) {
  //show hide containers
  showHideSwitch(2);

  $("#search-again-input").val("");

  var data = searchResponse.Search;
  var limitedData = data.slice(0, 5);
  for (i = 0; i < limitedData.length; i++) {
    console.log(data[i]);
    fetchMovieDetails(limitedData);
  }
}

function fetchMovieDetails(limitedData) {
  var exactSearch = limitedData[i].Title;
 
  var limitURL =
    "https://www.omdbapi.com/?t=" +
    exactSearch +
    "&y=&plot=short&apikey=" +
    apiKey;
  console.log(limitURL);
  $.ajax({
    url: limitURL,
    method: "GET"
  }).then(populateMovieRow);
}
function populateMovieRow(titleResponse) {
  var $newMovie = $("<tr>");

   //prepping the data to go into firebase database with hyphens instead of spaces in movie titles
  var titleClean=titleResponse.Title;
  titleClean = titleClean.replace(/\s+/g, "-").toLowerCase();
  console.log(titleClean);
  $newMovie.addClass("movie-item").attr("data-name", titleClean);

  //filling in the columns with the relevant information from each object in the limitedData array
  $newMovie
    .append(`<td scope="row">${titleResponse.Title}</td>`)
    .append(`<td scope="row">${titleResponse.Plot}</td>`)
    .append(`<td scope="row"><img src=${titleResponse.Poster}></td>`);
  $("tbody").append($newMovie);
  //Writing this code out in case we get to the reverse search features
  // var newRecipe = $("<tr>");
  // newRecipe
  //   .append(`<td scope="row">${data}</td>`)
  //   .append(`<td scope="row">${data}</td>`)
  //   .append(`<td scope="row"><img src=${data}></td>`);
  // $("tbody").prepend(newRecipe);
}

function getQueryURL(search) {
  var omdbURL = "https://www.omdbapi.com/?s=" + search + "&apikey=" + apiKey;
  var edamamURL = "";
  var queryURL = "";
  // The API called is dependent on whether the movie radio id ("#customerRadioInLine1") or the food radio id ("#customRadioInline2") is selected.
  if ($("#customRadioInline1").is(":checked")) {
    queryURL = omdbURL;
  } else if ($("#customRadioInline2").is(":checked")) {
    queryURL = edamamURL;
  } else {
    //form validation
    $(".search-clear").html("Please select movie or food");
  }
  return queryURL;
}

function getSearchValue() {
  var search;
  var isVisible = $("#second-search-form").is(":visible");
  //this logic decides which search input to grab values from for the API call
  if (isVisible) {
    search = $("#search-again-input").val();
  } else {
    search = $("#search-input").val();
  }
  return search;
}
