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

    //Page 3 - Movie search result or trending movie  has been clicked
    case (3):
    console.log("HIDING PAGE 1-2");
      $("#first-page-search,#second-container").hide();
      $("#third-container").show();

      break;

    //Page 4 - Food result has been clicked
    case (4):
    console.log("HIDING PAGE 1-3");
    $("#first-page-search,#second-container,#third-container").hide();
    $("#fourth-container").show();
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

$(document).ready(function() {
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

  var trendingToggle = true;


  //set database to the firebase database
  database = firebase.database();


  //FIREBASE
  //======================

  //Firebase- TRENDING

  //Set Firebase Trending Database Location
  var refTrending = database.ref('trending/movies');

  //Create Event Listener for any changes in the Trending Database
  refTrending.on('value', retrieveFirebaseTrending, firebaseErrorData);

  //Uncomment this and use to remake database if trendData is deleted- (code will not function otherwise)..  Add this into a check function at some point:
  // var trendData = {
  //   movieName: "gladiator"
  // }
  // refTrending.push(trendData);


  //This function retrieves the last 10 movies that were searched for and subsequently clicked on from the Firebase/Trending folder in the database and then inserts them onto page 1 as table rows.  

  function retrieveFirebaseTrending(data) {

    // Clear out the trend list container each time this function is called
    $("#trend-list").empty();

    //Retrieve Firebase Movie trend data
    var trendObject = data.val();
    var keys = Object.keys(trendObject);

    //Grab length of the trend list for use in the for loop 
    var highKeysLength = (keys.length)-1;

    //For loop grabs searches from the END of the list and works back 10 items and displays them on page 1.  
    for (var i = highKeysLength; i > highKeysLength-10; i--) {
      console.log("keys!");
      var k = keys[i];
      //Get the specific food value at this key
      var trendItem = trendObject[k].movieName;

      //Create HTML Object to contain the food item
      var $newRow = $("<tr>");
      var $trendListItem = $("<td>");

      //Adds Selector Class for API On Click Event and bootstrap class for capitalizing the 'cleaned/uncleaned' trend data
      $trendListItem.addClass("trend-item text-capitalize");

      //Adds attribute for use in pg 4 recipe api call- it's 'cleaned'
      $trendListItem.attr("data-name", nameClean(trendItem));

      //Append to html food list container- use unclean version (swap hyphens for spaces)
      $trendListItem.text(nameUnclean(trendItem));

      $newRow.append($trendListItem);
      $("#trend-list").append($newRow);
    }
  }

  //MOVIE SEARCH RESULT OR FIREBASE TRENDING ITEM HAS BEEN CLICKED: 
  //================================================================

  $("body").on("click", ".movie-item,.trend-item", function () {
    console.log("MOVIE ITEM CLICKED");
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


    //Add clicked movie to Firebase Trending List (This also adds a clicked trend onto the trend list)
    trendData = {
      movieName: nameClean(movieName)
    }
    refTrending.push(trendData);

  });

  //ADDING NEW FOOD ITEM TO FIREBASE (FORM SUBMIT)
  //================================================

  $("body").on("click", "#add-food-submit", function (event) {
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
    };

    //Get Target Firebase Location- we want the specific movie object
    var refMovies = database.ref("movies/" + movieName);

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
    refMovies.once("value").then(function(snapshot) {
      var a = snapshot.exists(); // true
      if (!a) {
        refMovies.push(foodData);
        refMovies.on("value", pullFirebaseData, firebaseErrorData);
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

  //MOVIE REQUEST API EVENT HANDLER
  //=============================================

  // when form is submitted the API call will be made

  $(".search-form").on("submit", function (event) {
    event.preventDefault();
    // queryURL=omdbURL;
    $("#movie-results-tbody").empty();
    var search = getSearchValue();
    var omdbURL = "https://www.omdbapi.com/?s=" + search + "&apikey=" + apiKey;
    doMovieSearch(omdbURL);
  });
});

//EDAMAM RECIPE REQUEST API EVENT HANDLER
//==================================================
$("body").on("click", ".food-item", function() {
  search=$(this).attr("data-name");
  // queryURL=edamamURL;
  console.log("clicked the food list item");
  $("#recipe-results-tbody").empty();
  // var search = getSearchValue();
  var edamamURL = "https://api.edamam.com/search?q="+search+"&app_id=10d7528c&app_key=49ca2e4bece582180958e86e0b108257";
  console.log(nameUnclean(search));
  console.log(edamamURL);
  doFoodSearch(nameUnclean(edamamURL));




});

//List of Movie API Functions
//=======================================================
function doMovieSearch(url) {
  // var queryURL = getQueryURL(search);
  $.ajax({
    url: url,
    method: "GET"
  }).then(populateMovieTable);
}
// EDAMAM AJAX Call: Grab list of relevant foods
function doFoodSearch(url){
  // var queryURL = getQueryURL(search);
  $.ajax({
    url: url,
    method: "GET"
  }).then(populateRecipeTable);
}
//Limit the data from the first AJAX call and loop over each result
function populateMovieTable(searchResponse) {
  //show hide containers
  showHideSwitch(2);

  $("#search-again-input").val("");

  var movieData = searchResponse.Search;
  var limitedMovieList = movieData.slice(0, 5);
  for (i = 0; i < limitedMovieList.length; i++) {
    fetchMovieDetails(limitedMovieList);
  }
}
//Second OMDB AJAX Call: Grab properties to load into each row
function fetchMovieDetails(limitedMovieList) {
  var exactSearch = limitedMovieList[i].Title;

  var limitURL =
    "https://www.omdbapi.com/?t=" +
    exactSearch +
    "&y=&plot=short&apikey=" +
    apiKey;
  $.ajax({
    url: limitURL,
    method: "GET"
  }).then(populateMovieRow);
}
//Populate the movie rows
function populateMovieRow(limitedMovieList) {
  var $newMovie = $("<tr>");

  //prepping the data to go into firebase database with hyphens instead of spaces in movie titles

  $newMovie.addClass("movie-item").attr("data-name", nameClean(limitedMovieList.Title));


  //filling in the columns with the relevant information from each object in the limitedMovieList array
  $newMovie
    .append(`<td scope="row"><h1>${limitedMovieList.Title}</h1></td>`)
    .append(`<td scope="row"><p>${limitedMovieList.Plot}<p></td>`)
    .append(`<td scope="row"><img src=${limitedMovieList.Poster}></td>`);
  $("#movie-results-tbody").append($newMovie);
}
//List of Food API functions
//===============================================

function populateRecipeTable(recipeResponse) {
  //show hide containers
  showHideSwitch(4);
  console.log(recipeResponse);
  var recipeData = recipeResponse.hits;
  console.log(recipeData[1]);
  console.log(recipeData[1].recipe.label);


  for (i = 0; i < 5; i++) {
    // populateRecipeRow(recipeData[i]);

  var $newRecipe = $("<tr>");

  //prepping the data to go into firebase database with hyphens instead of spaces in movie titles
  var recipeName = recipeData[i].label;




  $newRecipe.addClass(".food-item").attr("data-name", recipeName);

  //filling in the columns with the relevant information from each object in the limitedMovieList array
  $newRecipe
    .append(`<td scope="row">${recipeData[i].recipe.label}</td>`)
    .append(`<td scope="row">${recipeData[i].recipe.url}</td>`)
    .append(`<td scope="row">${recipeData[i].recipe.source}</td>`)
    .append(`<td scope="row">${recipeData[i].recipe.healthLabels}</td>`)
    .append(`<td scope="row"><img src=${recipeData[i].recipe.image}></td>`)
  ;
  $("#recipe-results-tbody").append($newRecipe);
  }
  console.log(recipeName);
}

// function populateRecipeRow(recipeData[i]) {
  
// }
//================
// function getQueryURL(search) {
//   var omdbURL = "https://www.omdbapi.com/?s=" + search + "&apikey=" + apiKey;
//   var edamamURL = "https://api.edamam.com/search?q="+search+"&app_id=10d7528c&app_key=49ca2e4bece582180958e86e0b108257";
  
//   //The API called is dependent on whether the movie radio id ("#customerRadioInLine1") or the food radio id ("#customRadioInline2") is selected.
//   if ($("#customRadioInline1").is(":checked")) {
//     queryURL = omdbURL;
//   } else if ($("#customRadioInline2").is(":checked")) {
//     queryURL = edamamURL;
//   } else {
//     queryURL=edamamURL;
//     //form validation
//   }
//   return queryURL;
// }

function getSearchValue() {
  var search;
  var secondSearchVisible = $("#second-search-form").is(":visible");
  var movieFoodVisible= $("#movie-food-container").is(":visible");
  //this logic decides which search input to grab values from for the API call
  if (secondSearchVisible) {
    search = $("#search-again-input").val();
  } else if (movieFoodVisible){
   search=$(".food-item").attr("data-name");
  }else{
    search=$("#search-input").val();
  }
  return search;
}
