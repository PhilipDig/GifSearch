// Scrape topics from 10 trending gif titles for topics, exclude "GIF by ..." string
// NOTE: initial 10 topics are just placeholders if the proceeding trending request fails
let defaultTopics = ["sports", "emoji", "meme", "action", "sticker", "fail", "sleep", "smile", "dance", "gift"]
let topics = defaultTopics

// Function to redraw topics from array
function displayTopicButtons() {

    $("#trendingButtons").empty()

    topics.forEach(function (gifTitle) {
        $("#trendingButtons").append($(`<label class="btn btn-primary gifButton" value="${gifTitle}"><input type="radio" autocomplete="off">${gifTitle}</label>`))
    })
}

displayTopicButtons()

$.ajax({
    url: "https://api.giphy.com/v1/gifs/trending?api_key=qQTSneMABDp0TnSFY1GRlDzUoivH4fa5&limit=10&rating=PG-13",
    method: "GET"
}).then(function (response) {

    // If response status is successful
    if (response.meta.status == 200) {

        // Remove default topics
        topics = []

        response.data.forEach(function (gifObject, index) {

            let title = gifObject.title

            // Remove boiler plate from title and add it to array for button labels
            let boilerPlateIndex = title.search("GIF")

            // If title does not contain GIF, the whole title with by shown
            if (boilerPlateIndex != -1) {

                title = title.slice(0, boilerPlateIndex).trim()
            }

            // Add title to topic array, use default if trending GIF did not have a title
            if (title != "") {
                topics.push(title)
            } else {
                topics.push(defaultTopics[index])
            }

        })

        // Populate trending GIF topic buttons
        displayTopicButtons()

    } else {
        alert("Trending GIF topic search failed: " + response.meta.message)
    }
});

// Display 10 GIFs with the selected topic when user clicks the button
$(document.body).on("click", ".gifButton", function () {

    $.ajax({
        url: `https://api.giphy.com/v1/gifs/search?api_key=qQTSneMABDp0TnSFY1GRlDzUoivH4fa5&q=${this.getAttribute("value")}&limit=10&offset=0&rating=PG-13&lang=en`,
        method: "GET"
    }).then(function (response) {

        if (response.meta.status == 200) {

            // Clear any previously displayed GIFS
            $("#displayedGIFs").empty()

            response.data.forEach(function (gifObject) {

                // Append results to displayed GIFS with still images shown by default
                let stillUrl = gifObject.images.fixed_height_still.url
                let animateUrl = gifObject.images.fixed_height.url
                $("#displayedGIFs").append($(`<div class="gifDiv col-sm-12"><img src=${stillUrl} data-state="still" data-animate=${animateUrl} data-still=${stillUrl} alt=${gifObject.title} class="gif"><p>${gifObject.rating}</p></div>`))
            })

        } else {
            alert("Gif search failed: " + response.meta.message)
        }
    })
})

// Grabbed this code from the pausing GIFs activity ;)
$(document.body).on("click", ".gif", function () {
    // The attr jQuery method allows us to get or set the value of any attribute on our HTML element
    var state = $(this).attr("data-state");
    // If the clicked image's state is still, update its src attribute to what its data-animate value is.
    // Then, set the image's data-state to animate
    // Else set src to the data-still value
    if (state === "still") {
        $(this).attr("src", $(this).attr("data-animate"));
        $(this).attr("data-state", "animate");
    } else {
        $(this).attr("src", $(this).attr("data-still"));
        $(this).attr("data-state", "still");
    }
});

// Handler to add a new topic
$(document.body).on("click", ".submitButton", function (event) {

    event.preventDefault()

    let topic = $("#addGifTopic").val()
    // Make sure submission is not empty or already in array to prevent duplicate buttons
    if (topic && !topics.includes(topic)) {

        topics.push(topic)
        displayTopicButtons()
    }
})