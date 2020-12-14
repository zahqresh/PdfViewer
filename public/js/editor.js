var url,
  file_name,
  Pages = [],
  totalPages,
  UUID;
document.getElementById('pdf-upload').onchange = function (event) {


  var file = event.target.files[0];
  file_name = file.name;
  //Read the file locally using file reader
  var fileReader = new FileReader();
  fileReader.onload = function () {
    var typedarray = new Uint8Array(this.result);
    url = typedarray;
    // Render PDF
    PDFJS.getDocument(url)
      .then(function (pdf) {

        //Save total pages number so we could use it to render annotations when last text layer renders
        totalPages = pdf.numPages;


        // Get div#container and cache it for later use
        var container = document.getElementById("container");

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
            page.render(renderContext).then(function () {
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

                //Start the annotator when last page renders so multiple time same annotations dont get render
                Pages.push(i);
                if (Pages.length + 1 == totalPages) {
                  //Start annotatorjs





                  var content = $('#container').annotator()
                  //User search bar
                  content.annotator('addPlugin', 'Filter', {
                    filters: [
                      {
                        label: 'Quote',
                        property: 'quote'
                      }
                    ]
                  });
                  //Tags plugin
                  content.annotator('addPlugin', 'Tags');
                  content.annotator('addPlugin', 'Store', {
                    // The endpoint of the store on your server.
                    prefix: "https://pdfviewer101.herokuapp.com/api",
                    urls: {
                      create: `/annotations/${window.btoa(file_name)}`,
                      search: `/search/${window.btoa(file_name)}`
                    },

                    

                    // This will perform a "search" action when the plugin loads. Will
                    // request the last 20 annotations for the current url.
                    // eg. /store/endpoint/search?limit=20&uri=http://this/document/only
                    loadFromSearch: {
                      'uri': `/search/${window.btoa(file_name)}`
                    }
                  });




















                  // var pageUri = function () {
                  //   return {
                  //     beforeAnnotationCreated: function (ann) {
                  //       ann.uri = window.location.href;
                  //     }
                  //   };
                  // };

                  // var app = new annotator.App()
                  // app.include(annotator.ui.main, {
                  //   editorExtensions: [annotator.ui.tags.editorExtension],
                  //   viewerExtensions: [
                  //     annotator.ui.markdown.viewerExtension,
                  //     annotator.ui.tags.viewerExtension
                  //   ]
                  // });
                  // app.include(annotator.storage.http, {
                  //   prefix: "https://pdfviewer101.herokuapp.com/api",
                  //   urls: {
                  //     create: `/annotations/${window.btoa(file_name)}`,
                  //     search: `/search/${window.btoa(file_name)}`
                  //   }
                  // })
                  // app.include(pageUri);
                  // app.start()
                  //   .then(function () {
                  //     app.annotations.load({
                  //       uri: window.location.href
                  //     });
                  //   });
                  //End Anotatorjs
                }

              });
          });
        }
      });

  };

  // Read the file into array buffer.
  fileReader.readAsArrayBuffer(file);
}

//annotatorjs needs to be inside text layer promise to work and need to run when the last page text layer is render
//this way it will apply annotations