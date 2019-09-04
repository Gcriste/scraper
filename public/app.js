$(document).ready(function(){



    function displayArticles(){
      $.getJSON("/articles", function(data) {

        for (var i = 0; i < data.length; i++) {
  
          var panelDiv = $("<div>")
          panelDiv.attr("id", data[i]._id)
          panelDiv.addClass("panel panel-default")
  
          var panelHeading = $("<div class='panel-heading' ></div>")
  
          var panelTitle = $("<h3 class='panel-title' ></h3>")
          
          
          var newATag = $("<a class='article-title'>");
          newATag.attr("target", "_blank")
          newATag.attr("href", data[i].url)
          newATag.text(data[i].headline)
  
          panelTitle.append(newATag)
          panelHeading.append(panelTitle)
          panelDiv.append(panelHeading)
  
          panelDiv.append(data[i].summary)
        

          if (data[i].isSaved){
  
          //create a delete button
            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-warning delete-button'>" + "Delete Article" + "</button>");
            // create a note button
            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-success note-button'>" + "Article Notes" + "</button>");
            // append to the div with id saved-articles (in saved page)
            $("#saved-articles").append(panelDiv)
          }
          // if it is not saved
          else{      
  
          //create a save button
            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-primary save-button'>" + "Save Article" + "</button>");
            // append to the div with id articles (in index page)
            $("#articles").append(panelDiv)
          
          }
  
        }
      });
    }
  
  

    displayArticles();
  
  
    $(document).on("click", ".note-button", function() {
      

      var thisId = $(this).attr("data-id");
      console.log(thisId)

      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })

      .then(function(data) {
        console.log(data);
  
        $("#noteModalLabel").empty()
        $("#noteModalBody").empty()
        $("#noteModalLabel").append(data.headline +"<br> <textarea class='form-control' id='titleinput' rows='2' placeholder='Note Title'></textarea>")
        $("#noteModalBody").append("<textarea class='form-control' id='bodyinput' rows='6' placeholder='Note Body'></textarea>")
  

        $("#savenote").attr("data-id", data._id)
    
        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
  
        $("#noteModal").modal("show");
  
      });
    });
  
  
  
    $(document).on("click", "#savenote", function() {
      var thisId = $(this).attr("data-id");
  
      console.log(thisId)
      console.log($("#titleinput").val())
  
     
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $("#titleinput").val(),
          body: $("#bodyinput").val()
        }
      })
      .then(function(data) {

        console.log(data);
          
      });

      $("#titleinput").val("");
      $("#bodyinput").val("");
    });
  
  
    $(document).on("click", "#scrape-button", function(){
      $.ajax({
        method: "GET",
        url: "/scrape" 
        
      }).then(function(data) {

        console.log("hello")
        console.log(data);
  
        
        displayArticles()
  
        $("#scrapeModalLabel").text("You successfully scraped new articles")
        $("#scrapeModalBody").text("Woohoo!")
  
        $("#scrapeModal").modal("show");
  
      });
    });
  
  
    $(document).on("click", ".save-button", function(){
      console.log(this)
  
      var id = ($(this).attr("data-id"));
      $.ajax({
        method: "PUT",
        url: "/articles/" + id
        
      })
  
        .then(function(data) {
          // Log the response
          console.log(data);
  
 
          $("#" + id).remove();
         
        });
    });
  
  
    $(document).on("click", ".delete-button", function(){
      console.log(this)
  
      var id = ($(this).attr("data-id"));
      $.ajax({
        method: "DELETE",
        url: "/articles/" + id
        
      }).then(function(data) {

        console.log("hello")
        console.log(data);
  
        $("#" + id).remove();
       
      });
    });
  
  
  })
  