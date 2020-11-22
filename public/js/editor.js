var file_name;
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

  //getFile name
  file_name = file.name;

  //load the filerLoader web api to read the file content stored on user computer
  var fileReader = new FileReader();

  //as file reader is loaded get the file content as result object
  fileReader.onload = function () {
    var typedarray = new Uint8Array(this.result);
    //save name/file content in global url var
    url = typedarray;
    //render the pdf
    PDFJS.getDocument(url)
      .then(function (pdf) {

        // Get div#container and cache it for later use
        var container = document.getElementById("container");
        //pdffactory get current cords
        
        // Loop from 1 to total_number_of_pages in PDF document
        for (var i = 1; i <= pdf.numPages; i++) {

          // Get desired page
          pdf.getPage(i).then(function (page) {

            var scale = 1.5;
            var viewport = page.getViewport(scale);
            var div = document.createElement("div");

            // Set id attribute with page-#{pdf_page_number} format
            div.setAttribute("id", "page-" + (page.pageIndex + 1));

            // This will keep positions of child elements as per our needs
            div.setAttribute("style", "position: relative");

            // Append div within div#container
            container.appendChild(div);

            // Create a new Canvas element
            var canvas = document.createElement("canvas");

            // Append Canvas within div#page-#{pdf_page_number}
            div.appendChild(canvas);

            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
              canvasContext: context,
              viewport: viewport
            };

            // Render PDF page
            page.render(renderContext)
              .then(function () {
                // Get text-fragments
                return page.getTextContent();
              })
              .then(function (textContent) {
                // Create div which will hold text-fragments
                var textLayerDiv = document.createElement("div");

                // Set it's class to textLayer which have required CSS styles
                textLayerDiv.setAttribute("class", "textLayer");

                // Append newly created div in `div#page-#{pdf_page_number}`
                div.appendChild(textLayerDiv);

                // Create new instance of TextLayerBuilder class
                var textLayer = new TextLayerBuilder({
                  textLayerDiv: textLayerDiv,
                  pageIndex: page.pageIndex,
                  viewport: viewport
                });

                // Set text-fragments
                textLayer.setTextContent(textContent);

                // Render text-fragments
                textLayer.render();
              });
          });
        }
      
      });


       //Annotatorjs code
       var pageUri = function () {
        return {
            beforeAnnotationCreated: function (ann) {
                ann.uri = window.location.href;
            }
        };
    };
    
    var app = new annotator.App()
        .include(annotator.ui.main, {element: document.body})
        .include(annotator.storage.http, {prefix: 'http://localhost:3000/api',
      urls:{
        create:`/annotations/${file_name}`,
        search:`/search/${file_name}`
      }
      })
        .include(pageUri);
    
    app.start()
       .then(function () {
           app.annotations.load({uri: window.location.href});
       });
  
      //Annotator ends here
  };


  //read the file as a bufferarray
  fileReader.readAsArrayBuffer(file);
});