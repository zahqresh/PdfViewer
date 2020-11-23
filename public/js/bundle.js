(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var file_name;
var pdf_pages;
let x = [];
var scale_val;
var hideLoader = false;
//add event listener to listen for any file upload
document.querySelector("#pdf-upload").addEventListener("change", function (e) {
  //get the first ulpoaded file
  var file = e.target.files[0];
  scale_val = $(this).attr("data-scale");
  if (scale_val == 'undefined') {
    scale_val = 1.5; //set default scale if somehow it fails
  }
  if (file.type != "application/pdf") {
    console.error(file.name, "is not a pdf file.")
    $('.container').append(`<div class="alert alert-primary" role="alert">
        ${file.name}, is not a pdf file, Please re-load choose again!
      </div>`)
    return
  }


  console.log(scale_val);



  //getFile name
  file_name = file.name;
  //load the filerLoader web api to read the file content stored on user computer
  var fileReader = new FileReader();
  //as file reader is loaded get the file content as result object
  fileReader.onload = function () {
    var typedarray = new Uint8Array(this.result);
    //save name/file content in global url var
    url = typedarray;
    renderPDF(url);

  };
  //read the file as a bufferarray
  fileReader.readAsArrayBuffer(file);
});






//render the pdf
function renderPDF(url) {
  //render the pdf
  PDFJS.getDocument(url)
    .then(function (pdf) {
      // Get div#container and cache it for later use
      var container = document.getElementById("container");
      //Save total number of page to use in if-else and execute annotator when last txt layer renders
      pdf_pages = pdf.numPages;
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


              //push i of for loop into array because need to execute annotator when last text layer is render
              //foor loop dont wait so this is how we determine the counter
              x.push(i);

              //annotaorjs needs to be here and init while text layers are renderd

              if (x.length == pdf_pages) {
                var pageUri = function () {
                  return {
                    beforeAnnotationCreated: function (ann) {
                      ann.uri = window.location.href;
                    }
                  };
                };

                var app = new annotator.App()
                  .include(annotator.ui.main, {
                    element: document.body
                  })
                  .include(annotator.storage.http, {
                    prefix: 'http://localhost:3000/api',
                    urls: {
                      create: `/annotations/${file_name}`,
                      search: `/search/${file_name}`
                    }
                  })
                  .include(pageUri);

                app.start()
                  .then(function () {
                    app.annotations.load({
                      uri: window.location.href
                    });
                  });

                hideLoader = true;
                //show loader when doc starts rendering
                if (hideLoader) {
                  $('.loader').hide();
                }
              }
              //annotator ends here



            });
        });

      }
      //show loader when doc starts rendering
      if (hideLoader == false) {
        $('.loader').show();
      }
    });
}
},{}]},{},[1]);
