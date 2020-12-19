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
            //show a loader while text layer renders
            $('.loader').show();
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

                  //custom module
                  Annotator.Plugin.annotationCreation = function (element, options) {
                    var myPlugin = {};
                    myPlugin.pluginInit = function () {
                      // This annotator instance
                      this.annotator
                        // LOADING
                        .subscribe("annotationsLoaded", function (annotations) {
                          console.log("annotationsLoaded called when the annotations have been loaded.");

                          //create element that display total annotations
                          $('.left').append(`<h6 class='annotationHeading'><span class='annotation_number'>${annotations.length}</span> Annotations:</h6>`)
                          $('.right').append(`<h6>Tags:</h6>`)
                          //create element and add it to frontend
                          for (let i = 0; i < annotations.length; i++) {

                            $('.left').append(`<p class='annotation ${annotations[i].quote}'>${annotations[i].text}</p>`)
                            for (let x = 0; x < annotations[i].tags.length; x++) {
                              console.log(annotations[i].id);
                              annotations[i].tags[x] == undefined ? '' : $('.right').append(`<p class='tag ${annotations[i].quote}'>${annotations[i].tags[x]}</p>`);
                            }
                          }
                        })

                        // // CREATE
                        // .subscribe("beforeAnnotationCreated", function (annotation) {
                        //   console.log("beforeAnnotationCreated called immediately before an annotation is created. If you need to modify the annotation before it is saved use this event.");
                        //   console.log(annotation);
                        // })
                        .subscribe("annotationCreated", function (annotation) {
                          //console.log("annotationCreated called when the annotation is created use this to store the annotations.");

                          
                          //create a new annotation
                          $('.left').append(`<p  class='annotation ${annotation.quote}'>${annotation.text}</p>`)
                          //create a new tag
                          annotation.tags.length == 0 ? '' : $('.right').append(`<p class='tag ${annotation.quote}'>${annotation.tags}</p>`);

                          //update annotation length object
                          let counter = Number($('.annotation_number').text()) + 1;
                          //create element that display total annotations
                          document.getElementsByClassName('annotation_number')[0].innerText = `${counter}`

                        })

                        //UPDATE
                        .subscribe("beforeAnnotationUpdated", function (annotation) {
                          //console.log("beforeAnnotationUpdated as annotationCreated, but just before an existing annotation is saved.");
                          //console.log(annotation);
                          $(`.${annotation.quote}`).html(`<div class='${annotation.quote}'>${annotation.text}</div>`);
                          //create a new tag
                          annotation.tags.length == 0 ? '' : $('.right').append(`<p class='tag ${annotation.quote}'>${annotation.tags}</p>`);
                          console.log(annotation.text);
                        })
                        // .subscribe("annotationUpdated", function (annotation) {
                        //   //after annotation updated
                        // })

                        // DELETE
                        .subscribe("annotationDeleted", function (annotation) {
                          //hide annotation
                          $(`.${annotation.quote}`).hide();
                          //update annotation length object
                          let counter = Number($('.annotation_number').text()) - 1;
                          //create element that display total annotations
                          document.getElementsByClassName('annotation_number')[0].innerText = `${counter}`
                        })

                      // VIEWER
                      // .subscribe("annotationViewerShown", function (viewer, annotations) {
                      //   console.log("annotationViewerShown called when the annotation viewer is shown and provides the annotations being displayed.");
                      //   console.log(viewer);
                      //   console.log(annotations);
                      // })
                      // .subscribe("annotationViewerTextField", function (field, annotation) {
                      //   console.log("annotationViewerTextField called when the text field displaying the annotation comment in the viewer is created.");
                      //   console.log(field);
                      //   console.log(annotation);
                      // })

                      // EDITOR
                      // .subscribe("annotationEditorShown", function (editor, annotation) {
                      //   console.log("annotationEditorShown called when the annotation editor is presented to the user.");
                      //   console.log(editor);
                      //   console.log(annotation);
                      // })
                      // .subscribe("annotationEditorHidden", function (editor) {
                      //   console.log("annotationEditorHidden called when the annotation editor is hidden, both when submitted and when editing is cancelled.");
                      //   console.log(editor);
                      // })
                      // .subscribe("annotationEditorSubmit", function (editor, annotation) {
                      //   console.log("annotationEditorSubmit called when the annotation editor is submitted.");
                      //   console.log(editor);
                      //   console.log(annotation);
                      // })


                    };
                    return myPlugin;
                  };




                  var content = $('#container').annotator()

                  // Add your plugin.
                  content.annotator('addPlugin', 'annotationCreation' /*, any other options */ );

                  //User search bar
                  content.annotator('addPlugin', 'Filter', {
                    filters: [{
                      label: 'Quote',
                      property: 'quote'
                    }]
                  });
                  //Tags plugin
                  content.annotator('addPlugin', 'Tags');
                  content.annotator('addPlugin', 'Store', {
                    // The endpoint of the store on your server.
                    prefix: "http://localhost:3000/api",
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
                  //hide a loader while text layer renders completly
                  $('.loader').hide();
                  //End Anotatorjs
                  //Add annotations and tags on sidebars 
                  // axios.get(`/api/search/${window.btoa(file_name)}`)
                  //   .then(response => {
                  //     let {
                  //       total,
                  //       rows
                  //     } = response.data;
                  //     //create element that display total annotations
                  //     $('.left').append(`<h6 class='annotationHeading'>${total} Annotations:</h6>`)
                  //     $('.right').append(`<h6>Tags:</h6>`)
                  //     //create element and add it to frontend
                  //     for (let i = 0; i < rows.length; i++) {

                  //       $('.left').append(`<p class='annotation'>${rows[i].text}</p>`)
                  //       for (let x = 0; x < rows[i].tags.length; x++) {
                  //         rows[i].tags[x] == undefined ? '' : $('.right').append(`<p class='tag'>${rows[i].tags[x]}</p>`);
                  //       }
                  //     }
                  //   }).catch(err => console.log(err));
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