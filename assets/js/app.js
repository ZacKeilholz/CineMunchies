//Global Vars
//=================================

//Jquery HTML Targets
//=================================

//MAIN FUNCTION
//==================================


$(document).ready(function () {
  //On document ready the radio buttons will be visible and the table that the API properties will populate will remain hidden.
 
  //NOTE: Switch these default show/hide methods to CSS set display to none after funcitonality problem is fixed. 
  $("#first-page-search").show();
  $("#second-page-search,#third-container,#movie-results-container").hide();

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

  //JQuery Events / Event Listeners
  //=================================

  //Firebase Events
  //======================

  //On Click event for movie list line-item
  $("body").on("click", ".movie-item", function () {

    //Get name of movie from movie data attribute
    var movieName = $(this).attr("data-name");

    //Set the add-food button data attribute = to this same name (changes the button every time a movie is pressed)
    $("#submit-button").attr("data-name", movieName);

    //Get Target Firebase Location- we want the specific movie
    refMovies = database.ref('movies/' + movieName);

    //Firebase function - call firebase and spit out food data onto the page for THIS movie
    refMovies.on('value', pullFirebaseData, firebaseErrorData);

  });

  //ADDING NEW FOOD ITEM TO FIREBASE (FORM SUBMIT)

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
      food: addedFood
    }

    //Get Target Firebase Location- we want the specific movie object 
    var refMovies = database.ref('movies/' + movieName);


    //Check database to make sure food isn't already added
    refMovies.on('value', checkForDuplicateFood, firebaseErrorData);

    if (uniqueToggle) {
      console.log("it's unique!");
      //Push Food info to Specific Movie location in Firebase
      refMovies.push(foodData);
      //Clear and refresh the current food list
      refMovies.on('value', pullFirebaseData, firebaseErrorData);

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
      var foodListItem = $("<li>");
      foodListItem.addClass("food-item");

      //Append to html food list container
      foodListItem.text(foodItem);
      $("#food-list").append(foodListItem);
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
      if (addedFood == foodItem) {
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




  //NOTE: Switch these default show/hide methods to CSS set display to none after funcitonality problem is fixed.
  $("#first-page-search").show();
  $("#second-page-search,#third-container,#movie-results-container").hide();

  $("body").on("click", ".movie-item", function() {
    console.log("click");
    console.log($(this).attr("data-name"));
  });
  // when form is submitted the API call will be made


  $("#search-form").on("submit", function (event) {
    event.preventDefault();
    $("tbody").empty();
    var apiKey = "39a2a8a2";
<<<<<<< Updated upstream

    var $search = $(".search-input").val();
=======
    var $searchMain = $("#search-input").val();
    var $searchAgain=$("#search-again-input").val();
    var $search="";
    var $secondSearch=$("#second-search-form");
    var isVisible=$secondSearch.is(':visible');
    console.log($search);

    if(isVisible === true){
      $search=$searchMain;
    } else{
      $search=$searchAgain;
    }

>>>>>>> Stashed changes
    var omdbURL =
      "https://www.omdbapi.com/?t=" +
      $search +
      "&y=&plot=short&apikey=" +
      apiKey;

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

      $("#first-page-search").hide();
      $("#second-page-search,#movie-results-container").show();
      var data = response;
      console.log(data);

      //this conditional is in preparation for future reverse search functionality
      if ((queryURL = omdbURL)) {
        var $newMovie = $("<tr>");
        var titleClean=data.Title;
        titleClean=titleClean.replace(/\s+/g,"-").toLowerCase();
        console.log(titleClean);
        $newMovie.addClass("movie-item").attr("data-name",titleClean);


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
