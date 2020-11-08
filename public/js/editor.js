//load the doc
//current page/inital page will always be 1
var current = 1;
var url = undefined;
//add event listener to listen for any file upload
document.querySelector("#pdf-upload").addEventListener("change", function (e) {
    //get the first ulpoaded file
    var file = e.target.files[0]
    if (file.type != "application/pdf") {
        console.error(file.name, "is not a pdf file.")
        $('.container').append(`<div class="alert alert-primary" role="alert">
        ${file.name}, is not a pdf file, Please re-load choose again!
      </div>`)
        return
    }

    //load the filerLoader web api to read the file content stored on user computer
    var fileReader = new FileReader();

    //as file reader is loaded get the file content as result object
    fileReader.onload = function () {
        var typedarray = new Uint8Array(this.result);
        //save name/file content in global url var
        url = typedarray;
        //render the pdf
        var LoadingTask = pdfjsLib.getDocument(typedarray);
        LoadingTask.promise.then(function (pdf) {
            // you can now use *pdf* here
            pdf.getPage(current).then(function (page) {
            
                var scale = 2;
                var viewport = page.getViewport({
                    scale: scale,
                });

                var canvas = document.getElementById('the-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext).promise.then(function() {
                    // Returns a promise, on resolving it will return text contents of the page
                    return page.getTextContent();
                }).then(function(textContent) {
                     // PDF canvas
                    var pdf_canvas = $("#the-canvas"); 
                
                    // Canvas offset
                    var canvas_offset = pdf_canvas.offset();
                
                    // Canvas height
                    var canvas_height = pdf_canvas.get(0).height;
                
                    // Canvas width
                    var canvas_width = pdf_canvas.get(0).width;
                
                    // Assign CSS to the text-layer element
                    $("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: canvas_height + 'px', width: canvas_width + 'px' });
                
                    // Pass the data to the method for rendering of text over the pdf canvas.
                    PDFJS.renderTextLayer({
                        textContent: textContent,
                        container: $("#text-layer").get(0),
                        viewport: viewport,
                        textDivs: []
                    });
                });
            });

        });

    };

    //read the file as a bufferarray
    fileReader.readAsArrayBuffer(file);
})

//render page based on number of page
//load previous or next pages
function render(){
    var LoadingTask = pdfjsLib.getDocument(url);
    LoadingTask.promise.then((pdf) => {
        pdf.getPage(current).then(function (page) {
            var scale = 1;
            var viewport = page.getViewport({
                scale: scale,
            });

            var canvas = document.getElementById('the-canvas');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext).promise.then(function() {
                // Returns a promise, on resolving it will return text contents of the page
                return page.getTextContent();
            }).then(function(textContent) {
                 // PDF canvas
                var pdf_canvas = $("#the-canvas"); 
            
                // Canvas offset
                var canvas_offset = pdf_canvas.offset();
            
                // Canvas height
                var canvas_height = pdf_canvas.get(0).height;
            
                // Canvas width
                var canvas_width = pdf_canvas.get(0).width;
            
                // Assign CSS to the text-layer element
                $("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: canvas_height + 'px', width: canvas_width + 'px' });
            
                // Pass the data to the method for rendering of text over the pdf canvas.
                PDFJS.renderTextLayer({
                    textContent: textContent,
                    container: $("#text-layer").get(0),
                    viewport: viewport,
                    textDivs: []
                });
            });
        });
    }).catch(err => console.log(err.message));
}

//next page
function next() {
   if(current >= 1){
    current++;
    render();
   }else{
       return;
   }
}

//previous page
function previous() {
    render();
    current--;
}



